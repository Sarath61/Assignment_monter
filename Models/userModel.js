const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { type } = require("os");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: [true, "Username required"],
    unique: true,
    trim: true,
    minLength: [5, "A name must have more than 5 letters"],
  },
  email: {
    type: String,
    require: [true, "Please provid your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide the valid email"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    require: [true, "Password is required"],
    minLength: 8,
    select: false,
  },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  age: Number,
  DOB: Date,
  description: {
    type: String,
    trim: true,
  },
  work: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
});

userSchema.pre("save", async function (next) {
  // hash the password with cost of 12
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("users", userSchema);

module.exports = User;
