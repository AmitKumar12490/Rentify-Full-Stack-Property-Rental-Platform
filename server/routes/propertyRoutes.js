const express = require("express");
const { addProperty, getProperties, getPropertyById, getOwnerProperties, updateProperty, deleteProperty } = require("../controllers/propertyController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

// Public routes
router.get("/", getProperties);
router.route("/:id")
  .get(getPropertyById)
  .put(protect, authorize("Owner"), upload.array("images", 5), updateProperty)
  .delete(protect, authorize("Owner"), deleteProperty);

// Protected Owner routes
router.get("/owner/all", protect, authorize("Owner"), getOwnerProperties);
router.post("/", protect, authorize("Owner"), upload.array("images", 5), addProperty);

module.exports = router;
