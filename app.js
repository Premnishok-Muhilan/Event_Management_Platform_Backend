// import the express module
const express = require("express");

const requestLogger = require("./utils/logger");

const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");

const cookieParser = require("cookie-parser");

// create an express application
const app = express();

// use the express middleware for enabling CORS
// UNCOMMENTED CODE - - - - - - - - - - - - - -
app.use(
  cors({
    //origin: "https://legendary-tanuki-2610f2.netlify.app",
    origin: "http://localhost:5173",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
);

/* 
I tried to use this but it gives
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the
remote resource at ‘http://localhost:3001/api/v1/users/register’. 
(Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’
is ‘*’).
*/
// app.use(
//   cors({
//     origin: "*", // This allows requests from any domain
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );

/*
  Yet to try this out!
*/
// app.use(
//   cors({
//     origin: "http://deployed-frontend.com", // Replace with your actual frontend URL
//     credentials: true, // Allows the server to accept cookies or authorization headers
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allows these HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allows these headers
//     optionSuccessStatus: 200, // Provides a status code for preflight requests
//   })
// );

// use the cookie parser middleware
app.use(cookieParser());

// use the express middleware for parsing json data
app.use(express.json());

// use the express middleware for logging
app.use(requestLogger);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/admin", adminRouter);

// COMMENTED BEFORE - - - - - - - - - - - - - - - -
// app.use("/api/v1/todos", todoRouter);

module.exports = app;
