"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../Controllers/authController"));
const adminController_1 = __importDefault(require("../Controllers/adminController"));
const route = express_1.default.Router();
route.post("/register", adminController_1.default.updateRole, authController_1.default.registerUser);
route.post("/verify", authController_1.default.verifyUser);
route.post("/login", authController_1.default.login);
route.get("/users", authController_1.default.protect, authController_1.default.restrictTo("admin"), adminController_1.default.getAllUsers);
route.get("/userData", authController_1.default.protect, authController_1.default.restrictTo("admin"), adminController_1.default.getUser);
route.delete("/deleteUser", authController_1.default.protect, authController_1.default.restrictTo("admin"), adminController_1.default.deleteUser);
exports.default = route;
