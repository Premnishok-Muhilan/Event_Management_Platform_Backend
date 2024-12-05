// const mongoose = require("mongoose");
// Import the User model from the specified file path.
const User = require("../models/user");

const Event_Registration = require("../models/event_registration");

const Event_Creation = require("../models/event_creation");

const User_Support_Inquiry = require("../models/user_support_inquiry");

// const { default: mongoose } = require("mongoose");
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
const event_registration = require("../models/event_registration");

// Define the userController object which contains methods for user operations.
const userController = {
  // The register method handles user registration.
  register: async (request, response) => {
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

      // Check if a user with the given username already exists
      const existingUser = await User.findOne({
        $or: [{ Username }, { Email }],
      });

      if (existingUser) {
        // If user or email already exists, respond with a 400 status and an appropriate message
        if (
          existingUser.Username === Username &&
          existingUser.Email === Email
        ) {
          return response
            .status(400)
            .json({ message: "Username and Email already exists" });
        } else if (existingUser.Username === Username) {
          return response
            .status(400)
            .json({ message: "Username already exists" });
        } else if (existingUser.Email === Email) {
          return response.status(400).json({ message: "Email already exists" });
        }
      }

      // // Check if a user with the given username already exists in the database.
      // const user = await User.findOne({ Username });

      // // If the user exists, send a 400 status with an error message.
      // if (user) {
      //   return response.status(400).json({ message: "User already exists" });
      // }

      // Hash the password using bcrypt with a salt rounds value of 10.
      const hashedPassword = await bcrypt.hash(Password, 10);

      // Create a new User instance with the hashed password and other user details.
      const newUser = new User({
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
      await newUser.save();

      // NEW -- - - -- - - -- - - - - - - -- - - - -
      // 3. SEND THE TOKEN TO USER'S EMAIL ADDRESS
      //  const resetURL = `${request.protocol}://${request.get(
      //     "host"
      //   )}/api/v1/users/resetPassword/${resetToken}`;
      const message = `Hello ${newUser.username},\n\nThank you for registering with us! 
      We're excited to have you on board.\n\nBest regards,\nThe Team`;

      try {
        await sendEmail({
          email: newUser.Email,
          subject: "Welcome to Our Service!",
          message: message,
          html: `<html>
  <head>
    <style>
      body {
        font-family: "Arial", sans-serif;
        background-color: #000000;
        color: #ffffff;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #1c1c1c;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
        padding: 20px;
        text-align: center;
      }
      h1 {
        color: #ffffff;
      }
      p {
        color: #dddddd;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        background-color: green;
        color: white;
        text-decoration: none;
        border-radius: 25px;
        transition: background-color 0.3s;
      }
      
      .footer {
        font-size: 12px;
        color: #aaaaaa;
        text-align: center;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome!</h1>
      <p>Hi there,</p>
      <p>
        Thank you for registering with us! We're excited to have you join our
        community of event enthusiasts.
      </p>
      <p>Here’s what you can look forward to:</p>
      <ul style="list-style-type: none; padding: 0; color: #dddddd">
        <li>Exclusive access to upcoming events and early bookings.</li>
        <li>Personalized event recommendations based on your interests.</li>
        <li>Special discounts and offers for registered members.</li>
      </ul>
      <p>Start exploring our events today!</p>
      <a href="#" class="button" style="color:white">View Events</a>
      <p>We can’t wait to see you at our events!</p>
      <p>Best regards,<br />Your Event Team</p>
    </div>
    <div class="footer">
      &copy; 2024 Events page. All rights reserved.<br />
      If you have any questions, feel free to
      contact us.
    </div>
  </body>
</html>
`,
        });
      } catch (error) {
        response.status(500).json({ message: error.message });
      }

      // Respond with a 201 status indicating successful user creation.
      response.status(201).json({
        message:
          "User registration successful! An email has been sent to the user's email",
      });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },

  // The login method handles user authentication and token generation.
  login: async (request, response) => {
    // Extract username and password from the request body.
    const { Username, Password } = request.body;

    // Find a user with the given username in the database.
    const user = await User.findOne({ Username });

    // If no user is found, send a 400 status with an error message.
    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password stored in the database.
    const isPasswordCorrect = await bcrypt.compare(Password, user.Password);

    // If the password is incorrect, send a 400 status with an error message.
    if (!isPasswordCorrect) {
      return response.status(400).json({ message: "Invalid credentials" });
    }

    // If the password is correct, generate a JWT token with user information.
    //NOTE:
    //{ id: user._id, username: user.Username, name: user.name },
    //I removed the name
    const token = jwt.sign(
      { id: user._id, username: user.Username },
      JWT_SECRET
    );

    // Set a cookie with the token, configuring it for secure, HTTP-only access.
    response.cookie("token", token, {
      httpOnly: true, // Ensure the cookie is accessible only through HTTP(S) requests.
      sameSite: "none", // Allow the cookie to be sent with cross-site requests.
      expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Set cookie expiration to 24 hours from now.
      secure: true, // Ensure the cookie is only sent over HTTPS.
    });

    // Respond with a 200 status indicating successful login and include the token in the response.
    response.status(200).json({ message: "Login successful", token });
  },

  // The logout method handles user logout and cookie clearance.
  logout: async (request, response) => {
    try {
      // Clear the token cookie to effectively log out the user.
      response.clearCookie("token");

      // Respond with a 200 status indicating successful logout.
      response.status(200).json({ message: "Logout successful" });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },

  create_user_inquiry: async (request, response) => {
    try {
      const userId = request.userId;
      const { User_Comment } = request.body;
      const inquiry = new User_Support_Inquiry({
        User_Id: userId,
        User_Comment,
      });
      await inquiry.save();
      return response
        .status(200)
        .json({ message: "Support inquiry created successfully." });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },

  register_for_an_event: async (request, response) => {
    try {
      const userId = request.userId;

      const { Event_Id, Selected_Seat_Nos } = request.body;

      // FIND EVENT IN DB USING THE EVENT ID
      const event = await Event_Creation.findById(Event_Id);

      // CHECK TO SEE IF THE EVENT EXISTS USING THE EVENT ID
      if (!event) {
        return response.status(500).json({ message: "Event id not found!" });
      } else {
        if (event.Available_Seat_Nos.length === 0) {
          return response
            .status(500)
            .json({ message: "Sorry, no tickets left for the event!" });
        }
        // CHECK TO SEE IF THE USER HAS ALREADY REGISTERED FOR THE EVENT
        if (event.Attendee_Ids.includes(userId)) {
          return response
            .status(500)
            .json({ message: "User has already registered for the event!" });
        }

        // REMOVES THE SAME SEAT NO, IF ANY
        const Unique_Selected_Seat_Nos = [...new Set(Selected_Seat_Nos)];

        // Check to see if any of the Selected_Seat_Nos is already booked
        // Iterate through the Selected_Seat_Nos and see if any of the seat nos is present in Booked_Seat_Nos
        //Selected_Seat_Nos.forEach()
        const Already_Booked_Seat_Nos = [];
        for (const number of Unique_Selected_Seat_Nos) {
          if (event.Booked_Seat_Nos.includes(number)) {
            Already_Booked_Seat_Nos.push(number);
          }
        }

        if (Already_Booked_Seat_Nos.length > 0) {
          return response.status(500).json({
            message: `One or more seats that you have selected is already booked! Please choose another seat instead of the following seat/seats ${Already_Booked_Seat_Nos.join(
              ", "
            )}`,
          });
        } else {
          let revenue = 0; // Use 'let' instead of 'const'

          // Assuming `Selected_Seat_Nos` is an array of selected seat numbers
          // and `event` is an object with `VIP_Seats`, `Ticket_Price_VIP`, and `Ticket_Price_General` properties

          for (const seat of Selected_Seat_Nos) {
            if (event.VIP_Seats.includes(seat)) {
              revenue += event.Ticket_Price_VIP;
            } else {
              revenue += event.Ticket_Price_General;
            }
          }
          // const event_name = await Event_Creation.findById(Event_Id)
          const newEventRegistration = new Event_Registration({
            User_Id: userId,
            Event_Id,
            Selected_Seat_Nos: Unique_Selected_Seat_Nos,
            Event_Name: event.Title,
            Event_Date: event.Date,
            // Feedback,
            // Rating,
            Registration_Date: Date.now(),
            Revenue: revenue,
          });
          // Save the event registration to the database.
          await newEventRegistration.save();

          // Update the Booked_Seat_Nos in the event creation collection
          event.Booked_Seat_Nos = [
            ...event.Booked_Seat_Nos,
            ...Unique_Selected_Seat_Nos,
          ];

          // Remove the booked seat nos from the Available_Seat_Nos
          const Updated_Available_Seat_Nos = event.Available_Seat_Nos.filter(
            (seat) => !event.Booked_Seat_Nos.includes(seat)
          );

          event.Available_Seat_Nos = Updated_Available_Seat_Nos;

          //Update the Attendee_ids in the event
          event.Attendee_Ids.push(userId);

          await event.save();

          // Respond with a 201 status indicating successful user creation.
          response
            .status(201)
            .json({ message: "Event registered successfully" });
        }
      }
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },
  get_all_registrations: async (request, response) => {
    try {
      // Extract userId from the request (ensure `userId` is correctly attached to the request object)
      const userId = request.userId;

      if (!userId) {
        return response.status(400).json({ message: "User ID is missing" });
      }

      // Find all registrations where User_Id matches the userId
      const all_user_registrations = await Event_Registration.find({
        User_Id: userId,
      });

      if (all_user_registrations.length === 0) {
        return response
          .status(404)
          .json({ message: "No registrations found for this user" });
      }

      return response.status(200).json({
        message: "Successfully got all the registrations made by the user",
        all_user_registrations,
      });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      return response.status(500).json({ message: error.message });
    }
  },
  transfer_tickets: async (request, response) => {
    try {
      const userId = request.userId;

      // Extract the user id of the user to whom the tickets has to be transferred

      const { Transfer_Username, Event_Id } = request.body;

      // Check to see whether the username is valid
      const destination_user = await User.findOne({
        Username: Transfer_Username,
      });

      if (!destination_user) {
        return response
          .status(404)
          .json({ message: "The provided username doesn't exist!" });
      }

      // Get the user registration details
      const previous_registration_details = await Event_Registration.findOne({
        Event_Id: Event_Id,
        User_Id: userId,
      });

      // Remove the attendee id of the previous user who has registered for the event
      // and update the attendee id with the transferred user's id
      const event = await Event_Creation.findOne({
        _id: Event_Id,
      });

      const index = event.Attendee_Ids.findIndex((id) => id.equals(userId));

      if (index !== -1) {
        // Replace the old ID with the new ID
        event.Attendee_Ids[index] = destination_user._id;
      }

      await event.save();

      // Change the registered tickets to another user
      previous_registration_details.User_Id = destination_user._id;

      await previous_registration_details.save();

      return response.status(200).json({
        message: "Successfully transferred tickets!",
        previous_registration_details,
      });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      return response.status(500).json({ message: error.message });
    }
  },

  event_feedback: async (request, response) => {
    try {
      const userId = request.userId;
      const { Event_Id, Feedback, Rating } = request.body;

      // CHECK WHETHER THE EVENT EXISTS
      const event = await Event_Creation.findById(Event_Id);

      if (!event) {
        return response.status(404).json({
          message: "The event doesn't exist! Please provide a valid event id",
        });
      }

      // CHECK WHETHER THE USER HAS REGISTERED FOR THE EVENT
      if (!event.Attendee_Ids.includes(userId)) {
        return response.status(403).json({
          message: "Please register for the event to provide feedback!",
        });
      }

      // CHECK WHETHER THE USER HAS ALREADY PROVIDED FEEDBACK FOR THE EVENT
      if (event.Feedback_Provided_Attendee_Ids.includes(userId)) {
        return response.status(400).json({
          message: "User has already provided feedback!",
        });
      }

      // CHECK WHETHER THE EVENT HAS CONCLUDED
      const eventDate = new Date(event.Date);
      const eventTime = event.Time;

      // Construct the date-time string in a valid format
      const eventDateTime = new Date(
        `${eventDate.toISOString().split("T")[0]}T${eventTime}`
      );

      if (isNaN(eventDateTime.getTime())) {
        return response.status(500).json({
          message: "Invalid event date or time format.",
        });
      }

      const currentDateTime = new Date();

      if (currentDateTime < eventDateTime) {
        return response.status(400).json({
          message:
            "Feedback can only be provided after the event has concluded.",
        });
      }

      // Add feedback and rating
      event.Attendee_Feedback_And_Rating.push({
        User_Id: userId,
        Feedback,
        Rating,
      });

      // Update Feedback_Provided_Attendee_Ids
      event.Feedback_Provided_Attendee_Ids.push(userId);

      // Calculate the average rating
      let total_rating = 0;
      const numberOfRatings = event.Attendee_Feedback_And_Rating.length;

      // Sum up all the ratings
      for (const obj of event.Attendee_Feedback_And_Rating) {
        if (typeof obj.Rating === "number" && !isNaN(obj.Rating)) {
          total_rating += obj.Rating;
        }
      }

      // Calculate average rating
      const average_rating =
        numberOfRatings > 0 ? total_rating / numberOfRatings : -1; // Default to -1 if no ratings
      event.Average_Rating = parseFloat(average_rating.toFixed(2));

      // event.Average_Rating = average_rating;

      // Save the updated event
      await event.save();

      response.status(200).json({
        message: "Feedback submitted successfully!",
      });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  // The me method retrieves and returns the currently authenticated user's data.
  me: async (request, response) => {
    try {
      // Extract the user ID from the request object (assuming userId is set by middleware).
      const userId = request.userId;

      // Find the user by ID, excluding the password, version, and _id fields from the response.
      const user = await User.findById(userId).select("-password -__v -_id");

      // If the user does not exist, send a 404 status with an error message.
      if (!user) {
        return response.status(404).json({ message: "User is not logged in!" });
      }

      // If the user exists, respond with a 200 status and include the user data in the response.
      response.status(200).json({ message: "User found", user });
    } catch (error) {
      // Catch any errors that occur and respond with a 500 status and error message.
      response.status(500).json({ message: error.message });
    }
  },

  forgotPassword: async (request, response) => {
    try {
      //sample test
      // response.status(200).send(request.body);

      // 1.Check to see if the user exists in the database
      // 1.CHECK TO SEE IF THE USER ALREADY EXISTS IN THE DATABASE
      const user = await User.findOne({ Email: request.body.Email });

      // When the user doesn't exist in the database
      if (!user) {
        return response.status(404).json({
          message: "User with the provided email address doesn't exist!",
        });
      }

      // 2. GENERATE A PASSWORD RESET TOKEN
      // We'll store this is the db in hashed form
      // We'll send the non-hashed version of the reset token to user

      // Generates 32 random bytes and converts to a hexadecimal string
      // Reset token in unhashed format
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Store the reset token in db
      // Reset tokoen in hashed token
      user.Password_Reset_Token = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set the passwordReset token expiry time
      // the resetToken will expire in 10 minutes
      user.Password_Reset_Token_Expiry = Date.now() + 10 * 60 * 1000;

      // Save the user
      await user.save();

      // 3. SEND THE TOKEN TO USER'S EMAIL ADDRESS
      const resetURL = `${request.protocol}://${request.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
      const message = `Password reset request received! The password reset link will be valid for ten minutes. Link to reset password \n ${resetURL}`;

      try {
        await sendEmail({
          email: user.Email,
          subject: "PASSWORD RESET",
          message: message,
        });
        response.status(200).json({
          status: "success",
          message: "password reset link has been sent to the user's email",
        });
      } catch (error) {
        // CLEAR THE PASSWORD RESET TOKEN IN DB
        // WHEN WE'RE UNABLE TO SEND THE EMAIL
        user.Password_Reset_Token = undefined;
        user.Password_Reset_Token_Expiry = undefined;

        response.status(500).json({ message: error.message });
      }
      // Send the unhashed version of the passwordResetToken to the user
      // response.status(200).json({ message: resetToken });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  // forgotPassword:async(request,response)=>{
  //   try {
  //     // Check if the user exists
  //     const user = await User.findOne({ Email: request.body.Email });
  //     if (!user) {
  //       return response.status(404).json({
  //         message: "User with the provided email address doesn't exist!",
  //       });
  //     }

  //     // Generate a password reset token
  //     const resetToken = crypto.randomBytes(32).toString("hex");
  //     user.Password_Reset_Token = crypto
  //       .createHash("sha256")
  //       .update(resetToken)
  //       .digest("hex");
  //     user.Password_Reset_Token_Expiry = Date.now() + 10 * 60 * 1000;

  //     // Save the user
  //     await user.save();

  //     // Send the reset token to the user's email address
  //     const resetURL = `${request.protocol}://${request.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  //     const message = `Password reset request received! The password reset link will be valid for ten minutes. Link to reset password \n ${resetURL}`;

  //     try {
  //       await sendEmail({
  //         email: user.Email,
  //         subject: "PASSWORD RESET",
  //         message: message,
  //       });
  //       response.status(200).json({
  //         status: "success",
  //         message: "Password reset link has been sent to the user's email",
  //       });
  //     } catch (error) {
  //       // Clear the password reset token in the database if email sending fails
  //       user.Password_Reset_Token = undefined;
  //       user.Password_Reset_Token_Expiry = undefined;
  //       await user.save();
  //       response.status(500).json({ message: error.message });
  //     }
  //   } catch (error) {
  //     response.status(500).json({ message: error.message });
  //   }
  // },
  resetPassword: async (request, response) => {
    try {
      // 1. CHECK TO SEE IF THE USER HAS A PASSWORD RESET TOKEN
      // AND THE PASSWORD RESET TOKEN HAS NOT EXPIRED
      // Get the password reset token from the url params and
      // hash the password reset token to search in the database!
      // NOTE
      // DB HAS HASHED VERSION OF THE PASSWORD RESET TOKEN
      const hashed_password_reset_token = crypto
        .createHash("sha256")
        .update(request.params.token)
        .digest("hex");
      const user = await User.findOne({
        Password_Reset_Token: hashed_password_reset_token,
        Password_Reset_Token_Expiry: { $gt: Date.now() },
      });

      // If the user doesn't exist
      // or
      // the password reset token has expired
      if (!user) {
        return response.status(400).json({
          message: "Password reset token is invalid or it has expired",
        });
      }

      // RESETTING THE USER PASSWORD
      if (request.body.password === request.body.confirmPassword) {
        // Hash the password using bcrypt with a salt rounds value of 10.
        const hashedPassword = await bcrypt.hash(request.body.password, 10);

        //Store the hashed password
        user.Password = hashedPassword;

        user.Password_Reset_Token = undefined;
        user.Password_Reset_Token_Expiry = undefined;
        user.Password_Changed_At = Date.now();

        // STORE THE CHANGES IN THE DATABASE
        user.save();

        // LOGOUT THE USER
        // Clear the token cookie to effectively log out the user.
        response.clearCookie("token");

        // Respond with a 200 status indicating successful logout.
        response.status(200).json({
          message:
            "Password reset successful and the user has been logged out!",
        });
      } else {
        response.status(400).json({
          message: "The password and the confirm password don't match",
        });
      }

      // user.password = request.body.password;
      // user.confirmPassword = request.body.confirmPassword;
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
};

// Export the userController object to make it available for import in other modules.
module.exports = userController;
