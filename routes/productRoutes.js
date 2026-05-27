const express = require("express");
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getSearchSuggestions, addReview,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/suggestions", getSearchSuggestions);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/:id/reviews", protect, addReview);

module.exports = router;
