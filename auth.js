/**
 * @file The auth file implements the login route for registered users.
 * @requires passport Used to create strategies for authenticating and authorizing requests to the Api endpoints.
 * @requires './passport.js' The file where the passport strategies are implemented.
 * @requires jsonwebtoken Used to create json web tokens for authorizing requests to protected endpoints. 
 */

const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file

/**
 * Generates a json web token that is used to authorize requests to protected routes that implement 
 * the jwt passport strategy.
 * @function generateToken 
 * @param {*} user - Authenticated user returned by the local passport strategy.
 * @returns {string} A json web token.
 */


let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}

/**
 * Implements and exports a POST request to the /login endpoint for logging in a registered user. 
 * There is no body required for this request but a Username and Password must be provided in the
 * request parameters. By submitting these fields in an html form in the front end, they can be
 * attached to the login URL as a query string. The request is authenticated using the local passport 
 * strategy and, if successful, a json web token is created by calling the generateToken function. The
 * token is returned along with the authenticated user.
 * @function
 * @param {*} app The express application created in the index file.
 * @returns {Object} An object containing the record for the logged in user and the json web token.
 */


/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
