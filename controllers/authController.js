const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// ─── Generate JWT ─────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: "Email already registered" });
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please provide email and password" });

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: "Invalid email or password" });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: "Account has been deactivated" });

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  sendTokenResponse(user, 200, res);
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.cookie("token", "none", { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ success: true, message: "Logged out successfully" });
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name images price");
  res.json({ success: true, user });
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ success: false, message: "No user with that email" });

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6366f1">Reset Your ShopSphere Password</h2>
      <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="color:#666;margin-top:20px">If you didn't request this, ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject: "ShopSphere Password Reset", html: message });
    res.json({ success: true, message: "Password reset email sent" });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ success: false, message: "Email could not be sent" });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
};

// ─── UPDATE PASSWORD ──────────────────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword)))
    return res.status(401).json({ success: false, message: "Current password is incorrect" });

  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
};
