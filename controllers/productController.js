const Product = require("../models/Product");
const { Review } = require("../models/index");

// ─── GET ALL PRODUCTS (with search, filter, sort, pagination) ─────────────────
exports.getProducts = async (req, res) => {
  const {
    keyword, category, minPrice, maxPrice, rating,
    sort, page = 1, limit = 12, featured, trending, flashSale,
  } = req.query;

  const query = { isActive: true };

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query.ratings = { $gte: Number(rating) };
  if (featured === "true") query.featured = true;
  if (trending === "true") query.trending = true;
  if (flashSale === "true") query["flashSale.active"] = true;

  const sortOptions = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    popular: { sold: -1 },
    rating: { ratings: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).populate("category", "name slug").sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
    isActive: true,
  }).populate("category", "name slug");

  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const reviews = await Review.find({ product: product._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(10);

  // Related products
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(6);

  res.json({ success: true, product, reviews, related });
};

// ─── CREATE PRODUCT (admin) ───────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  const product = await Product.create({ ...req.body });
  res.status(201).json({ success: true, product });
};

// ─── UPDATE PRODUCT (admin) ───────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  res.json({ success: true, product });
};

// ─── DELETE PRODUCT (admin) ───────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  product.isActive = false; // soft delete
  await product.save();
  res.json({ success: true, message: "Product removed" });
};

// ─── GET SEARCH SUGGESTIONS ───────────────────────────────────────────────────
exports.getSearchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

  const products = await Product.find({
    name: { $regex: q, $options: "i" },
    isActive: true,
  })
    .select("name images price slug")
    .limit(6);

  res.json({ success: true, suggestions: products });
};

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
exports.addReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const existing = await Review.findOne({ user: req.user._id, product: product._id });
  if (existing) return res.status(400).json({ success: false, message: "Already reviewed" });

  const review = await Review.create({
    user: req.user._id, product: product._id, rating, title, comment,
  });

  // Update product ratings
  const reviews = await Review.find({ product: product._id });
  product.ratings = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  product.numReviews = reviews.length;
  await product.save();

  await review.populate("user", "name avatar");
  res.status(201).json({ success: true, review });
};
