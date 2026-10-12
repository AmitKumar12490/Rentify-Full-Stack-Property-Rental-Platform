const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { buildPropertySearchText, generateEmbedding } = require("../services/embeddingService");
const { performSemanticSearch } = require("../services/semanticSearchService");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "properties" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const parseAmenities = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw.split(",").map(a => a.trim()).filter(Boolean);
    }
  }
  return [];
};

const addProperty = async (req, res) => {
  try {
    const { title, description, price, location, lat, lng, type, bhk, furnished, amenities } = req.body;

    let imageUrls = [];
    if (req.files) {
      for (let file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    const amenitiesList = parseAmenities(amenities);

    // Pre-calculate embedding for newly created property
    let embedding = undefined;
    try {
      const searchText = buildPropertySearchText({
        title,
        description,
        price: Number(price),
        location,
        type,
        bhk: Number(bhk),
        furnished,
        amenities: amenitiesList
      });
      embedding = await generateEmbedding(searchText);
    } catch (embErr) {
      console.warn("Embedding generation failed during property creation:", embErr.message);
    }

    const property = await Property.create({
      title,
      description,
      price: Number(price),
      location,
      coordinates: { lat: Number(lat), lng: Number(lng) },
      type,
      bhk: Number(bhk),
      furnished,
      images: imageUrls,
      amenities: amenitiesList,
      embedding,
      embeddingUpdatedAt: embedding ? new Date() : undefined,
      ownerId: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const { location, bhk, furnished, minPrice, maxPrice } = req.query;
    let query = {};

    if (location) query.location = { $regex: location, $options: "i" };
    if (bhk) query.bhk = Number(bhk);
    if (furnished) query.furnished = furnished;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).populate("ownerId", "name email phone");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("ownerId", "name email phone");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    const { title, description, price, location, lat, lng, type, bhk, furnished, amenities } = req.body;

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price !== undefined ? Number(price) : property.price;
    property.location = location || property.location;
    property.type = type || property.type;
    property.bhk = bhk !== undefined ? Number(bhk) : property.bhk;
    property.furnished = furnished || property.furnished;

    if (amenities !== undefined) {
      property.amenities = parseAmenities(amenities);
    }

    if (lat && lng) {
      property.coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        newImages.push(url);
      }
      property.images = newImages; 
    }

    // Refresh embedding on property updates
    try {
      const searchText = buildPropertySearchText(property);
      property.embedding = await generateEmbedding(searchText);
      property.embeddingUpdatedAt = new Date();
    } catch (embErr) {
      console.warn("Embedding refresh failed during property update:", embErr.message);
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    await property.deleteOne();
    res.json({ message: "Property removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handles RAG-powered semantic property search queries.
 * Validates search input, performs vector/hybrid scoring, and returns RAG recommendation.
 */
const semanticSearch = async (req, res) => {
  try {
    const rawQuery = req.body?.query !== undefined ? req.body.query : req.query?.query;
    const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
        results: [],
        count: 0
      });
    }

    if (query.length > 500) {
      return res.status(400).json({
        message: "Search query exceeds maximum limit of 500 characters",
        results: [],
        count: 0
      });
    }

    const limit = parseInt(req.body?.limit || req.query?.limit || 9, 10);
    const searchData = await performSemanticSearch(query, { limit });

    res.json(searchData);
  } catch (error) {
    console.error("Semantic search failed:", error);
    res.status(500).json({
      message: "Semantic search encounter an internal error",
      error: error.message,
      results: [],
      count: 0
    });
  }
};

module.exports = {
  addProperty,
  getProperties,
  getPropertyById,
  getOwnerProperties,
  updateProperty,
  deleteProperty,
  semanticSearch
};
