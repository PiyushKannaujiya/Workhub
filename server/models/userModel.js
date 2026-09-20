const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Indicates whether the user has verified their email
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Temporary token used for password reset
    resetPasswordToken: {
      type: String,
    },

    // Time after which the reset token becomes invalid
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;