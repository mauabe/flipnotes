const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// SCHEMA //
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
});

//Define Mongoose methods
userSchema.methods.serialize = function(){
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    username: this.username
  };
};

// HASHING THE PASSWORD
userSchema.statics.hashPassword = function(password){
  return bcrypt.hash(password, 10);
};

//  VALIDATE HASHED PASSWORD
userSchema.methods.validatePassword = function(password){
  return bcrypt.compare(password, this.password);
};

// VALIDATE INFORMATION COLLECTED
const UserJoiSchema= Joi.object().keys({
  name: Joi.string().min(1).trim().required(),
  username: Joi.string().alphanum().min(4).trim().required(),
  password:Joi.string().min(4).max(15).trim().required(),
  email: Joi.string().email().trim().required(),
});

//MONGOOSE SCHEMAS AND MODELS
const User = mongoose.model('user', userSchema);

module.exports = { User, UserJoiSchema }
