const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { Cart } = require("../models/index");
const Product = require("../models/Product");

// GET cart
router.get("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product", "name images price stock comparePrice"
  );
  res.json({ success: true, cart: cart || { items: [] } });
});

// ADD to cart
router.post("/add", protect, async (req, res) => {
  const { productId, quantity = 1, variant = "" } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  if (product.stock < quantity)
    return res.status(400).json({ success: false, message: "Insufficient stock" });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId && i.variant === variant
  );
  if (existingIdx > -1) {
    cart.items[existingIdx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, variant });
  }
  await cart.save();
  await cart.populate("items.product", "name images price stock comparePrice");
  res.json({ success: true, cart });
});

// UPDATE quantity
router.put("/item/:itemId", protect, async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });

  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate("items.product", "name images price stock comparePrice");
  res.json({ success: true, cart });
});

// REMOVE item
router.delete("/item/:itemId", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
  cart.items.pull(req.params.itemId);
  await cart.save();
  await cart.populate("items.product", "name images price stock comparePrice");
  res.json({ success: true, cart });
});

// CLEAR cart
router.delete("/clear", protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: "Cart cleared" });
});

// SAVE FOR LATER
router.put("/item/:itemId/save-for-later", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });
  item.savedForLater = !item.savedForLater;
  await cart.save();
  res.json({ success: true, message: item.savedForLater ? "Saved for later" : "Moved to cart" });
});

module.exports = router;
