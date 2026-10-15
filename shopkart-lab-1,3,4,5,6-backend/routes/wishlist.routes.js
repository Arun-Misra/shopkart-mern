const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} = require("../controllers/wishlist.controller");

const router = express.Router();

router.get("/", authMiddleware, getWishlist);
router.post("/:productId", authMiddleware, addToWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);
router.patch("/:productId/toggle", authMiddleware, toggleWishlist);

module.exports = router;