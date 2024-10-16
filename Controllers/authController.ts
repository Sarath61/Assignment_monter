import catchAsync from "../utils/catchAsync";
import User from "../Models/userModel";
import jwt, { SigningKeyCallback } from "jsonwebtoken";
import { JwtVerifyPromisified } from "jsonwebtoken";
import otpGenerator from "otp-generator";
import AppError from "../utils/appError";
import validator from "validator";
import sendEmail from "../utils/email";
import { promisify } from "node:util";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const registerInput = z.object({
  username: z.string().min(5).max(10),
  password: z.string().min(6).max(20),
  email: z.string().min(12).max(30),
});

interface Idecode extends SigningKeyCallback {
  id?: string;
}

const validType = (input: string) => {
  if (validator.isEmail(input)) {
    return "email";
  } else {
    return "username";
  }
};

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const parsedInput = registerInput.safeParse(req.body);

    if (!parsedInput.success) {
      const error = parsedInput.error;
      return next(
        new AppError("Please provide username,password and email", 400)
      );
    }

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
    newUser.otpExpires = new Date(Date.now() + 60 * 60 * 1000);
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
  }
);

export const verifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Please provide email and OTP", 400));
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError("Invalid OTP or expired OTP", 401));
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
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { input, password } = req.body;

    // 1) check if email and password exist
    if (!input || !password) {
      return next(new AppError("Please provide email and Password", 401));
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
  }
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    //  1) Get the token and check if exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in again", 401)
      );
    }

    // 2) verification token

    const verfiyAsync = promisify(jwt.verify) as JwtVerifyPromisified;

    const decoded: Idecode = await verfiyAsync(token, process.env.JWT_SECRET);

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
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("User need to login to perform this action", 403)
      );
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permissions to perform this action", 403)
      );
    }
    next();
  };
};

export default {
  restrictTo,
  protect,
  login,
  verifyUser,
  registerUser,
};
