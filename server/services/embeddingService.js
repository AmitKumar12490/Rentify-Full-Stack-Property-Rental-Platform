const crypto = require("crypto");

/**
 * Normalizes property fields into a structured text representation suitable for semantic embedding.
 * @param {Object} property - Mongoose property document or plain object
 * @returns {string} Normalized searchable representation
 */
function buildPropertySearchText(property) {
  const title = property.title || "";
  const type = property.type || "Property";
  const bhk = property.bhk ? `${property.bhk} BHK (${property.bhk} Bedroom)` : "";
  const furnished = property.furnished || "Unfurnished";
  const price = property.price ? `₹${property.price} per month (Rent: ${property.price})` : "";
  const location = property.location || "";
  const amenitiesList = Array.isArray(property.amenities) && property.amenities.length > 0
    ? property.amenities.join(", ")
    : "Standard residential amenities";
  const description = property.description || "";

  return [
    `Title: ${title}`,
    `Property Type: ${type}`,
    `Bedrooms: ${bhk}`,
    `Furnishing: ${furnished}`,
    `Price: ${price}`,
    `Location: ${location}`,
    `Amenities: ${amenitiesList}`,
    `Overview: ${description}`
  ]
    .filter(Boolean)
    .join(" | ");
}

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized non-negative spaces).
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  const similarity = dotProduct / denominator;
  // Bound to [0, 1] for clean scoring
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Fast, deterministic semantic vectorizer fallback (256-dimensional unit vector).
 * Ensures semantic search works out of the box with zero external dependencies and zero cost.
 */
function generateDeterministicEmbedding(text) {
  const DIMENSIONS = 256;
  const vector = new Array(DIMENSIONS).fill(0);
  if (!text || typeof text !== "string") return vector;

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s₹]/g, " ");
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1);

  // Semantic category weights and buckets
  const semanticWeights = {
    // BHK & Bedrooms
    "1bhk": [0, 1.5], "1": [0, 0.8], "single": [0, 0.7],
    "2bhk": [1, 1.8], "2": [1, 0.9], "double": [1, 0.7],
    "3bhk": [2, 1.8], "3": [2, 0.9], "triple": [2, 0.7],
    "4bhk": [3, 1.8], "4": [3, 0.9],
    "bhk": [4, 1.2], "bedroom": [4, 1.2], "bedrooms": [4, 1.2],
    // Types
    "apartment": [10, 1.5], "flat": [10, 1.5], "studio": [11, 1.7],
    "house": [12, 1.5], "villa": [13, 1.7], "penthouse": [14, 1.7],
    // Furnishing
    "furnished": [20, 1.5], "unfurnished": [21, 1.5], "semi": [22, 1.2],
    // Amenities
    "parking": [30, 1.5], "garage": [30, 1.3], "car": [30, 1.0],
    "balcony": [31, 1.4], "terrace": [31, 1.3], "wifi": [32, 1.3],
    "gym": [33, 1.4], "fitness": [33, 1.2], "pool": [34, 1.5],
    "swimming": [34, 1.3], "security": [35, 1.2], "pet": [36, 1.6],
    "pets": [36, 1.6], "elevator": [37, 1.3], "lift": [37, 1.3],
    // Budget & Quality
    "affordable": [40, 1.4], "cheap": [40, 1.3], "budget": [40, 1.4],
    "luxury": [41, 1.5], "luxurious": [41, 1.5], "premium": [41, 1.4],
    "spacious": [42, 1.3], "modern": [43, 1.3], "family": [44, 1.4],
    "student": [45, 1.4], "bachelor": [45, 1.3],
    // Proximity & Locations
    "university": [50, 1.6], "college": [50, 1.4], "campus": [50, 1.4],
    "metro": [51, 1.5], "station": [51, 1.3], "near": [52, 1.1],
    "chandigarh": [60, 1.8], "bangalore": [61, 1.8], "mumbai": [62, 1.8],
    "delhi": [63, 1.8], "hyderabad": [64, 1.8], "kolkata": [65, 1.8]
  };

  tokens.forEach((token, index) => {
    // 1. Direct semantic feature mapping
    if (semanticWeights[token]) {
      const [idx, weight] = semanticWeights[token];
      vector[idx % DIMENSIONS] += weight * (1 + 1 / (index + 1));
    }

    // 2. Subword n-gram hashing for vocabulary generalization
    for (let len = 3; len <= Math.min(token.length, 5); len++) {
      for (let i = 0; i <= token.length - len; i++) {
        const sub = token.substring(i, i + len);
        const hash = crypto.createHash("md5").update(sub).digest();
        const bucket = (hash.readUInt16BE(0) + 70) % DIMENSIONS;
        const sign = (hash[2] % 2 === 0) ? 1 : -1;
        vector[bucket] += (sign * 0.25) / Math.sqrt(len);
      }
    }
  });

  // Normalize vector to unit length (L2 norm)
  let norm = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }

  return vector;
}

/**
 * Generates an embedding vector for the provided text.
 * Uses Google Gemini API (text-embedding-004) or OpenAI API when configured,
 * and seamlessly falls back to high-performance local deterministic embeddings.
 *
 * @param {string} text - Input text
 * @returns {Promise<number[]>} Array of float numbers
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return generateDeterministicEmbedding("");
  }

  const cleanText = text.trim();
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  // 1. Attempt Google Gemini Embedding if key exists
  if (apiKey) {
    try {
      const model = "text-embedding-004";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            parts: [{ text: cleanText }]
          }
        }),
        signal: AbortSignal.timeout(6000) // 6s timeout
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.embedding?.values && Array.isArray(data.embedding.values)) {
          return data.embedding.values;
        }
      } else {
        const errorText = await response.text();
        console.warn(`[Gemini Embedding Warning] API responded with ${response.status}: ${errorText.substring(0, 120)}`);
      }
    } catch (err) {
      console.warn(`[Gemini Embedding Fallback] ${err.message}. Using deterministic vectorizer.`);
    }
  }

  // 2. Attempt OpenAI Embedding if OPENAI_API_KEY is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: cleanText
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.[0]?.embedding) {
          return data.data[0].embedding;
        }
      }
    } catch (err) {
      console.warn(`[OpenAI Embedding Fallback] ${err.message}`);
    }
  }

  // 3. Fallback to robust deterministic local embedding
  return generateDeterministicEmbedding(cleanText);
}

/**
 * Batch embedding generator with concurrency limits.
 */
async function generateBatchEmbeddings(texts, concurrency = 4) {
  const results = [];
  for (let i = 0; i < texts.length; i += concurrency) {
    const chunk = texts.slice(i, i + concurrency);
    const chunkEmbeddings = await Promise.all(chunk.map(t => generateEmbedding(t)));
    results.push(...chunkEmbeddings);
  }
  return results;
}

module.exports = {
  buildPropertySearchText,
  generateEmbedding,
  generateDeterministicEmbedding,
  cosineSimilarity,
  generateBatchEmbeddings
};
