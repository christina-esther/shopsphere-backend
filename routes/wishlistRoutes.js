// ─── wishlistRoutes.js ────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name images price ratings comparePrice");
  res.json({ success: true, wishlist: user.wishlist });
});

router.post("/toggle/:productId", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.params.productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(req.params.productId);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

module.exports = router;
