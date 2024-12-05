const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../utils/auth");
const userRouter = express.Router();

/*
IMPORTANT:
    auth.verifyToken -> Requires the user to be logged in
*/
// define the endpoints
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/logout", auth.verifyToken, userController.logout);
userRouter.get("/me", auth.verifyToken, userController.me);

userRouter.post("/create-user-inquiry",auth.verifyToken,auth.isUser,userController.create_user_inquiry);
userRouter.get("/get-all-registrations",auth.verifyToken,userController.get_all_registrations);

// Transfer tickets to another valid user
userRouter.put("/transfer-tickets",auth.verifyToken,userController.transfer_tickets);
userRouter.post("/register-for-an-event",auth.verifyToken, userController.register_for_an_event);
userRouter.post("/event-feedback",auth.verifyToken,userController.event_feedback)


//Anyone can view all the users
//userRouter.get('/', auth.verifyToken,  userController.getAllUsers);

// //Only admin users who have logged in can now see all the users
// userRouter.get("/", auth.verifyToken, auth.isAdmin, userController.getAllUsers);

// Routes for Password reset functionality
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.put("/reset-password/:token", userController.resetPassword);

module.exports = userRouter;
