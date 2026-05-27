const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.post("/stripe/create-intent", protect, async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, currency: "inr",
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

router.post("/razorpay/create-order", protect, async (req, res) => {
  const Razorpay = require("razorpay");
  const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const { amount } = req.body;
  const order = await rzp.orders.create({ amount: amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` });
  res.json({ success: true, order });
});

router.get("/razorpay/key", protect, (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
