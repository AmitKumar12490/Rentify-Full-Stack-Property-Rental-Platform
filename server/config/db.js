const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rentify";
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}`);
    // If running in development and primary fails, attempt local MongoDB fallback
    if (process.env.NODE_ENV !== "production") {
      try {
        console.log("Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/rentify)...");
        const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/rentify", { serverSelectionTimeoutMS: 3000 });
        console.log(`Local MongoDB Connected: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error(`Local MongoDB fallback failed: ${localErr.message}`);
      }
    }
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
