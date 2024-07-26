const nodemailer = require("nodemailer");

// Create a transporter object using the SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to send an email
const sendMail = async (email, subject, content) => {
  try {
    // Define the email options
    let mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: content,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log("Mail sent", info.messageId);
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  sendMail,
};
