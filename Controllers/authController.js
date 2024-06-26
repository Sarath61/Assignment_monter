const catchAsync = require("../utils/catchAsync");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const validator = require("validator");

const validType = (input) => {
  if (validator.isEmail(input)) {
    return "email";
  } else {
    return "username";
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const id = newUser._id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { input, password } = req.body;
  // 1) check if email and password exist
  if (!input || !password) {
    return next(new AppError("Please provide email and Password"));
  }

  // 2) check if user exists && password is correct
  const query =
    validType(input) == "email" ? { email: input } : { username: input };
  const user = await User.findOne(query).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email/Username or password", 401));
  }
  // 3) if everything ok, send token to client
  const id = user._id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
