const express = requre('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const { PORT, HTTP_STATUS_CODES, MONGO_URL, TEST_MONGO_URL } = require('./config');

let server;
const app = express();

//middleware

app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('./public'));

app.use('*', function(req, res){
  res.status(HTTP_STATUS_CODES, NOT_FOUND).json({ error: 'Not found' });
});