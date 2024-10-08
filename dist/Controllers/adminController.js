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
const userModel_1 = __importDefault(require("../Models/userModel"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const updateRole = (req, res, next) => {
    req.body.role = "admin";
    next();
};
const getAllUsers = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const usersData = yield userModel_1.default.aggregate([
        {
            $match: {
                role: {
                    $ne: "admin",
                },
            },
        },
        {
            $project: {
                _id: 0,
                username: 1,
            },
        },
    ]);
    res.status(200).json({
        status: "success",
        usernames: usersData,
    });
}));
const getUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const user = yield userModel_1.default.findOne({ username, role: { $ne: "admin" } });
    res.status(200).json({
        status: "success",
        data: user,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    yield userModel_1.default.deleteOne({ username });
    res.status(204).json({
        status: "success",
        data: null,
    });
}));
exports.default = {
    getAllUsers,
    getUser,
    deleteUser,
    updateRole,
};
