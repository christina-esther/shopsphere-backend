// ─── orderRoutes.js ───────────────────────
const express = require("express");
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder,
  updateOrderToPaid, getAllOrders, updateOrderStatus,
  validateCoupon,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/pay", protect, updateOrderToPaid);
router.post("/coupon/validate", protect, validateCoupon);
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
