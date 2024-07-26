require("dotenv").config();
const UserModel = require("../models/usermodel");
const OtpModel = require("../models/otp"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../utils/mailer");
const { oneMinuteExpiry, threeMinuteExpiry } = require("../utils/otpvalidator");
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

// Generate a 6-digit OTP
const generateOTP = async() => {
  return Math.floor(100000 + Math.random() * 900000);
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
        password: hashedPassword
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
      return res.status(400).json({ success: false, message: "error", error });
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
      return res.status(200).json({ success: true, message: "success", data: loggedInUser });
    } catch (error) {
      return res.status(500).json({ success: false, message: "error", data: error });
    }
  },

  refreshAccessToken: async (req, res) => {
    console.log("req===============", req);
    try {
      const refresAccessToken = req.body.headers.authorization.split(" ")[1];
      const email = req.body.headers["email"];

      let loggedInUser = await UserModel.findOne({ email }, { password: 0 });

      if (!loggedInUser || loggedInUser.refreshToken !== refresAccessToken) {
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
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
        .status(400)
        .json({ success: false, message: "Error refreshing access token", error });
    }
  },

  sendOtp : async (req,res) => {
   const  { email } = req.body;
    console.log("====req",req.body)

    // Check if email is not provided in the request body
    if (!email ) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user data using the provided email
    try {
      const userData = await UserModel.findOne({ email });
      
      // If user data is not found, return an error response
      if (!userData) {
        return res.status(404).json({success: false, message: "Email doesn't exist" });
      }

      // Check if the user is already verified
      if(userData.verified===true){
        return res.status(400).json({success: false, message: userData.email+" mail is already verified"})
      }

      // Generate a new OTP
      const genrated_OTP = await generateOTP();

      // Check for existing OTP data for the user
      const old_otp_data = await OtpModel.findOne({ user_id:userData._id });

      // If old OTP data exists, check a new OTP can be sent (2nd otp send after a min.)
      if(old_otp_data){        
        const sendNextOtp = await oneMinuteExpiry(old_otp_data.timestamp);
        if(!sendNextOtp){
          return res.status(400).json({
            success: false,
            message: "please try after some time!"
          })
        }
      }

      // Get the current date and time
      const currentDate = new Date();

       // Update or insert OTP data for the user
      await OtpModel.findOneAndUpdate(
        { user_id:userData._id },
        { otp:genrated_OTP, timestamp:new Date(currentDate.getTime())}, 
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      
      // Prepare the email message
      const message =  '<p> Hi <b>'+userData.fullName+'</b>, </br> <h4> Use this OTP and be a verified user, '+genrated_OTP+'</h4></p>';
      console.log(message)

      // Send the OTP email
      mailer.sendMail(userData.email, 'Otp verification', message);

      // Return a success response
      return res.status(200).json({success: true, message:"Otp has been sent to your mail,please check!"})
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  verifyOtp : async (req,res) => {
    const { user_id , otp} = req.body;
    try {
      // Check if user_id and otp are provided in the request body
      if (!user_id || !otp ) {
        return res
          .status(400)
          .json({ success: false, message: "user_id and otp are required" });
      }

      // Find OTP data from the OtpModel using user_id and otp
      const otpData = await OtpModel.findOne({user_id,otp});
      
      // If otpData is not found, return an error response
      if(!otpData){
        return res
        .status(400)
        .json({ success: false, message: "You entered wrong otp!" });
      }

      // Check if the OTP has expired using the threeMinuteExpiry function
      const isOtpExpired = await threeMinuteExpiry(otpData.timestamp);

      // If the OTP is expired, return an error response
      if(isOtpExpired){
        return res
        .status(400)
        .json({ success: false, message: "Your otp has been expired!" });
      }

      // Update the user's verified status to true in the UserModel
      await UserModel.findByIdAndUpdate({ _id: user_id },{
        $set:{
          is_verified : true
        }
      })

      // Return a success response
      return res
        .status(200)
        .json({ success: true, message: "Account verified Successfully!" });
      
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
};
