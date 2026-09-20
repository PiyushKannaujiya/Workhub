const nodemailer = require("nodemailer");

// Create a reusable SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send the email verification message
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl =
    `http://localhost:5173/verify-email/${verificationToken}`;

  await transporter.sendMail({
    from: `"WorkHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your WorkHub email",
    html: `
      <h2>Welcome to WorkHub</h2>

      <p>Please verify your email address by clicking the link below:</p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>This verification link will expire in 15 minutes.</p>
    `,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  // Frontend will use this token to open the password reset page
  const resetUrl =
    `http://localhost:5173/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: `"WorkHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your WorkHub password",
    html: `
      <h2>Password Reset</h2>

      <p>
        We received a request to reset your WorkHub password.
      </p>

      <p>
        Click the link below to create a new password:
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>
        This link will expire in 15 minutes.
      </p>

      <p>
        If you did not request this, you can safely ignore this email.
      </p>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};