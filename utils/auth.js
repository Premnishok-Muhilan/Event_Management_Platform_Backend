// Import the jsonwebtoken library for handling JSON Web Tokens.
const jwt = require("jsonwebtoken");

// Import the JWT_SECRET from the config file, used for token verification.
/*
JWT_SECRET is a secret key used to sign and verify JWTs.
It is a string that should be kept confidential and used
consistently to ensure token integrity. The secret key
ensures that the token was issued by a trusted source
and has not been tampered with.
*/
const { JWT_SECRET } = require("./config");

const User = require("../models/user");
// Import the Admin model
const Admin = require("../models/admin");

// Define an 'auth' object that contains authentication-related middleware functions.
const auth = {
  // Middleware function to verify the presence and validity of a token.
  verifyToken: (request, response, next) => {
    try {
      // Extract the token from the request cookies.
      // Tokens are often sent in cookies for secure storage and transmission.
      const token = request.cookies.token;

      // Check if the token is missing from the request.
      // If there is no token, respond with a 401 Unauthorized status and an error message.
      if (!token) {
        return response.status(401).json({ message: "Unauthorized" });
      }

      // If a token exists, attempt to verify it.
      // Use jsonwebtoken's verify function to check the token's validity and decode it.
      try {
        // The 'jwt.verify' function takes the token and the secret key (JWT_SECRET).
        // It verifies the token's signature and decodes the payload if valid.
        /*
        The jwt.verify(token, JWT_SECRET) line is responsible for ensuring that a JWT is valid,
        unaltered, and not expired. It does this by:
          Decoding the token into its components.
          Verifying the token's signature using a secret key.
          Checking the validity of claims within the token.
        */
        const decoded = jwt.verify(token, JWT_SECRET);

        //console.log(decoded, "decoded");
        /*{
          id: '66d47d6ff61ed10d3e4ed753',
          username: 'user1',
          name: 'Prem',
          iat: 1725289147
        }*/

        // On successful verification, the decoded payload contains user data.
        // Attach the user ID from the decoded payload to the request object.
        // This allows downstream middleware and route handlers to access the user ID.
        request.userId = decoded.id;

        // Call the next middleware function in the stack.
        // This passes control to the next middleware or route handler.
        next();
      } catch (error) {
        // If the token verification fails (e.g., due to invalid signature or expiration),
        // respond with a 401 Unauthorized status and an error message.
        return response.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      // Catch any errors that occur during the execution of the middleware.
      // Respond with a 500 Internal Server Error status and the error message.
      response.status(500).json({ message: error.message });
    }
  },
  isAdmin: async (request, response, next) => {
    try {
      // get the user id from the request object
      const adminId = request.userId;

      // get the user from the database
      const admin = await Admin.findById(adminId);

      if (!admin) {
        return response.status(404).json({
          message: "The provided admin user credentials couldn't be found!",
        });
      }

      // if the user is not an admin, return an error
      if (admin.Role !== "admin") {
        return response.status(403).json({ message: "Forbidden!" });
      }

      // if the user is an admin, call the next middleware
      next();
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  isUser: async (request, response, next) => {
    try {
      // get the user id from the request object
      const userId = request.userId;

      // get the user from the database
      const user = await User.findById(userId);

      if (!userId) {
        return response.status(404).json({
          message: "The provided user credentials couldn't be found!",
        });
      }

      // if the user is not an admin, return an error
      if (user.Role !== "user") {
        return response
          .status(403)
          .json({ message: "Please login in as user!" });
      }

      // if the user is an admin, call the next middleware
      next();
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
};

// Export the 'auth' object to make the verifyToken middleware available for use in other modules.
module.exports = auth;

/*
How jwt.verify Works

Token Structure:
  JWTs are structured into three parts:
      Header: Contains metadata about the token (e.g., the algorithm used for signing).
      Payload: Contains the claims or data, such as user ID and token expiration.
      Signature: A cryptographic signature created using the header and payload, and the secret key.

  When you call jwt.verify(token, JWT_SECRET), the following happens:

    Decode the Token: The method decodes the JWT into its three components: header, payload, and signature.
    
    Check Signature: It then verifies the signature using the JWT_SECRET. This involves re-generating the 
    signature based on the header and payload, and comparing it with the signature part of the token. 
    If they match, the token is considered authentic. 
    
    Validate Claims: The method checks the claims in the payload, such as expiration (exp), issued at (iat),
    and other custom claims, if present.If any claims are invalid (e.g., the token is expired), the method
    will throw an error.
    
    Return Decoded Payload: If the token is valid and the signature matches, jwt.verify returns the decoded
    payload (i.e., the data encoded in the token)


    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    // Output: { sub: '1234567890', name: 'John Doe', iat: 1516239024 }
*/
