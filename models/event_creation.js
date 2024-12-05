const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

// Import the user model
const User = require("./user");

// Define a schema for Attendee Feedback and Rating
// WITHOUT ANY DEFAULT VALUE
const feedbackSchema = new Schema({
  User_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Ensure this matches the exact name of your User model
    required: true,
  },
  Feedback: {
    type: String,
    required: true,
  },
  Rating: {
    type: Number,
    required: true,
  },
  Admin_Response_To_User_Feedback: {
    type: String, // Field to store the admin's response
  },
  Has_Admin_Responded_To_User_Feedback: {
    type: Boolean,
    default: false,
  },
  Admin_Feedback_Created_At: {
    type: Date,
  },
});

// Define a schema for Attendee Feedback and Rating
// WITH DEFAULT VALUE
// const feedbackSchema = new Schema({
//   User_Id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Ensure this matches the exact name of your User model
//     required: true,
//   },
//   Feedback: {
//     type: String,
//     default: "", // Default empty string if no feedback is provided
//   },
//   Rating: {
//     type: Number,
//     default: 0, // Default rating value if not provided
//   },
// });

// Define the schema for event registrations
const eventCreationSchema = new Schema({
  Title: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
  Time: {
    type: String, // e.g., "14:30:00"
    required: true,
  },
  Location: {
    type: String,
    required: true,
  },
  Ticket_Price_VIP: {
    type: Number,
    required: true,
  },
  VIP_Seats: {
    type: [Number],
    default: [1, 2, 3, 4], // Default value for VIP_Seats
  },
  Ticket_Price_General: {
    type: Number,
    required: true,
  },
  Maximum_Attendees_Possible: {
    type: Number,
    required: true,
  },
  Attendee_Ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this matches the exact name of your User model
    },
  ],
  Available_Seat_Nos: [Number],
  Booked_Seat_Nos: {
    type: [Number],
    default: [],
  },
  Feedback_Provided_Attendee_Ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this matches the exact name of your User model
    },
  ],
  Attendee_Feedback_And_Rating: [feedbackSchema],
  Average_Rating: {
    type: Number,
    default: -1,
  },
});

// SYNTAX:
// mongoose.model(modelName, schema, collectionName);
module.exports = mongoose.model(
  "Event_Creation",
  eventCreationSchema,
  "Event_Creations_Collection"
);
