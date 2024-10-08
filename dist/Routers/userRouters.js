"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../Controllers/authController"));
const userControllers_1 = __importDefault(require("../Controllers/userControllers"));
const router = express_1.default.Router();
router.post("/register", authController_1.default.registerUser);
router.post("/verify", authController_1.default.verifyUser);
router.post("/login", authController_1.default.login);
router.get("/myprofile", authController_1.default.protect, userControllers_1.default.getUser);
router.patch("/updateMe", authController_1.default.protect, userControllers_1.default.updateMe);
exports.default = router;
