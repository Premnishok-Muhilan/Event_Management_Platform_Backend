const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

// Define the schema for event registrations
const eventRegistrationSchema = new Schema({
  User_Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  Event_Id: {
    type: Schema.Types.ObjectId, // Assuming Event_id refers to an ObjectId in another collection
    // ref: 'Event', // Reference to the Event model, if applicable
    required: true,
  },
  Event_Name: String,
  Event_Date:Date,

  Selected_Seat_Nos: [Number],
  Registration_Date: Date,
  Revenue: Number,

  // FEEDBACK AND RATING IN event_registration
  // Feedback: {
  //   type: String,
  //   default: "", // Default to an empty string
  // },
  // Rating: {
  //   type: Number,
  //   min: -1, // Optional: Set minimum rating value
  //   max: 5, // Optional: Set maximum rating value
  //   default: -1, // Default rating value
  // },
});

// SYNTAX:
// mongoose.model(modelName, schema, collectionName);
module.exports = mongoose.model(
  "Event_Registration",
  eventRegistrationSchema,
  "Event_Registrations_Collection"
);
