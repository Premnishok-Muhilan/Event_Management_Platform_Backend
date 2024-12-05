require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const GMAIL = process.env.GMAIL;
const GMAIL_PASS = process.env.GMAIL_PASS;

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  GMAIL,
  GMAIL_PASS
};
