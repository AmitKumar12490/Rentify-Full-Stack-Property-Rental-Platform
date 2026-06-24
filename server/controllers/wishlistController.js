const User = require("../models/User");

const toggleWishlist = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID required" });
    }

    if (user.wishlist.some(id => id && id.toString() === propertyId.toString())) {
      user.wishlist = user.wishlist.filter((id) => id && id.toString() !== propertyId.toString());
    } else {
      user.wishlist.push(propertyId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleWishlist, getWishlist };
