//import the config module and
//destructure the properties from the object returned by the require call
const { GMAIL, GMAIL_PASS } = require("./config");

const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use Gmail service
    auth: {
      user: GMAIL, // Your Gmail address
      pass: GMAIL_PASS, // Your Gmail password or App password
      //   html: "<p>Hello, this is a <b>test email</b>.</p>",
    },
    secure: true, // Use TLS for secure connections
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  // 2. DEFINE EMAIL OPTIONS
  const mailOptions = {
    from: GMAIL, // Sender address
    to: options.email, // List of recipients
    subject: options.subject, // Subject line
    text: options.message, // Plain text body
    html: options.html, // HTML body (optional)
  };

  // 3. SEND EMAIL
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = sendEmail;
