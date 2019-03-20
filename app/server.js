const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");

const {
  PORT,
  HTTP_STATUS_CODES,
  MONGO_URL,
  TEST_MONGO_URL
} = require("./config");
const { authRouter } = require("./auth/authRouter");
const { userRouter } = require("./user/userRouter");
const { noteRouter } = require("./note/noteRouter");
const { localStrategy, jwtStrategy } = require("./auth/authStrategy");

let server;
const app = express();
passport.use(localStrategy);
passport.use(jwtStrategy);

//middleware
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static("./public"));

//ROUTER SETUP
app.use("api/auth", authRouter);
app.use("api/user", userRouter);
app.use("api/note", noteRouter);

//handle unhandled request instead of crashing server
app.use("*", function(req, res) {
  res
    .status(HTTP_STATUS_CODES.NOT_FOUND)
    .json({ error: 'unhandled request error *: Not found' });
});

module.exports = {
  app,
  startServer,
  stopServer
};

function startServer(testEnv) {
  return new Promise((resolve, reject) => {
    let mongoUrl;
    if (testEnv) {
      mongoUrl = TEST_MONGO_URL;
    } else {
      mongoUrl = MONGO_URL;
    }
    mongoose.connect(mongoUrl, { useNewUrlParser: true }, err => {
      if (err) {
        console.error(err);
        return reject(err);
      } else {
        server = app
          .listen(PORT, () => {
            console.log(`Express server listening on http://localhost:${PORT}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            console.error(" connection error:", err);
            reject(err);
          });
      }
    });
  });
}

function stopServer() {
  return mongoose
    .disconnect()
    .then(
      () =>
        new Promise((resolve, reject) => {
          server.close(err => {
            if (err) {
              console.error("sever close error: ", err);
              return reject(err);
            } else {
              console.log("express server stopped");
              resolve();
            }
          });
        })
    )
    .catch(err => console.error("Stop server error:", err));
}
