const express = require("express");
const Joi = require("joi");
const { HTTP_STATUS_CODES } = require("../config");
const { User, UserJoiSchema } = require("./userModel.js");

const userRouter = express.Router();

// CREATE NEW USER

userRouter.post("/", (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  };
  const validation = Joi.validate(newUser, UserJoiSchema);
  if (validation.error) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error });
  }
  User.findOne({
    //Mongoose $or operator
    $or: [{ email: newuser.email }, { username: newUser.username }]
  })
    .then(user => {
      if (user) {
        return res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({
            error: "Database error: A user with that name already exists"
          });
      }
      return User.hashPassword(newUser.password);
    })
    .then(passwordHash => {
      newUser.password = passwordHash;
      User.create(newUser)
        .then(createdUser => {
          return res
            .status(HTTP_STATUS_CODES.CREATED)
            .json(createdUser.serialize());
        })
        .catch(error => {
          console.error(error);
          return res
            .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
        });
    });
});

module.exports = { userRouter };
