const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// Define the schema for the user
const userSchema = new Schema({
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
    enum: ["user", "admin"],
    default: "user",
  },
  Password_Changed_At: Date,
  Password_Reset_Token: String,
  Password_Reset_Token_Expiry: Date,
  // Event_Registrations: [eventRegistrationsSchema],
});

// Create models based on the schemas
// const User = mongoose.model('User', userSchema);
module.exports = mongoose.model("User", userSchema, "Users_Collection");

// SYNTAX:
// mongoose.model(modelName, schema, collectionName);
/*I changed the name of the collection since I faced index issues
  {
    "message": "E11000 duplicate key error collection: Password-Reset-Task.users index: email_1 dup key: { email: null }"
  }
  since there was a fsdwe56db having the same collection name as users
 */
// module.exports = mongoose.model("User", userSchema, "users_collection");

// COMMENTED BEFORE - - - - - - - - - - - - - - - -
// module.exports = mongoose.model("User", userSchema, "users");

// // Define the schema for the address
// const eventRegistrationsSchema = new Schema({
//   Event_id: String,
//   Seat_nos: [],
//   Feedback: String,
//   Rating: Number,
//   // street: { type: String, required: true },
//   // city: { type: String, required: true },
//   // postalCode: { type: String, required: true }
// });
// // create a new schema
// const userSchema = new mongoose.Schema({
//   First_Name: String,
//   Last_Name: String,
//   Username: String,
//   Password: String,
//   Email: String,
//   role: {
//     type: String,
//     enum: ["user", "admin"],
//     default: "user",
//   },
//   Password_Changed_At: Date,
//   Password_Reset_Token: String,
//   Password_Reset_Token_Expiry: Date,
//   Event_Registrations: [eventRegistrationsSchema],
// });
