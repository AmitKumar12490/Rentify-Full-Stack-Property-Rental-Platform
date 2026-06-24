const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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

const addProperty = async (req, res) => {
  try {
    const { title, description, price, location, lat, lng, type, bhk, furnished } = req.body;

    let imageUrls = [];
    if (req.files) {
      for (let file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
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

    const { title, description, price, location, lat, lng, type, bhk, furnished } = req.body;

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price || property.price;
    property.location = location || property.location;
    property.type = type || property.type;
    property.bhk = bhk || property.bhk;
    property.furnished = furnished || property.furnished;

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

module.exports = { addProperty, getProperties, getPropertyById, getOwnerProperties, updateProperty, deleteProperty };
