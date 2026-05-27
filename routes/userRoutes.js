// userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

router.get("/profile", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put("/profile", protect, async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id, { name, phone, avatar }, { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

router.post("/address", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

router.delete("/address/:addressId", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

router.post("/recently-viewed/:productId", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.recentlyViewed = user.recentlyViewed.filter(
    (id) => id.toString() !== req.params.productId
  );
  user.recentlyViewed.unshift(req.params.productId);
  if (user.recentlyViewed.length > 10) user.recentlyViewed = user.recentlyViewed.slice(0, 10);
  await user.save();
  res.json({ success: true });
});

module.exports = router;
