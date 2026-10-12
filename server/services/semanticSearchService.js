const Property = require("../models/Property");
require("../models/User"); // Ensure User model is registered for populate
const { generateEmbedding, cosineSimilarity, buildPropertySearchText } = require("./embeddingService");
const { generateRagResponse } = require("./ragService");

/**
 * Parses natural language search query to extract structured filter hints.
 * e.g., "Find a 2BHK apartment near Chandigarh University under ₹20,000"
 * @param {string} query - Raw query text
 * @returns {Object} Extracted filter constraints and search tokens
 */
function extractQueryConstraints(query) {
  const constraints = {};
  if (!query || typeof query !== "string") return constraints;

  const lower = query.toLowerCase();

  // 1. Max price extraction (e.g. under 20000, under 20k, below ₹25,000, max 30000, budget 15k)
  const maxPriceMatch = lower.match(/(?:under|below|less\s+than|max|budget|within|upto|up\s+to)\s*(?:rs\.?|inr|₹)?\s*(\d+)(?:\s*(k|thousand|lakh))?/i)
    || lower.match(/(?:rs\.?|inr|₹)\s*(\d+)(?:\s*(k|thousand))?\s*(?:max|budget|or\s+less)/i);

  if (maxPriceMatch) {
    let num = parseInt(maxPriceMatch[1], 10);
    const unit = maxPriceMatch[2]?.toLowerCase();
    if (unit === "k" || unit === "thousand") num *= 1000;
    else if (unit === "lakh") num *= 100000;
    else if (num < 150) num *= 1000; // e.g. "under 20" often means 20k
    constraints.maxPrice = num;
  }

  // 2. Min price extraction (e.g. above 10000, more than 15k, min 10k)
  const minPriceMatch = lower.match(/(?:above|over|more\s+than|min|minimum|from)\s*(?:rs\.?|inr|₹)?\s*(\d+)(?:\s*(k|thousand))?/i);
  if (minPriceMatch) {
    let num = parseInt(minPriceMatch[1], 10);
    const unit = minPriceMatch[2]?.toLowerCase();
    if (unit === "k" || unit === "thousand") num *= 1000;
    constraints.minPrice = num;
  }

  // 3. BHK / Bedroom count extraction (e.g. 2bhk, 2 bhk, 2 bedroom, 1 bed)
  const bhkMatch = lower.match(/(\d+)\s*(?:bhk|bedroom|bed)/i)
    || lower.match(/(?:bhk|bedroom)\s*(\d+)/i)
    || (lower.includes("single bedroom") ? [null, 1] : null)
    || (lower.includes("double bedroom") ? [null, 2] : null);

  if (bhkMatch) {
    constraints.bhk = parseInt(bhkMatch[1], 10);
  }

  // 4. Furnishing status extraction
  if (lower.includes("semi-furnished") || lower.includes("semi furnished")) {
    constraints.furnished = "Semi-Furnished";
  } else if (lower.includes("unfurnished") || lower.includes("without furniture")) {
    constraints.furnished = "Unfurnished";
  } else if (lower.includes("furnished") || lower.includes("fully furnished")) {
    constraints.furnished = "Furnished";
  }

  // 5. Property type extraction
  if (lower.includes("apartment") || lower.includes("flat")) {
    constraints.type = "Apartment";
  } else if (lower.includes("villa")) {
    constraints.type = "Villa";
  } else if (lower.includes("studio")) {
    constraints.type = "Studio";
  } else if (lower.includes("house") || lower.includes("independent house") || lower.includes("bungalow")) {
    constraints.type = "House";
  }

  // 6. Amenities extraction
  const commonAmenities = ["parking", "balcony", "wifi", "gym", "pool", "security", "pet-friendly", "garden", "lift", "power backup"];
  const detectedAmenities = commonAmenities.filter(a => lower.includes(a.replace("-", " ")) || lower.includes(a));
  if (detectedAmenities.length > 0) {
    constraints.amenities = detectedAmenities;
  }

  return constraints;
}

/**
 * Calculates a structured match score and generates human-readable match explanations.
 */
function calculateStructuredScore(property, constraints, queryLower) {
  let score = 0.5; // neutral baseline
  const matchReasons = [];

  // BHK Match
  if (constraints.bhk) {
    if (property.bhk === constraints.bhk) {
      score += 0.25;
      matchReasons.push(`Matches exact ${property.bhk} BHK requirement`);
    } else if (Math.abs(property.bhk - constraints.bhk) === 1) {
      score += 0.05;
    } else {
      score -= 0.15;
    }
  }

  // Price constraint
  if (constraints.maxPrice) {
    if (property.price <= constraints.maxPrice) {
      score += 0.20;
      matchReasons.push(`Within budget: ₹${property.price.toLocaleString()} (under ₹${constraints.maxPrice.toLocaleString()})`);
    } else if (property.price <= constraints.maxPrice * 1.15) {
      score -= 0.10;
      matchReasons.push(`Slightly above target budget (₹${property.price.toLocaleString()})`);
    } else {
      score -= 0.30;
    }
  }

  if (constraints.minPrice && property.price >= constraints.minPrice) {
    score += 0.05;
  }

  // Furnishing status
  if (constraints.furnished) {
    if (property.furnished?.toLowerCase() === constraints.furnished.toLowerCase()) {
      score += 0.15;
      matchReasons.push(`${property.furnished} accommodation`);
    } else {
      score -= 0.05;
    }
  }

  // Property Type
  if (constraints.type) {
    if (property.type?.toLowerCase() === constraints.type.toLowerCase()) {
      score += 0.15;
      matchReasons.push(`Property type: ${property.type}`);
    }
  }

  // Location keyword match
  if (property.location && queryLower) {
    const locParts = property.location.toLowerCase().split(/[\s,]+/);
    const matchedLoc = locParts.some(p => p.length > 3 && queryLower.includes(p));
    if (matchedLoc) {
      score += 0.20;
      matchReasons.push(`Matches preferred area: ${property.location}`);
    }
  }

  // Amenities match
  if (constraints.amenities && constraints.amenities.length > 0) {
    const propAmenities = (property.amenities || []).map(a => a.toLowerCase());
    const propDesc = (property.description || "").toLowerCase();
    
    constraints.amenities.forEach(am => {
      const amClean = am.toLowerCase();
      if (propAmenities.some(pa => pa.includes(amClean)) || propDesc.includes(amClean)) {
        score += 0.10;
        matchReasons.push(`Includes ${am}`);
      }
    });
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    matchReasons
  };
}

/**
 * Performs hybrid semantic search:
 * 1. Generates query embedding
 * 2. Retrieves candidates from MongoDB
 * 3. Calculates vector cosine similarity + structured constraint score
 * 4. Ranks results
 * 5. Passes retrieved properties to RAG LLM for synthesized recommendation
 *
 * @param {string} query - Natural language search query
 * @param {Object} [options] - Pagination & filtering options
 * @returns {Promise<Object>} Search results with RAG response
 */
async function performSemanticSearch(query, options = {}) {
  const limit = options.limit ? parseInt(options.limit, 10) : 9;
  const cleanQuery = (query || "").trim();

  if (!cleanQuery) {
    return {
      query: "",
      aiResponse: "Please enter a search query to discover available rentals.",
      results: [],
      count: 0
    };
  }

  // 1. Extract structured constraints from user natural language query
  const constraints = extractQueryConstraints(cleanQuery);
  const queryLower = cleanQuery.toLowerCase();

  // 2. Generate embedding for query
  const queryEmbedding = await generateEmbedding(cleanQuery);

  // 3. Fetch properties from database with their embeddings and owner details
  // Note: We populate owner details so the card / modal can show contact info
  const allProperties = await Property.find({})
    .select("+embedding")
    .populate("ownerId", "name email phone")
    .lean();

  if (!allProperties || allProperties.length === 0) {
    const ragResponse = await generateRagResponse(cleanQuery, []);
    return {
      query: cleanQuery,
      extractedConstraints: constraints,
      aiResponse: ragResponse,
      results: [],
      count: 0
    };
  }

  // 4. Calculate hybrid similarity score for each property
  const scoredProperties = [];

  for (const property of allProperties) {
    let embedding = property.embedding;

    // If property doesn't have an embedding yet, generate on the fly
    if (!embedding || embedding.length === 0) {
      const text = buildPropertySearchText(property);
      embedding = await generateEmbedding(text);
    }

    const vectorSim = cosineSimilarity(queryEmbedding, embedding);
    const { score: structuredScore, matchReasons } = calculateStructuredScore(property, constraints, queryLower);

    // Hybrid combination: 60% semantic similarity + 40% structured constraints
    const hybridScore = Number((0.60 * vectorSim + 0.40 * structuredScore).toFixed(4));

    // Remove private vector embedding before returning to frontend
    delete property.embedding;

    if (vectorSim > 0.15 || structuredScore > 0.5) {
      if (hybridScore > 0.4) {
        matchReasons.unshift("High semantic alignment with your query");
      }
    }

    scoredProperties.push({
      property,
      score: hybridScore,
      vectorScore: Number(vectorSim.toFixed(3)),
      matchReasons: [...new Set(matchReasons)]
    });
  }

  // 5. Sort by hybrid score descending
  scoredProperties.sort((a, b) => b.score - a.score);

  // Take top ranked properties
  const topResults = scoredProperties.slice(0, limit);
  const retrievedPropertiesOnly = topResults.map(r => r.property);

  // 6. Generate natural language RAG response from top retrieved properties
  const aiResponse = await generateRagResponse(cleanQuery, retrievedPropertiesOnly);

  return {
    query: cleanQuery,
    extractedConstraints: constraints,
    aiResponse,
    results: topResults,
    count: topResults.length
  };
}

module.exports = {
  extractQueryConstraints,
  performSemanticSearch
};
