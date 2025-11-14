// src/routes/wishlistRoutes.js
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/wishlistController");

const router = express.Router();

router.get("/", requireAuth, controller.getWishlist);
router.post("/items", requireAuth, controller.addToWishlist);
router.delete("/items/:id", requireAuth, controller.removeFromWishlist);
router.post("/items/:id/move-to-cart", requireAuth, controller.moveToCart);

module.exports = router;