const express = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userControllers");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/myprofile", authController.protect, userController.getUser);
router.patch("/updateMe", authController.protect, userController.updateMe);
module.exports = router;
