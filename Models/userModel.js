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
  passwordConfirm: {
    type: String,
    require: [true, "PasswordConfirm is required"],
    minLength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
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
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
