const express = require("express");
const authController = require("../Controllers/authController");
const adminController = require("../Controllers/adminController");
const route = express.Router();

route.post("/signup", adminController.updateRole, authController.signup);
route.post("/login", authController.login);
route.get("/users",authController.protect,authController.restrictTo('admin'),adminController.getAllUsers)
route.get("/userData",authController.protect,authController.restrictTo('admin'),adminController.getUser)
route.delete('/deleteUser',authController.protect,authController.restrictTo('admin'),adminController.deleteUser)
module.exports = route;
