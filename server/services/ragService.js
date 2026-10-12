/**
 * RAG Service - Generates concise natural language property recommendations
 * based purely on retrieved property documents.
 */

/**
 * Formats retrieved properties into a compact context string for LLM prompting.
 * @param {Array} properties - Retrieved property documents
 * @returns {string} Formatted context
 */
function buildCompactContext(properties) {
  if (!properties || properties.length === 0) {
    return "No matching properties were found in the database.";
  }

  return properties.map((p, idx) => {
    const amenities = Array.isArray(p.amenities) && p.amenities.length > 0
      ? p.amenities.join(", ")
      : "Standard amenities";
    return `Property ${idx + 1}:
- Title: ${p.title}
- Type: ${p.type}
- BHK: ${p.bhk} BHK
- Furnishing: ${p.furnished}
- Rent: ₹${p.price.toLocaleString()}/month
- Location: ${p.location}
- Amenities: ${amenities}
- Description: ${p.description || "N/A"}`;
  }).join("\n\n");
}

/**
 * Fallback natural-language synthesis when AI API key is not configured or unavailable.
 * Ensures zero-cost, zero-failure operation while maintaining high-quality responses.
 */
function generateFallbackSynthesis(query, properties) {
  if (!properties || properties.length === 0) {
    return `I couldn't find any rental properties matching "${query}". Try broadening your search or adjusting your budget and location preferences.`;
  }

  const count = properties.length;
  const bestMatch = properties[0];
  const bestTitle = bestMatch.title || "Featured Property";
  const bestPrice = bestMatch.price ? `₹${bestMatch.price.toLocaleString()}/month` : "competitive rent";
  const bestLoc = bestMatch.location || "prime location";
  const bestBhk = bestMatch.bhk ? `${bestMatch.bhk} BHK` : "";
  const bestFurn = bestMatch.furnished ? `(${bestMatch.furnished})` : "";

  if (count === 1) {
    return `Based on your request, I found 1 strong match: **${bestTitle}** in ${bestLoc} for ${bestPrice} ${bestBhk} ${bestFurn}. Check out the details below!`;
  }

  return `Based on your requirements, I found ${count} properties that match your search. The top recommendation is **${bestTitle}** located in ${bestLoc} offered at ${bestPrice} with ${bestBhk} ${bestFurn} accommodation. Browse all matching options below.`;
}

/**
 * Generates an LLM recommendation using Google Gemini API or OpenAI API with fallback.
 *
 * @param {string} query - The user natural language search query
 * @param {Array} properties - List of retrieved properties
 * @returns {Promise<string>} Natural language response
 */
async function generateRagResponse(query, properties) {
  if (!properties || properties.length === 0) {
    return `No properties matched your search for "${query}". Try adjusting your filters or search terms to find available rentals.`;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const context = buildCompactContext(properties.slice(0, 5)); // Send top 5 to keep context compact

  // 1. Attempt Google Gemini LLM
  if (apiKey) {
    try {
      const model = process.env.AI_MODEL || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt = `You are Rentify AI, an expert real estate rental advisor.

USER QUERY:
"${query}"

RETRIEVED PROPERTIES FROM DATABASE (GROUND TRUTH):
${context}

CRITICAL INSTRUCTIONS:
1. Provide a concise, helpful 2-3 sentence response summarizing how the retrieved properties meet the user's requirements.
2. Specifically highlight the best matching property by name and key features.
3. NEVER invent, fabricate, or hallucinate properties, prices, contacts, or amenities not present in the context above.
4. Only reference properties that are in the retrieved list.
5. If no properties fit the user's specific request, politely explain why and suggest adjusting criteria.
6. Tone: Friendly, concise, professional.`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // Low temperature for high factual accuracy
            maxOutputTokens: 250
          }
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const err = await response.text();
        console.warn(`[Gemini RAG Warning] Status ${response.status}: ${err.substring(0, 100)}`);
      }
    } catch (err) {
      console.warn(`[Gemini RAG Fallback] ${err.message}`);
    }
  }

  // 2. Attempt OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 250,
          messages: [
            {
              role: "system",
              content: "You are Rentify AI, a property rental advisor. Answer in 2-3 concise sentences highlighting the best retrieved listing. Never invent or hallucinate property details not in context."
            },
            {
              role: "user",
              content: `User query: "${query}"\n\nRetrieved properties:\n${context}`
            }
          ]
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn(`[OpenAI RAG Fallback] ${err.message}`);
    }
  }

  // 3. Fallback synthesis engine
  return generateFallbackSynthesis(query, properties);
}

module.exports = {
  buildCompactContext,
  generateFallbackSynthesis,
  generateRagResponse
};
