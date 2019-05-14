const express = require('express');
const Joi = require('@hapi/joi');
const noteRouter = express.Router();
const { HTTP_STATUS_CODES } = require('../config');
const { jwtPassportMiddleware } = require('../auth/auth.strategy');
const { Note, NoteJoiSchema } = require('./note.model');

// CREATE NEW NOTE
noteRouter.post('/', jwtPassportMiddleware, (req, res) => {
  const newNote = {
    user: req.user.id,
    title: req.body.title,
    content: req.body.content,
    createDate: Date.now()
  };

  const validation = Joi.validate(newNote, NoteJoiSchema)
  if (validation.error) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error })
  };

  // CREATE NEW NOTE
  Note.create(newNote)
    .then(createdNote => {
      return res.status(HTTP_STATUS_CODES.CREATED).json(createdNote.serialize())
    })
    .catch(error => {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error)
    });
});

// RETRIEVE USER'S NOTES
noteRouter.get('/', jwtPassportMiddleware, (req, res) => {
  Note.find({ user: req.user.id })
    .populate('user')
    .then(notes => {
      return res
        .status(HTTP_STATUS_CODES.OK)
        .json(notes.map(note => note.serialize()))
    })
    .catch(error => {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error)
    })
})

// RETRIEVE NOTE BY ID
noteRouter.get('/:noteid', jwtPassportMiddleware, (req, res) => {
  Note.findById(req.params.noteid)
    .populate('user')
    .then(note => {
      return res.status(HTTP_STATUS_CODES.OK).json(note.serialize())
    })
    .catch(error => {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error)
    })
})

// DELETE NOTE BY ID
noteRouter.delete('/:noteid', jwtPassportMiddleware, (req, res) => {
  Note.findByIdAndDelete(req.params.noteid)
    .then(() => {
      return res.status(HTTP_STATUS_CODES.NO_CONTENT).end()
    })
    .catch(error => {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error)
    })
})

// UPDATE NOTE BY ID
noteRouter.put('/:noteid', jwtPassportMiddleware, (req, res) => {
  const noteUpdate = {
    title: req.body.title,
    content: req.body.content
  }
  const validation = Joi.validate(noteUpdate, NoteJoiSchema)
  if (validation.error) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error })
  }
  Note.findByIdAndUpdate(req.params.noteid, noteUpdate)
    .then(() => {
      return res.status(HTTP_STATUS_CODES.NO_CONTENT).end()
    })
    .catch(error => {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error)
    })
})

module.exports = { noteRouter }
