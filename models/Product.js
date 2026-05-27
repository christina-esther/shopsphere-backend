const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: String, // e.g. "Size", "Color"
  options: [String], // e.g. ["S", "M", "L"] or ["Red", "Blue"]
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: { type: Number, default: 0 }, // original price for discount display
    images: [
      {
        public_id: String,
        url: { type: String, required: true },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
    },
    brand: { type: String, default: "" },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    variants: [variantSchema],
    tags: [String],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    flashSale: {
      active: { type: Boolean, default: false },
      discount: { type: Number, default: 0 }, // percentage
      endsAt: Date,
    },
    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metaTitle: String,
    metaDescription: String,
    slug: { type: String, unique: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Virtual: discount percentage ────────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// ─── Auto-generate slug ───────────────────────────────────────────────────────
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now();
  }
  next();
});

// ─── Text index for search ────────────────────────────────────────────────────
productSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
