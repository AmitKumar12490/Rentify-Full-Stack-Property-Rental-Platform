const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    type: { type: String, required: true },
    bhk: { type: Number, required: true },
    furnished: { type: String, enum: ["Furnished", "Semi-Furnished", "Unfurnished"], default: "Unfurnished" },
    images: [{ type: String }],
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
