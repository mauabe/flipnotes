const express = require("express");
const Joi = require('joi'); 
const { HTTP_STATUS_CODES } = require('../config');
const { User, UserJoiSchema } = require('./userModel.js');
const userRouter = express.Router();

// CREATE NEW USER
userRouter.post("/", (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  };

  // console.log('user post', newUser)
  const validation = Joi.validate(newUser, UserJoiSchema);
  if (validation.error) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error });
  }
  User.findOne({
    //Mongoose $or operator
    $or: [{ email: newUser.email }, { username: newUser.username }]
    })
    .then(user => {
      if (user) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          error: "Database error: A user with that name or email already exists"
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
          return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
        });
    });
});

//RETRIEVE USERS
userRouter.get('/', (req, res) =>{
  User.find()
    .then(users =>{
      return res.status(HTTP_STATUS_CODES.OK)
        .json(users.map(user => user.serilalize())
      );
    })
    .catch(error => {
      console.error(error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(error);
    });
});

//RETRIEVE ONE USER
userRouter.get('/:userid', (req, res) => {
  User.findById(req.params.userid)
    .then(user => {
      return res.status(HTTP_STATUS_CODES.OK).json(user.serialize());
    })
    .catch(error => {
      console.error(error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(error);
    });
});

module.exports = { userRouter };
