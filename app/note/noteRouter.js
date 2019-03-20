const express = require('express');
const Joi = require('Joi');
const noteRouter = express.Router();
const { HTTP_STATUS_CODE } = require('../config');
const { jwtPassportMiddleware } = require('../auth/autStrategy');
const { Note, NoteJoiSchema } = require('./noteModel.js');

// CREATE NEW NOTE
noteRouter.post("/", jwtPassportMiddleware, (req, res) => {
  const newNote = {
    user: req.user.id,
    title: req.body.title,
    content: req.body.content,
    createDate: Date.now()
  };

  const validation = Joi.validate(newNote, NoteJoiSchema);
  if (validation.error) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error });
  }

  // CREATE NEW NOTE
  Note.create(newNote)
    .then(createdNote => {
      return res.status(HTTP_STATUS_CODES.CREATED).json(createdNote.serialize());
    })
    .catch(error => {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(error);
    })
});
  
// RETRIEVE USER'S NOTES

noteRouter.get('/', jwtPassportMiddleware, (req, res) => {
  Note.find({ user: req.user.id })
    .populate('user')
    .then(notes => {
      return res.status(HTTP_STATUS_CODE.OK).json(notes.map(note => note.serialize()));
    })
    .catch(error => {return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(error);
    });
});



module.exports = { noteRouter };
