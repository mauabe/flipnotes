const mongoose = require('mongoose');
const Joi = require('joi');

// MONGOOSE SCHEMA //
const unoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createDate: { type: Date },
  updateDate: { type: Date, default: Date.now }
});

//Define Mongoose methods
noteSchema.methods.serialize = function(){
  let user;
  if(typeof this.user.serialize === 'function'){
    user = this.user.serialize();
  } else {
    user = this.user;
  }
  return {
    id: this._id,
    user: user,
    title:  this.content,
    createDate: this.createDate,
    updateDate: this.updateDate
  };
};

//  VALIDATE DATA COLLECTED with JOI   
const NoteJoiSchema= Joi.object().keys({
  user: Joi.string().optional(),
  title: Joi.string().min(1).required(),
  content:Joi.string().min(1).required(),
  createDate: Joi.date().timestamp(),
});

//MONGOOSE SCHEMAS AND MODELS
const Note = mongoose.model('note', noteSchema);

module.exports = { Note, NoteJoiSchema }