/** 
 * @file The index file creates the Express application, sets up the server and implements routes to Api
 * endpoints used to access myFlix data. Requests made to these endpoints use mongoose models created in the 
 * models file and are authenticated using strategies implemented in the passport file. The connect method 
 * establishes a connection between mongoose and the database, which is hosted on MongoDB Atlas. The 
 * server and endpoints are hosted on Heroku.
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires './models.js' The file where data schemas and models are defined.
 * @requires express Used to create an express application.
 * @requires morgan Used to log requests made to the database.
 * @requires passport Used to create strategies for authenticating and authorising requests to the Api endpoints.
 * @requires './auth.js' The file that implements the user login route.
 * @requires cors Used to control origins from which requests to the server can be made.
 * @requires express-validator Used to perform validation on data provided when creating or updating a user.
 */

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Models = require("./models.js");

//Imports express-validator for validating methods on thr backend
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const cors = require('cors');
app.use(cors());

const { CONNECTION_URI } = require("./config");

//mongoose.connect('mongodb://localhost:27017/test',
//{useNewUrlParser: true, useUnifiedTopology: true});

mongoose
  .connect(CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  }); //Connecting to database


//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"));
app.use(express.static("public"));

//Import cors - Middleware for controlling which domains have access
// const cors = require("cors");
// let allowedOrigins = [
//   "http://localhost:8080",
//   "http://localhost:1234",
//   "http://localhost:4200",
//   "http://localhost:3000",
//   "https://myflix-movietime.herokuapp.com",
//   "https://myflix-movietime.netlify.app",
//   "https://rusevaivelina.github.io",
//   "*",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn’t found on the list of allowed origins
//         let message =
//           "The CORS policy for this application doesn’t allow access from origin " +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

//adding CORS to allow access from various domains:
//const cors = require('cors');
//app.use(cors());

const passport = require("passport"); // requires passport into index.js
require("./passport"); //imports passport file into index.js
app.use(passport.initialize());
require("./auth")(app); //imports auth file into index.js

/**
 * All http requests in express take a callback function as a parameter. The function takes as parameters
 * the request and response objects, which can then be used to access the data associated with the request.
 * This callback type will be named: 'requestCallback'.
 * @callback requestCallback
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

/**
 * Some endpoints are protected. The second parameter of requests made to these endpoints invokes a named 
 * authentication strategy. If authentication succeeds, the authenticated user is attached to the request 
 * object and the request callback is fired. This callback type will be named: 'authenticationCallback'.
 * @callback authenticationCallback
 * @param {string} strategy - the name of the passport strategy used.
 * @param {Object} config - configuration object. Used here to specify that sessions are not used.  
 */

//Error handler

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
  next();
});

//Requests/Responses

/**
 * GET request to the landing page ('/') endpoint.
 * @method GET
 * @param {string} URL 
 * @param {requestCallback}
 * @returns {string} The welcome message.
 */ 

app.get("/", (req, res) => {
  res.send("Welcome to myFlix Homepage"); //gets the homepage
});

if (process.env.NODE_ENV == 'production') {

  app.use(express.static(path.join(__dirname, '/client/build')));

  app.get('*', (req, res) => {

      res.sendFile(path.join(__dirname, 'client ', 'build', 'index.html'));
  })
} else {

  app.get('/', (req, res) => {

      res.send("server is running")
  })
}

//Return all movies (GET/READ)

/**
 * GET request to the /movies endpoint. Return a list of ALL movies to the user.
 * @method GET
 * @param {string} URL
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of all the movie records in the database.
 */

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

//Return data about a single movie by title (GET/READ)

app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(error);
        res.status(500).send("Error: " + err);
      });
  }
);

//Returns genre description by title (GET/READ)

/**
 * GET request to the /genres endpoint. Return a list of ALL genres to the user.
 * @method GET
 * @param {string} URL
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of all the genre records in the database.
 */

app.get(
  "/movies/genre/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.name })
      .then((genre) => {
        res.json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Returns diresctor's info (GET/READ)

app.get(
  "/movies/director/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.name })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//New user registration/Add user (POST/CREATE)

/**
 * POST request to the /users endpoint to create a new user record. This request requires a request 
 * body containing the fields: FirstName, LastName, Username, Password, Email, Birthdate. The fields are first validated 
 * against specified validators before the new user record is created.
 * @method POST 
 * @param {string} URL
 * @param {object} validationChain Series of checks that validate specified fields in the request body.
 * @param {requestCallback}
 * @returns {Object} An object containing the new user record.
 * 
 * Expect a JSON object in this format:
    {
        FirstName: {type: String, required: true},
        LastName: {type: String, required: true},
        Username: {type: String, required: true},
        Email: {type: String, required: true},
        Password: {type: String, required: true},
        Birthdate: Date
    }
 */

app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username can only contain letters and numbers - no special characters allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Password", "Password must be at least 6 characters long").isLength({
      min: 8,
    }),
    check("Email", "Valid email is required").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req); //check the validation object for errors

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Gets all users (GET/READ)
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Gets user by username (GET/READ)

/**
 * GET request to the /users/[UserID] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /users/647585932171739405
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing the record for the user included in the URL. 
 */

app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Updates user info by username (PUT/UPDATE)

/**
 * PUT request to the /users/[UserID] endpoint to update the user's details. This request requires 
 * a request body containing the fields: FirstName, LastName, Username, Password, Email, Birthday. The fields are first 
 * validated against specified validators before the user record is updated.
 * @method PUT
 * @param {string} URL
 * @example /users/647585932171739405
 * @param {object} validationChain Series of checks that validate specified fields in the request body.
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */

app.put(
  "/users/:username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username can only contain letters and numbers - no special characters allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Password", "Password must be at least 6 characters long").isLength({
      min: 8,
    }),
    check("Email", "Valid email is required").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    console.log();
    console.log("Body From Server : ", req.body);
    console.log();

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.email,
          Birthday: req.body.Birthday,
        },
      },
      { returnDocument: "after" }, //This line makes sure the updated document is returend
      function (err, updatedUser) {
        if (err) {
          console.error(error);
          res.status(500).send("Error: " + err);
        } else {
          console.log();
          console.log("Updated Body From Server 2: ", updatedUser);
          console.log();

          res.json(updatedUser);
        }
      }
    );
  }
);

//Adds a movie to users' profile (POST/CREATE)

/**
 * POST request to the /users/[UserID]/movies/[MovieID] endpoint to add a movie to the user's favourites list. 
 * @method PUT
 * @param {string} URL
 * @example /users/647585932171739405/movies/123145646547822
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */

app.post(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, //This line makes sure the updated document is returend
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Deletes a movie from users' favorite list of movies (DELETE)

/**
 * DELETE request to the /users/[UserID]/movies/[MovieID] endpoint to remove a movie from the user's favourites list. 
 * @method DELETE
 * @param {string} URL
 * @example /users/647585932171739405/movies/123145646547822
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */

app.delete(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Removes user from db by username (DELETE)

/**
 * DELETE request to the /users/[UserID] endpoint.
 * @method DELETE
 * @param {string} URL
 * @example /users/647585932171739405
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} A text message: '[Username] has been deregistered'.
 */

app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove(
      { Username: req.params.username },
      function (err, docs) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          console.log("Deleted User : ", docs);
          res.status(200).send(req.params.username + " was deleted.");
          res.status(200).send(docs);
        }
      }
    );
  }
);

//Documentation

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

//Listen for requests

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port: " + port);
});
