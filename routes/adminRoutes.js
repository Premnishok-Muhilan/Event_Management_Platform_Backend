const express = require("express");
const adminController = require("../controllers/adminController");
const auth = require("../utils/auth");
const adminRouter = express.Router();

/*
IMPORTANT:
    auth.verifyToken -> Requires the user to be logged in
*/
// define the endpoints
adminRouter.post("/create-an-event", auth.verifyToken,auth.isAdmin,adminController.create_event);
adminRouter.post("/register-admin", adminController.register_admin);
adminRouter.post("/login-admin", adminController.admin_login);

//Get all the information about the events
adminRouter.get("/get-all-events-info",adminController.get_all_events_info);
adminRouter.get("/get-event-info-by-id/:id",adminController.get_event_by_id)


adminRouter.post("/respond-to-user-inquiry/:inquiryId",auth.verifyToken,auth.isAdmin,adminController.respond_to_user_inquiry);
adminRouter.post("/respond-to-event-feedback-by-user/",auth.verifyToken,auth.isAdmin,adminController.respond_to_event_feedback_by_user);
adminRouter.delete("/delete-user/:id",auth.verifyToken,auth.isAdmin,adminController.delete_user)


//Only admin users who have logged in can now see all the users
adminRouter.get("/get-all-users", auth.verifyToken, auth.isAdmin, adminController.get_all_users);

// userRouter.post("/logout", auth.verifyToken, userController.logout);

// userRouter.get("/me", auth.verifyToken, userController.me);
// //Anyone can view all the users
// //userRouter.get('/', auth.verifyToken,  userController.getAllUsers);

// //Only admin users who have logged in can now see all the users
// userRouter.get("/", auth.verifyToken, auth.isAdmin, userController.getAllUsers);

// // Routes for Password reset functionality
// userRouter.post("/forgot-password", userController.forgotPassword);
// userRouter.put("/reset-password/:token", userController.resetPassword);

module.exports = adminRouter;
