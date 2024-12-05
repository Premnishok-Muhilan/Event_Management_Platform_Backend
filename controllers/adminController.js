// Import the User model from the specified file path.
const Event_Creation = require("../models/event_creation");

const User_Support_Inquiry = require("../models/user_support_inquiry");

// Import the Admin model
const Admin = require("../models/admin");

const User = require("../models/user");

// Import the bcrypt library for hashing and comparing passwords.
const bcrypt = require("bcrypt");

// Import the jsonwebtoken library for creating and verifying tokens.
const jwt = require("jsonwebtoken");

// Import the crypto
const crypto = require("crypto");

//Import email module
const sendEmail = require("../utils/email");

// Destructure JWT_SECRET from the config file for use in token generation.
const { JWT_SECRET } = require("../utils/config");

// Define the userController object which contains methods for user operations.
const adminController = {
  register_admin: async (request, response) => {
    try {
      // Extract username, password, and name from the request body.
      const {
        First_Name,
        Last_Name,
        Username,
        Password,
        Email,
        Role,
        Password_Changed_At,
        Password_Reset_Token,
        Password_Reset_Token_Expiry,
      } = request.body;

      // Hash the password using bcrypt with a salt rounds value of 10.
      const hashedPassword = await bcrypt.hash(Password, 10);

      // Create a new User instance with the hashed password and other user details.
      const newAdmin = new Admin({
        First_Name,
        Last_Name,
        Username,
        Password: hashedPassword, // Store hashed password
        Email,
        Role,
        Password_Changed_At,
        Password_Reset_Token,
        Password_Reset_Token_Expiry,
      });

      // Save the newly created user to the database.
      await newAdmin.save();

      // Respond with a 201 status indicating successful user creation.
      response.status(201).json({ message: "User created successfully" });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },
  // The login method handles user authentication and token generation.
  admin_login: async (request, response) => {
    const { Username, Password } = request.body;

    try {
      const admin = await Admin.findOne({ Username });

      if (!admin) {
        return response.status(400).json({ message: "Admin not found" });
      }

      const isPasswordCorrect = await bcrypt.compare(
        Password.trim(),
        admin.Password
      );

      if (!isPasswordCorrect) {
        return response.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: admin._id, username: admin.Username },
        JWT_SECRET
      );

      response.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: true,
      });

      return response.status(200).json({ message: "Login successful", token });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },
  delete_user: async (request, response) => {
    try {
      const userId = request.params.id;
      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return response.status(404).json({ message: "User not found" });
      }

      response.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },

  create_event: async (request, response) => {
    try {
      const {
        Title,
        Description,
        Category,
        Date,
        Time,
        Location,
        Ticket_Price_VIP,
        Ticket_Price_General,
        Maximum_Attendees_Possible,
        Attendee_Ids,
        Available_Seat_Nos,
        Booked_Seat_Nos,
      } = request.body;

      const newEvent = new Event_Creation({
        Title,
        Description,
        Category,
        Date,
        Time,
        Location,
        Ticket_Price_VIP,
        Ticket_Price_General,
        Maximum_Attendees_Possible,
        Attendee_Ids,
        Available_Seat_Nos,
        Booked_Seat_Nos,
      });

      // Save the newly created user to the database.
      await newEvent.save();

      // Respond with a 201 status indicating successful user creation.
      response.status(201).json({ message: "Event created successfully" });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },
  get_all_events_info: async (request, response) => {
    try {
      const all_event_details = await Event_Creation.find();
      return response.status(200).json({
        message: "Successfully fetched the details of all events!",
        all_event_details,
      });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  get_all_users: async (request, response) => {
    try {
      // get all the users from the database
      const users = await User.find().select("-password -__v");

      // return the users
      response.status(200).json({ message: "All users", users });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  get_event_by_id: async (request, response) => {
    try {
      const event_id = request.params.id;
      const event_info = await Event_Creation.findById(event_id);

      // return the users
      response.status(200).json({ message: "Event information", event_info });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  respond_to_user_inquiry: async (request, response) => {
    try {
      const Inquiry_Id = request.params.inquiryId;
      const { Admin_Comment, Resolved_Status } = request.body;
      const inquiry = await User_Support_Inquiry.findById(Inquiry_Id);
      if (!inquiry) {
        return response.status(500).json({ message: "Inquiry not found" });
      }
      inquiry.Admin_Comment = Admin_Comment;
      inquiry.Resolved_Status = Resolved_Status;
      if (Resolved_Status) {
        inquiry.Resolved_At = Date.now(); // Set the resolved date
      }
      await inquiry.save();
      return response
        .status(200)
        .json({ message: "Inquiry responded to successfully" });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },

  respond_to_event_feedback_by_user: async (request, response) => {
    try {
      // const feedbackId = request.params.feedbackId;
      const {
        Event_Id,
        Feedback_Id,
        Admin_Response_To_User_Feedback,
        Has_Admin_Responded_To_User_Feedback,
      } = request.body;

      //eventId, feedbackId, adminResponse
      // Find the event by ID
      const event = await Event_Creation.findById(Event_Id);
      if (!event) {
        return response
          .status(404)
          .json({ message: "No event exists with the provided event id!" });
      }

      // Find the feedback entry by its ID
      const feedback = event.Attendee_Feedback_And_Rating.id(Feedback_Id);
      if (!feedback) {
        return response.status(404).json({
          message:
            "No feedback exists for the provided event id with the provided feedback id!",
        });
      }
      if (feedback.Has_Admin_Responded_To_User_Feedback) {
        return response.status(400).json({
          message: "Admin has already responded to the user's feedback!",
        });
      }

      // Update the admin response
      feedback.Admin_Response_To_User_Feedback =
        Admin_Response_To_User_Feedback;
      feedback.Has_Admin_Responded_To_User_Feedback =
        Has_Admin_Responded_To_User_Feedback;

      feedback.Admin_Feedback_Created_At = Date.now();

      // Save the updated event document
      await event.save();
      return response
        .status(404)
        .json({ message: "Admin response added successfully!" });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
};

// Export the userController object to make it available for import in other modules.
module.exports = adminController;
