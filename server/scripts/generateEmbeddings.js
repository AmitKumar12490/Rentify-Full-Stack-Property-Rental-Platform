const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables from server root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Property = require("../models/Property");
const { buildPropertySearchText, generateEmbedding } = require("../services/embeddingService");
const connectDB = require("../config/db");

async function runGenerateEmbeddings() {
  console.log("==================================================");
  console.log("🚀 Rentify - Property Vector Embedding Generator");
  console.log("==================================================");

  const force = process.argv.includes("--force") || process.argv.includes("-f");
  if (force) {
    console.log("⚡ Mode: FORCE regeneration (recomputing all embeddings)");
  } else {
    console.log("⚡ Mode: INCREMENTAL (skipping up-to-date embeddings)");
  }

  try {
    await connectDB();

    const properties = await Property.find({}).select("+embedding");
    const total = properties.length;
    console.log(`\n📋 Found ${total} properties in database.`);

    if (total === 0) {
      console.log("ℹ️ No properties found to index. Seed or create properties first.");
      process.exit(0);
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const prefix = `[${i + 1}/${total}] "${property.title}"`;

      // Check if embedding already exists and force is false
      if (!force && property.embedding && Array.isArray(property.embedding) && property.embedding.length > 0) {
        console.log(`${prefix} -> Already indexed (${property.embedding.length} dims). Skipped.`);
        skippedCount++;
        continue;
      }

      try {
        const searchText = buildPropertySearchText(property);
        const vector = await generateEmbedding(searchText);

        if (Array.isArray(vector) && vector.length > 0) {
          property.embedding = vector;
          property.embeddingUpdatedAt = new Date();
          await property.save();
          console.log(`${prefix} -> Generated & saved vector (${vector.length} dims). ✅`);
          updatedCount++;
        } else {
          console.warn(`${prefix} -> Embedding generation produced empty vector. ⚠️`);
          failedCount++;
        }
      } catch (err) {
        console.error(`${prefix} -> Error: ${err.message} ❌`);
        failedCount++;
      }
    }

    console.log("\n==================================================");
    console.log("📊 Indexing Summary:");
    console.log(`   - Total properties: ${total}`);
    console.log(`   - Newly embedded:   ${updatedCount}`);
    console.log(`   - Skipped (cached): ${skippedCount}`);
    console.log(`   - Failed:           ${failedCount}`);
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error generating embeddings:", error);
    process.exit(1);
  }
}

runGenerateEmbeddings();
