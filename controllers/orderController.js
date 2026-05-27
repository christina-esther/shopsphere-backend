const { Order, Coupon, Cart } = require("../models/index");
const Product = require("../models/Product");

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod,
    itemsPrice, taxPrice, shippingPrice, totalPrice,
    couponCode, discount,
  } = req.body;

  if (!orderItems?.length)
    return res.status(400).json({ success: false, message: "No order items" });

  // Validate stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity)
      return res.status(400).json({ success: false, message: `${item.name} is out of stock` });
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode: couponCode || "",
    discount: discount || 0,
    statusHistory: [{ status: "pending", message: "Order placed successfully" }],
  });

  // Deduct stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, order });
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("orderItems.product", "name images");
  res.json({ success: true, orders });
};

// ─── GET ORDER BY ID ──────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name images");

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });

  res.json({ success: true, order });
};

// ─── UPDATE PAYMENT ───────────────────────────────────────────────────────────
exports.updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = req.body;
  order.orderStatus = "processing";
  order.statusHistory.push({ status: "processing", message: "Payment confirmed" });
  await order.save();

  res.json({ success: true, order });
};

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total });
};

// ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  const { status, message, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  order.statusHistory.push({
    status,
    message: message || `Order ${status}`,
  });
  await order.save();
  res.json({ success: true, order });
};

// ─── VALIDATE COUPON ──────────────────────────────────────────────────────────
exports.validateCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
  if (new Date() > coupon.validUntil)
    return res.status(400).json({ success: false, message: "Coupon has expired" });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
  if (cartTotal < coupon.minOrderAmount)
    return res.status(400).json({
      success: false,
      message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
    });
  if (coupon.usedBy.includes(req.user._id))
    return res.status(400).json({ success: false, message: "You've already used this coupon" });

  let discount =
    coupon.discountType === "percentage"
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  res.json({ success: true, coupon, discount: Math.round(discount) });
};
