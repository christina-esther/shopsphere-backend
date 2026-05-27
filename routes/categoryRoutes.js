const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { Category } = require("../models/index");
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  res.json({ success: true, categories });
});

router.get("/:slug/products", async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  const products = await Product.find({ category: category._id, isActive: true }).limit(20);
  res.json({ success: true, category, products });
});

router.post("/", protect, adminOnly, async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category });
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: "Category deleted" });
});

module.exports = router;
