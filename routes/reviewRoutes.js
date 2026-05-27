const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { Review } = require("../models/index");

router.get("/product/:productId", async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar").sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

router.delete("/:id", protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized" });
  await review.deleteOne();
  res.json({ success: true, message: "Review deleted" });
});

module.exports = router;
