const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
  advanceOrderStatus
} = require("../controllers/order.controller");

const router = express.Router();

router.post("/create-payment-order", authMiddleware, createPaymentOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.get("/", authMiddleware, getOrders);
// Optional bonus: status progression (development/admin helper).
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.post("/:id/advance", authMiddleware, advanceOrderStatus);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;