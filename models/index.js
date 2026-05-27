const mongoose = require("mongoose");

// ─── CATEGORY ─────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    description: String,
    image: { public_id: String, url: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});
const Category = mongoose.model("Category", categorySchema);

// ─── REVIEW ───────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxLength: 100 },
    comment: { type: String, required: true },
    images: [{ public_id: String, url: String }],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    verified: { type: Boolean, default: false }, // verified purchase
  },
  { timestamps: true }
);
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
const Review = mongoose.model("Review", reviewSchema);

// ─── ORDER ────────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  variant: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "razorpay", "cod"],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    totalPrice: { type: Number, required: true, default: 0 },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    trackingNumber: { type: String, default: "" },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    statusHistory: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);

// ─── COUPON ───────────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null }, // cap for percentage discounts
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    userUsageLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);
const Coupon = mongoose.model("Coupon", couponSchema);

// ─── CART ─────────────────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  variant: { type: String, default: "" },
  savedForLater: { type: Boolean, default: false },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);
const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Category, Review, Order, Coupon, Cart };
