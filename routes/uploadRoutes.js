const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/image", protect, async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ success: false, message: "No image provided" });
  const result = await cloudinary.uploader.upload(image, {
    folder: "shopsphere",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  res.json({ success: true, public_id: result.public_id, url: result.secure_url });
});

module.exports = router;
