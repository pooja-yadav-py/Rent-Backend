const UserModel = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  // validate req.body -done
  // create mongodb usermodel -done
  // do password encrption -
  // save data to mongodb
  // return response to the client
  registerUser: async (req, res) => {
    
    const userModel = new UserModel(req.body);
    userModel.password = await bcrypt.hash(req.body.password, 10);

    try {
      const response = await userModel.save();
      response.password = undefined;
      return res.status(201).json({ message: "success", data: response });
    } catch (error) {
      return res.status(500).json({ message: "error", data: error });
    }
  },
  // check user using email
  // compare password
  // create jwt token
  // send response to client
  loginUser: async (req, res) => {
    console.log("==============",req.body)
    try {
      
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(200)
          .json({ message: "Auth failed, Invalid username/password" });
      }
      const isPassEqual = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPassEqual) {
        return res
          .status(200)
          .json({ message: "Auth failed, Invalid username/password" });
      }
      const tokenObject = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      };
      const jwttoken = jwt.sign(tokenObject, process.env.SECRET, {
        expiresIn: "4h",
      });
      return res.status(200).json({  message: "success", data: jwttoken  });
    } catch (error) {
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
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.SECRET);
      let loggedInUser = await UserModel.find(
        { email: decoded.email },
        { password: 0 }
      );
      return res.status(200).json({ message: "success", data: loggedInUser });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },
};
