const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} = require("../services/authService");

// ==================== REGISTER ====================

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const result = await registerUser({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    ...result,
  });
};

// ==================== LOGIN ====================

const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser({
    email,
    password,
  });

  // Store refresh token in an HTTP-only cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Login successful",
    user: result.user,
    accessToken: result.accessToken,
  });
};

// ==================== REFRESH ====================

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token not found");
  }

  const accessToken = await refreshAccessToken(
    refreshToken
  );

  res.json({
    success: true,
    accessToken,
  });
};

// ==================== CURRENT USER ====================

const me = async (req, res) => {
  const user = await getCurrentUser(req.userId);

  res.json({
    success: true,
    user,
  });
};

// ==================== LOGOUT ====================

const logout = (req, res) => {
  // Remove the refresh token from the browser
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    success: true,
    message: "Logout successful",
  });
};

// ==================== VERIFY EMAIL ====================

const verifyEmailAddress = async (req, res) => {
  // Get verification token from URL
  const { token } = req.params;

  const user = await verifyEmail(token);

  res.json({
    success: true,
    message: "Email verified successfully",
    user,
  });
};

// ==================== RESEND VERIFICATION ====================

const resendVerification = async (req, res) => {
  const { email } = req.body;

  await resendVerificationEmail(email);

  res.json({
    success: true,
    message: "Verification email sent successfully",
  });
};

// ==================== FORGOT PASSWORD ====================

const forgotPasswordRequest = async (req, res) => {
  const { email } = req.body;

  await forgotPassword(email);

  // Don't reveal whether the email exists
  res.json({
    success: true,
    message:
      "If the account exists, a password reset email has been sent.",
  });
};

// ==================== RESET PASSWORD ====================

const resetPasswordRequest = async (req, res) => {
  // Token comes from the reset URL
  const { token } = req.params;

  // New password comes from the request body
  const { newPassword } = req.body;

  await resetPassword(token, newPassword);

  res.json({
    success: true,
    message: "Password reset successfully",
  });
};

// ==================== EXPORTS ====================

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
  verifyEmailAddress,
  resendVerification,
  forgotPasswordRequest,
  resetPasswordRequest,
};