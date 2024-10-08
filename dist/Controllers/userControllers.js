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
exports.updateMe = exports.getUser = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const userModel_1 = __importDefault(require("../Models/userModel"));
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
exports.getUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        satuts: "success",
        data: {
            user: req.user,
        },
    });
}));
exports.updateMe = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) create error if user POSTs password , username , email
    if (req.body.password || req.body.username || req.body.email) {
        return next(new appError_1.default("This not for Password or Username/email update.", 400));
    }
    // 2) ownly wanted fields are taken and unwanted are filtered
    const filerdBody = filterObj(req.body, "age", "location", "description", "DOB", "work");
    // 3) update user documnet
    if (!req.user.isVerified) {
        return next(new appError_1.default("User not verified", 400));
    }
    const updatedUser = yield userModel_1.default.findByIdAndUpdate(req.user.id, filerdBody, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
}));
exports.default = {
    updateMe: exports.updateMe,
    getUser: exports.getUser,
};
