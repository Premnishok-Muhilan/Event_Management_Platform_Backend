//BACKEND SERVER USING EXPRESS.JS

//import the app module
const app = require("./app");

//import the config module and
//destructure the properties from the object returned by the require call
const { MONGODB_URI, PORT } = require("./utils/config");

/*import the Mongoose library
The Mongoose library exports an object that includes methods and
properties for connecting to a MongoDB database, defining schemas,
creating models, and performing various database operations.
*/
const mongoose = require("mongoose");

/*
By including require("dotenv").config(); at the beginning of your main
application file (often index.js or app.js), you instruct the dotenv package
 to read the .env file and populate process.env with the variables defined in it.
*/
require("dotenv").config();

//open connection with mongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    /*
    This .then() block is executed if the Promise
    returned by mongoose.connect() resolves successfully.
    */
    console.log("Successfully connected to MongoDB Atlas");

    console.log(`Connected to database: ${mongoose.connection.name}`);

    //start the server and listen on port
    app.listen(PORT, () => {
      console.log(`Express server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    /*
    If the connection fails, the .catch() block handles the error.
    It logs an appropriate message, which can be useful for troubleshooting
    connection issues, such as incorrect connection strings, network issues,
    or authentication problems.
    */
    console.log("Couldn't connect to MongoDB Atlas.Error: ", error);
  });

// Todo back end from earlier development
