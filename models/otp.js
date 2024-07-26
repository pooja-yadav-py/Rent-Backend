const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the OTP schema
const otpSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  otp: {
    type: Number,
    required: true,
  },
  timestamp: {  // Timestamp when the OTP was created
    type: Date,
    default: Date.now,
    required: true,
    get: (timestamp) => timestamp.getTime(), // Getter to return the timestamp as milliseconds
    set: (timestamp) => new Date(timestamp), // Setter to convert the timestamp to a Date object
  },
});

const OtpModel = mongoose.model("otp", otpSchema);
module.exports = OtpModel;
