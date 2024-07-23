require("dotenv").config();
const UserModel = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Helper functions for token generation and refresh
function generateAccessToken(user) {
  const tokenObject = { _id: user._id, email: user.email };
  return jwt.sign(tokenObject, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  const tokenObject = { _id: user._id, email: user.email };
  return jwt.sign(tokenObject, REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
}

module.exports = {
  registerUser: async (req, res) => {
    console.log(req.body);
    const { fullName, email, password } = req.body;

    try {
      // Check for existing user with the same email
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash password securely
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("pppp");
      // Create and save new user
      const newUser = new UserModel({
        fullName,
        email,
        password: hashedPassword,
      });
      const savedUser = await newUser.save();

      // Remove password from response for security reasons
      savedUser.password = undefined;

      res
        .status(201)
        .json({ message: "User registered successfully", data: savedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error registering user" });
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const user = await UserModel.findOne({ email });
      console.log("==========user", user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // Generate access and refresh tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      console.log("========accessToken", accessToken);
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).json({
        message: "success",
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "error", error });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await UserModel.find({}, { password: 0 });
      return res.status(200).json({ data: users });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  getUser: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      console.log("Decoded", decoded);
      let loggedInUser = await UserModel.find(
        { email: decoded.email },
        { password: 0 }
      );
      console.log("loggedInUser====", loggedInUser);
      return res.status(200).json({ message: "success", data: loggedInUser });
    } catch (error) {
      return res.status(500).json({ message: "error", data: error });
    }
  },

  refreshAccessToken: async (req, res) => {
    console.log("req===============", req);
    try {
      const refresAccessToken = req.body.headers.authorization.split(" ")[1];
      const email = req.body.headers["email"];

      let loggedInUser = await UserModel.findOne({ email }, { password: 0 });

      if (!loggedInUser || loggedInUser.refreshToken !== refresAccessToken) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(loggedInUser);
      const newRefreshToken = generateRefreshToken(loggedInUser);

      // Save the new refresh token in the database
      loggedInUser.refreshToken = newRefreshToken;
      await loggedInUser.save();

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Error refreshing access token", error });
    }
  },
};
