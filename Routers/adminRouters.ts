import express from "express";
import authController from "../Controllers/authController";
import adminController from "../Controllers/adminController";

const route = express.Router();

route.post(
  "/register",
  adminController.updateRole,
  authController.registerUser
);
route.post("/verify", authController.verifyUser);
route.post("/login", authController.login);
route.get(
  "/users",
  authController.protect,
  authController.restrictTo("admin"),
  adminController.getAllUsers
);
route.get(
  "/userData",
  authController.protect,
  authController.restrictTo("admin"),
  adminController.getUser
);
route.delete(
  "/deleteUser",
  authController.protect,
  authController.restrictTo("admin"),
  adminController.deleteUser
);

export default route;
