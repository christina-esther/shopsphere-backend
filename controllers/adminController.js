const User = require("../models/User");
const Product = require("../models/Product");
const { Order, Category, Coupon } = require("../models/index");

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers, totalProducts, totalOrders,
    revenueAgg, monthUsers, monthOrders, monthRevAgg,
    lastMonthRevAgg, recentOrders, topProducts,
    ordersByStatus, monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    User.countDocuments({ createdAt: { $gte: startOfMonth }, role: "user" }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email avatar"),
    Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select("name images price sold ratings"),
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const monthRevenue = monthRevAgg[0]?.total || 0;
  const lastMonthRevenue = lastMonthRevAgg[0]?.total || 0;
  const revenueGrowth = lastMonthRevenue
    ? (((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : 100;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueChart = months.map((name, i) => {
    const found = monthlyRevenue.find((m) => m._id.month === i + 1);
    return { name, revenue: found?.revenue || 0, orders: found?.orders || 0 };
  });

  res.json({
    success: true,
    stats: {
      totalUsers, totalProducts, totalOrders,
      totalRevenue, monthRevenue, monthOrders,
      monthUsers, revenueGrowth,
    },
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueChart,
  });
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { role: "user" };
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total });
};

exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}` });
};

// ─── COUPON MANAGEMENT ────────────────────────────────────────────────────────
exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
};

exports.createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
};

exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
  res.json({ success: true, coupon });
};

exports.deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Coupon deleted" });
};
