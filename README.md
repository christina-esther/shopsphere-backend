<div align="center">

<img src="https://img.shields.io/badge/ShopSphere-E--Commerce-6366f1?style=for-the-badge&logo=shopify&logoColor=white" alt="ShopSphere" height="50"/>

# 🛍️ ShopSphere

### A Modern Full-Stack E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://shopsphere-gamma-eight.vercel.app/)
[![Backend](https://img.shields.io/badge/🔧_Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)

<br/>

> **ShopSphere** is a production-ready, full-stack e-commerce web application built with the MERN stack. It features seamless product browsing, a dynamic cart system, dual payment gateway support, Cloudinary-powered image uploads, and a powerful admin dashboard — all deployed live on Vercel + Render.

<br/>

**[🌐 View Live App](https://shopsphere-gamma-eight.vercel.app/)** &nbsp;|&nbsp; **[📂 Explore the Code](#-project-structure)**

</div>

---

## ✨ Features at a Glance

| 👤 Customer | 🔐 Auth | 🛒 Shopping | 👑 Admin |
|:---:|:---:|:---:|:---:|
| Browse & Search Products | JWT Authentication | Add to Cart | Product Management |
| Advanced Filters | Cookie-based Sessions | Wishlist | Inventory Control |
| Product Reviews | Forgot/Reset Password | Coupon Codes | Order Management |
| Order Tracking | Protected Routes | Razorpay & Stripe | Sales Analytics |
| Profile Management | Admin Role Guard | Order History | User Management |
| Responsive UI | Secure Middleware | Real-time Toast Alerts | Dashboard Overview |

---

## 🖼️ Pages & Screens

```
🏠 Home Page         — Hero, featured products, categories
🛍️ Products Page     — Grid view, search, filters by category/price
📦 Product Detail    — Images, description, reviews, add to cart
🛒 Cart Drawer       — Slide-out cart with quantity controls
💳 Checkout Page     — Address form + payment (Razorpay / Stripe)
❤️  Wishlist          — Saved items for later
📋 Orders Page       — Order history with statuses
🔍 Order Detail      — Full order breakdown
👤 Profile Page      — Update personal info & password
🔑 Auth Pages        — Login, Register, Forgot/Reset Password
📊 Admin Dashboard   — Analytics, charts, sales overview
📁 Admin Products    — Add/Edit/Delete products with image upload
📦 Admin Orders      — Update order statuses
👥 Admin Users       — Manage users & coupon codes
```

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI Library |
| **Vite** | Build Tool & Dev Server |
| **Redux Toolkit** | Global State Management |
| **React Router v6** | Client-Side Routing |
| **Tailwind CSS** | Utility-First Styling |
| **Framer Motion** | Animations & Transitions |
| **Axios** | HTTP Client |
| **Swiper.js** | Product Carousels |
| **React Hot Toast** | Notification Toasts |
| **Stripe & Razorpay SDKs** | Payment UI Integration |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express.js** | REST API Server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT + bcryptjs** | Authentication & Password Hashing |
| **Cloudinary + Multer** | Image Upload & Storage |
| **Nodemailer** | Email Notifications |
| **Stripe + Razorpay** | Payment Gateway |
| **Express Validator** | Input Validation |
| **Morgan** | HTTP Request Logger |

### Deployment
| Service | Role |
|---|---|
| **Vercel** | Frontend Hosting |
| **Render** | Backend API Hosting |
| **MongoDB Atlas** | Cloud Database |
| **Cloudinary** | Media CDN |

---

## 📁 Project Structure

```
shopsphere/
├── 📁 frontend/                  # React + Vite App (deployed on Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # ProtectedRoute, AdminRoute, AuthModal
│   │   │   ├── cart/             # CartDrawer
│   │   │   ├── layout/           # Navbar, Footer, MobileNav
│   │   │   └── ui/               # Reusable UI components
│   │   ├── pages/
│   │   │   ├── admin/            # Dashboard, Products, Orders, Users
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── redux/
│   │   │   └── slices/           # authSlice, cartSlice, wishlistSlice, productSlice, uiSlice
│   │   └── services/             # API config + mock data
│
├── 📁 backend/                   # Express.js REST API (deployed on Render)
│   ├── controllers/              # authController, productController, orderController, adminController
│   ├── models/                   # User, Product, Order, Cart, Wishlist, Review, Coupon
│   ├── routes/                   # 12 API route modules
│   ├── middleware/               # JWT auth middleware + role guard
│   ├── utils/                    # Seeder, Email sender
│   └── server.js                 # App entry point
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Razorpay / Stripe account

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/shopsphere.git
cd shopsphere
```

### 2️⃣ Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopsphere

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend URL
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

```bash
npm run dev         # Start backend with nodemon
npm run seed        # (Optional) Seed sample data
```

### 3️⃣ Setup the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

```bash
npm run dev         # Start frontend on http://localhost:5173
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Push the `frontend/` folder to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` to your Render backend URL in Vercel environment variables
4. Deploy — Vercel auto-detects Vite

### Backend → Render
1. Push the `backend/` folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `npm install` | Start command: `node server.js`
4. Add all environment variables from `.env`
5. Deploy 🚀

---

## 🔌 API Endpoints Overview

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login & get JWT cookie
POST   /api/auth/forgot-password   Send reset email
PUT    /api/auth/reset-password    Reset with token

GET    /api/products               All products (with filters)
GET    /api/products/:id           Single product detail
POST   /api/reviews                Add a product review

POST   /api/cart                   Add to cart
GET    /api/cart                   Get user cart
DELETE /api/cart/:id               Remove item

GET    /api/wishlist               Get wishlist
POST   /api/wishlist               Add to wishlist

POST   /api/orders                 Place order
GET    /api/orders/my              My orders
GET    /api/orders/:id             Order detail

POST   /api/payment/razorpay       Create Razorpay order
POST   /api/payment/stripe         Create Stripe session

GET    /api/admin/dashboard        Admin analytics
GET    /api/admin/orders           All orders
PUT    /api/admin/orders/:id       Update order status
POST   /api/upload                 Upload image to Cloudinary
```

---

## 🛡️ Security Features

- 🔒 **JWT Authentication** stored in HTTP-only cookies
- 🔑 **Password hashing** with bcryptjs (salt rounds: 10)
- 🛡️ **Role-based access control** — Admin & User route guards
- ✅ **Input validation** via express-validator on all endpoints
- 🌐 **CORS** configured for trusted frontend origin only
- 🔐 **Environment variables** for all secrets — nothing hardcoded

---

## 📊 Admin Dashboard Features

- 📈 **Sales Analytics** — Revenue charts, total orders, top products
- 📦 **Product Management** — Add, edit, delete with Cloudinary image upload
- 🚚 **Order Management** — View all orders, update statuses (Pending → Delivered)
- 👥 **User Management** — View all users, manage roles
- 🏷️ **Coupon Codes** — Create and manage discount coupons

---

## 🔮 Future Enhancements

- [ ] 🤖 AI Product Recommendation Engine
- [ ] 🏪 Multi-Vendor Marketplace Support
- [ ] 💬 Real-Time Chat Support (Socket.io)
- [ ] 📱 React Native Mobile App
- [ ] 📧 Order Confirmation Email Notifications
- [ ] 🔍 Elasticsearch for Advanced Product Search

---

## 👨‍💻 Author

Made with ❤️ and a lot of ☕

**[🌐 Live App](https://shopsphere-gamma-eight.vercel.app/)** — Feel free to explore, register, and test the full flow!

---

<div align="center">

⭐ **If you found this project helpful, please give it a star!** ⭐

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel&logoColor=white)

</div>
