const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for the support inquiry
const userSupportInquirySchema = new Schema({
  User_Id: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  User_Comment: {
    type: String,
    required: true,
  },
  Admin_Comment: {
    type: String,
  },
  Resolved_Status: {
    type: Boolean,
    default: false,
  },
  Created_At: {
    type: Date,
    default: Date.now,
  },
  Resolved_At: {
    type: Date,
  },
});

// SYNTAX:
// mongoose.model(modelName, schema, collectionName);
module.exports = mongoose.model(
  "User_Support_Inquiry",
  userSupportInquirySchema,
  "User_Support_Inquiries_Collection"
);
