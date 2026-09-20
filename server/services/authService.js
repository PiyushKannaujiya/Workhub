const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./emailService");

// ==================== REGISTER ====================

const registerUser = async ({ name, email, password }) => {
  // Check whether the user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password before storing it in MongoDB
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Create a short-lived token for email verification
  const verificationToken = generateVerificationToken(user._id);

  // Send the verification link to the user's email
  await sendVerificationEmail(
    user.email,
    verificationToken
  );

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  };
};

// ==================== LOGIN ====================

const loginUser = async ({ email, password }) => {
  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare plain password with stored bcrypt hash
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate short-lived access token
  const accessToken = generateAccessToken(user._id);

  // Generate long-lived refresh token
  const refreshToken = generateRefreshToken(user._id);

  // Never send password back to the client
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: userResponse,
    accessToken,
    refreshToken,
  };
};

// ==================== ACCESS TOKEN ====================

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

// ==================== REFRESH TOKEN ====================

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==================== REFRESH ACCESS TOKEN ====================

const refreshAccessToken = async (refreshToken) => {
  // Verify the refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  // Generate a new access token
  const accessToken = generateAccessToken(decoded.userId);

  return accessToken;
};

// ==================== CURRENT USER ====================

const getCurrentUser = async (userId) => {
  // Fetch user without exposing the password
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ==================== VERIFICATION TOKEN ====================

const generateVerificationToken = (userId) => {
  // Verification token expires after 15 minutes
  return jwt.sign(
    { userId },
    process.env.JWT_VERIFICATION_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

// ==================== VERIFY EMAIL ====================

const verifyEmail = async (token) => {
  // Verify that the token is valid and has not expired
  const decoded = jwt.verify(
    token,
    process.env.JWT_VERIFICATION_SECRET
  );

  // Find the user associated with this token
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Don't update an already verified account
  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  // Mark the user's email as verified
  user.isVerified = true;

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  };
};

// ==================== RESEND VERIFICATION ====================

const resendVerificationEmail = async (email) => {
  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  // Don't send verification emails to already verified users
  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  // Generate a fresh verification token
  const verificationToken = generateVerificationToken(
    user._id
  );

  // Send the new verification link
  await sendVerificationEmail(
    user.email,
    verificationToken
  );
};

// ==================== FORGOT PASSWORD ====================

const forgotPassword = async (email) => {
  // Find the account associated with this email
  const user = await User.findOne({ email });

  // Don't reveal whether an account exists
  if (!user) {
    return;
  }

  // Generate a secure random reset token
  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  // Store token and expiry in the database
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires =
    Date.now() + 15 * 60 * 1000;

  await user.save();

  // Send reset link to the user's email
  await sendPasswordResetEmail(
    user.email,
    resetToken
  );
};

// ==================== RESET PASSWORD ====================

const resetPassword = async (token, newPassword) => {
  // Find the user and make sure the reset token has not expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Hash the new password before storing it
  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  user.password = hashedPassword;

  // Remove the reset token so it cannot be used again
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
};

// ==================== EXPORTS ====================

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  generateVerificationToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};