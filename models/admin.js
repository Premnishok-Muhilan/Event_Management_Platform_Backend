const mongoose = require("mongoose");
const { Schema } = mongoose;

// // Define the schema for the support inquiry
// const supportInquirySchema = new Schema({
//   User_Id: {
//     type: Schema.Types.ObjectId,
//     ref: "User", // Reference to the User model
//     required: true,
//   },
//   User_Comment: {
//     type: String,
//     required: true,
//   },
//   Admin_Comment: {
//     type: String,
    
//   },
//   Resolved_Status: {
//     type: Boolean,
//     default: false,
//   },
//   Created_At: {
//     type: Date,
//     default: Date.now,
//   },
// });

// Define the main schema for the user
const adminSchema = new Schema({
  First_Name: {
    type: String,
    required: true,
  },
  Last_Name: {
    type: String,
    required: true,
  },
  Username: {
    type: String,
    required: true,
    unique: true, // Ensures the value is unique and automatically creates an index
  },
  Password: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true, // Ensures the value is unique and automatically creates an index
  },
  Role: {
    type: String,
    // enum: ["user", "admin"], // Enum for role validation
    default: "admin",
  },
  Password_Changed_At: Date,
  Password_Reset_Token: String,
  Password_Reset_Token_Expiry: Date,
  // User_Support_Inquiries: [supportInquirySchema], // Embed support inquiry schema as an array
});

// Create models based on the schemas
// module.exports = mongoose.model("User", userSchema, "Users_Collection");
module.exports = mongoose.model("Admin", adminSchema, "Admins_Collection");
