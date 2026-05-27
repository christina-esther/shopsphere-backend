// ════════ adminRoutes.js ════════
const express = require("express");
const adminRouter = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getDashboardStats, getUsers, toggleUserStatus,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
} = require("../controllers/adminController");

adminRouter.use(protect, adminOnly);
adminRouter.get("/dashboard", getDashboardStats);
adminRouter.get("/users", getUsers);
adminRouter.put("/users/:id/toggle", toggleUserStatus);
adminRouter.get("/coupons", getCoupons);
adminRouter.post("/coupons", createCoupon);
adminRouter.put("/coupons/:id", updateCoupon);
adminRouter.delete("/coupons/:id", deleteCoupon);

// ════════ paymentRoutes.js ════════
const paymentRouter = express.Router();
paymentRouter.use(protect);

// Stripe
paymentRouter.post("/stripe/create-intent", async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "inr",
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

// Razorpay
paymentRouter.post("/razorpay/create-order", async (req, res) => {
  const Razorpay = require("razorpay");
  const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const { amount } = req.body;
  const order = await rzp.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });
  res.json({ success: true, order });
});

paymentRouter.get("/razorpay/key", (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// ════════ reviewRoutes.js ════════
const reviewRouter = express.Router();
reviewRouter.use(protect);
const { Review } = require("../models/index");

reviewRouter.get("/product/:productId", async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

reviewRouter.delete("/:id", async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  await review.deleteOne();
  res.json({ success: true, message: "Review deleted" });
});

// ════════ couponRoutes.js ════════
const couponRouter = express.Router();

// ════════ uploadRoutes.js ════════
const uploadRouter = express.Router();
uploadRouter.use(protect);
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

uploadRouter.post("/image", async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ success: false, message: "No image provided" });
  const result = await cloudinary.uploader.upload(image, {
    folder: "shopsphere",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  res.json({ success: true, public_id: result.public_id, url: result.secure_url });
});

// Export all
module.exports.adminRouter = adminRouter;
module.exports.paymentRouter = paymentRouter;
module.exports.reviewRouter = reviewRouter;
module.exports.couponRouter = couponRouter;
module.exports.uploadRouter = uploadRouter;
