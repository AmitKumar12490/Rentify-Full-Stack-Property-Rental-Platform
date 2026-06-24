const express = require("express");
const { toggleWishlist, getWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(protect, getWishlist);
router.route("/:id").post(protect, toggleWishlist);

module.exports = router;
