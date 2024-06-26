const catchAsync = require("../utils/catchAsync");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const AppError = require("../utils/appError");
const validator = require("validator");
const sendEmail = require("../utils/email");
const { promisify } = require("util");

const validType = (input) => {
  if (validator.isEmail(input)) {
    return "email";
  } else {
    return "username";
  }
};

exports.registerUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,                                                   
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  if (req.body.role === "admin") {
    newUser.role = "admin";
  }
  newUser.otp = otp;
  newUser.otpExpires = Date.now() + 60 * 60 * 1000;
  await newUser.save();
  const message = `Your opt is ${otp}`;
  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP verification",
      message,
    });
    console.log("reached");
    res.status(200).json({
      status: "success",
      message: "OTP send to email!",
    });
  } catch (err) {
    newUser.otp = undefined;
    newUser.otpExpires = undefined;
    await newUser.save();
    return next(
      new AppError("There was error sending in OTP, Try again later", 500)
    );
  }
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError("Please provide email and OTP"));
  }
  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Invalid OTP or expired OTP"));
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();
  const id = user._id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    message: "Account verified successfully",
    data: {
      token,
      user,
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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //  1) Get the token and check if exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in again"));
  }

  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user  still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to the token no longer exist", 401)
    );
  }
  // Grant access to protected route
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permissions to perform this action", 403)
      );
    }
    next();
  };
};
