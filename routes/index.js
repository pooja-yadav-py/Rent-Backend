const express = require("express");
const routes = express.Router();

const {
  registerUser,
  loginUser,
  getUsers,
  getUser,
  refreshAccessToken,
  sendOtp,
  verifyOtp,
} = require("../userController/index");
const {
  userRegisterValidate,
  userLoginValidate,
  otpMailvalidator,
  verifyOtpValidator,
} = require("../utils/userValidation");
const { ensureAuthenticated } = require("../utils/auth");

routes.post("/register", userRegisterValidate, registerUser);

routes.post("/login", userLoginValidate, loginUser);

routes.post("/refresh-token", refreshAccessToken);

routes.get("/users", ensureAuthenticated, getUsers);

routes.get("/user", ensureAuthenticated, getUser);

// otp verification routes
routes.post("/send-otp", otpMailvalidator, sendOtp);

routes.post("/verify-otp", verifyOtpValidator, verifyOtp);

module.exports = routes;
