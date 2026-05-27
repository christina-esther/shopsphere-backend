const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getDashboardStats, getUsers, toggleUserStatus, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/adminController");

router.use(protect, adminOnly);
router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

module.exports = router;
