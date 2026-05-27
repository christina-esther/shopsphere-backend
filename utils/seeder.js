const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const { Category } = require("../models/index");

dotenv.config();

const categories = [
  { name: "Electronics", slug: "electronics", description: "Latest gadgets and tech" },
  { name: "Fashion", slug: "fashion", description: "Trendy clothing and accessories" },
  { name: "Home & Living", slug: "home-living", description: "Furniture and decor" },
  { name: "Sports", slug: "sports", description: "Sports and fitness equipment" },
  { name: "Beauty", slug: "beauty", description: "Skincare and beauty products" },
  { name: "Books", slug: "books", description: "Books and stationery" },
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🔗 Connected to MongoDB");

  // Clean up
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
  ]);
  console.log("🗑️  Cleaned existing data");

  // Create categories
  const createdCategories = await Category.insertMany(categories);
  console.log(`✅ Created ${createdCategories.length} categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await User.create({
    name: "Admin User",
    email: "admin@shopsphere.com",
    password: adminPassword,
    role: "admin",
    isEmailVerified: true,
  });

  // Create sample user
  const userPassword = await bcrypt.hash("user123", 12);
  await User.create({
    name: "John Doe",
    email: "user@shopsphere.com",
    password: userPassword,
    role: "user",
    isEmailVerified: true,
  });
  console.log("✅ Created admin & sample user");

  // Create sample products
  const electronicsId = createdCategories.find((c) => c.slug === "electronics")._id;
  const fashionId = createdCategories.find((c) => c.slug === "fashion")._id;
  const homeId = createdCategories.find((c) => c.slug === "home-living")._id;

  const sampleProducts = [
    {
      name: "AirPods Pro 2nd Gen",
      description: "Premium wireless earbuds with Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio. Up to 30 hours of listening time with MagSafe charging case.",
      price: 24999,
      comparePrice: 29999,
      category: electronicsId,
      brand: "Apple",
      stock: 50,
      ratings: 4.8,
      numReviews: 124,
      featured: true,
      trending: true,
      sold: 234,
      images: [
        { url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600" },
        { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600" },
      ],
      tags: ["wireless", "earbuds", "apple", "noise-cancellation"],
    },
    {
      name: "Sony WH-1000XM5",
      description: "Industry-leading noise canceling headphones with Auto NC Optimizer, exceptional call quality, and up to 30-hour battery life.",
      price: 29990,
      comparePrice: 34990,
      category: electronicsId,
      brand: "Sony",
      stock: 30,
      ratings: 4.7,
      numReviews: 89,
      featured: true,
      sold: 156,
      images: [
        { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
      ],
      tags: ["headphones", "sony", "wireless", "noise-cancellation"],
    },
    {
      name: "Premium Minimalist Watch",
      description: "Swiss-inspired minimalist watch with sapphire crystal glass, Italian leather strap, and precision quartz movement. Water resistant to 30m.",
      price: 4999,
      comparePrice: 7999,
      category: fashionId,
      brand: "TimeCraft",
      stock: 75,
      ratings: 4.5,
      numReviews: 67,
      featured: true,
      sold: 89,
      images: [
        { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" },
      ],
      tags: ["watch", "minimalist", "fashion", "leather"],
      variants: [{ name: "Color", options: ["Black", "Silver", "Gold", "Rose Gold"] }],
    },
    {
      name: "Mechanical Gaming Keyboard",
      description: "Full RGB mechanical keyboard with Cherry MX switches, aluminum frame, and per-key lighting. Built for performance gaming.",
      price: 8499,
      comparePrice: 11999,
      category: electronicsId,
      brand: "RazerPro",
      stock: 40,
      ratings: 4.6,
      numReviews: 203,
      trending: true,
      sold: 312,
      images: [
        { url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600" },
      ],
      tags: ["keyboard", "gaming", "mechanical", "rgb"],
      flashSale: { active: true, discount: 20, endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    },
    {
      name: "Linen Bedroom Set",
      description: "Premium linen bedsheet set with 2 pillow covers. 400 thread count, breathable and hypoallergenic. Machine washable.",
      price: 2499,
      comparePrice: 3999,
      category: homeId,
      brand: "CozyCraft",
      stock: 100,
      ratings: 4.3,
      numReviews: 45,
      sold: 67,
      images: [
        { url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600" },
      ],
      tags: ["bedroom", "linen", "home", "bedsheet"],
      variants: [{ name: "Size", options: ["Single", "Double", "Queen", "King"] }, { name: "Color", options: ["White", "Grey", "Beige", "Navy"] }],
    },
    {
      name: "Smart Fitness Band Pro",
      description: "Track your health 24/7 with heart rate, SpO2, stress levels, and 14-day battery life. Swim-proof with GPS support.",
      price: 3499,
      comparePrice: 4999,
      category: electronicsId,
      brand: "FitPulse",
      stock: 60,
      ratings: 4.4,
      numReviews: 178,
      trending: true,
      sold: 445,
      images: [
        { url: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600" },
      ],
      tags: ["fitness", "smartwatch", "health", "tracker"],
    },
  ];

  // Auto slug
  for (const p of sampleProducts) {
    p.slug = p.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Date.now();
    await new Promise((r) => setTimeout(r, 1)); // ensure unique timestamp
  }

  await Product.insertMany(sampleProducts);
  console.log(`✅ Created ${sampleProducts.length} sample products`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("📧 Admin: admin@shopsphere.com / admin123");
  console.log("📧 User:  user@shopsphere.com  / user123");
  process.exit(0);
};

seedDB().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
