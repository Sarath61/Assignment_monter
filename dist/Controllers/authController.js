"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = exports.login = exports.verifyUser = exports.registerUser = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const userModel_1 = __importDefault(require("../Models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const appError_1 = __importDefault(require("../utils/appError"));
const validator_1 = __importDefault(require("validator"));
const email_1 = __importDefault(require("../utils/email"));
const node_util_1 = require("node:util");
const validType = (input) => {
    if (validator_1.default.isEmail(input)) {
        return "email";
    }
    else {
        return "username";
    }
};
exports.registerUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield userModel_1.default.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    });
    const otp = otp_generator_1.default.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    if (req.body.role === "admin") {
        newUser.role = "admin";
    }
    newUser.otp = otp;
    newUser.otpExpires = new Date(Date.now() + 60 * 60 * 1000);
    yield newUser.save();
    const message = `Your opt is ${otp}`;
    try {
        yield (0, email_1.default)({
            email: newUser.email,
            subject: "OTP verification",
            message,
        });
        console.log("reached");
        res.status(200).json({
            status: "success",
            message: "OTP send to email!",
        });
    }
    catch (err) {
        newUser.otp = undefined;
        newUser.otpExpires = undefined;
        yield newUser.save();
        return next(new appError_1.default("There was error sending in OTP, Try again later", 500));
    }
}));
exports.verifyUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return next(new appError_1.default("Please provide email and OTP", 400));
    }
    const user = yield userModel_1.default.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new appError_1.default("Invalid OTP or expired OTP", 401));
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    yield user.save();
    const id = user._id;
    const token = jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
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
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { input, password } = req.body;
    // 1) check if email and password exist
    if (!input || !password) {
        return next(new appError_1.default("Please provide email and Password", 401));
    }
    // 2) check if user exists && password is correct
    const query = validType(input) == "email" ? { email: input } : { username: input };
    const user = yield userModel_1.default.findOne(query).select("+password");
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new appError_1.default("Incorrect Email/Username or password", 401));
    }
    // 3) if everything ok, send token to client
    const id = user._id;
    const token = jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
}));
exports.protect = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    //  1) Get the token and check if exists
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new appError_1.default("You are not logged in! Please log in again", 401));
    }
    // 2) verification token
    const decoded = yield (0, node_util_1.promisify)(jsonwebtoken_1.default.verify)(token, process.env.JWT_SECRET);
    // 3) Check if user  still exists
    const freshUser = yield userModel_1.default.findById(decoded.id);
    if (!freshUser) {
        return next(new appError_1.default("The user belonging to the token no longer exist", 401));
    }
    // Grant access to protected route
    req.user = freshUser;
    next();
}));
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.default("You do not have permissions to perform this action", 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
exports.default = {
    restrictTo: exports.restrictTo,
    protect: exports.protect,
    login: exports.login,
    verifyUser: exports.verifyUser,
    registerUser: exports.registerUser,
};
