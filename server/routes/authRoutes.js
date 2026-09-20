const express = require("express");

const {
  register,
  login,
  refresh,
  me,
  logout,
  verifyEmailAddress,
  resendVerification,
  forgotPasswordRequest,
  resetPasswordRequest,
} = require("../controllers/authController");

const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/authValidation");

const router = express.Router();

// Register a new user
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(register)
);

// Login user
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(login)
);

// Generate a new access token
router.post(
  "/refresh",
  asyncHandler(refresh)
);

// Get currently authenticated user
router.get(
  "/me",
  protect,
  asyncHandler(me)
);

// Logout user
router.post(
  "/logout",
  asyncHandler(logout)
);

// Verify user's email address
router.get(
  "/verify-email/:token",
  asyncHandler(verifyEmailAddress)
);

// Send a new verification email
router.post(
  "/resend-verification",
  asyncHandler(resendVerification)
);

// Request a password reset email
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(forgotPasswordRequest)
);

// Set a new password using the reset token
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordRequest)
);

module.exports = router;