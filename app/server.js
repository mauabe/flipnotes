const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
// const passport = require('passport');

const { PORT, HTTP_STATUS_CODES, MONGO_URL, TEST_MONGO_URL } = require('./config');

let server;
const app = express();

//middleware

app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('./public'));

app.use('*', function(req, res){
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: 'Not found' });
});

module.exports = {
  app,
  startServer,
  stopServer
};

function startServer(testEnv){
  return new Promise((resolve, reject) => {
    let mongoUrl;
    if(testEnv){
      mongoUrl = TEST_MONGO_URL;
    } else {
      mongoUrl = MONGO_URL;
    }
    mongoose.connect(mongoUrl, { useNewUrlParser: true }, err => {
      if(err){
        console.error(err);
        return reject(err);
      } else {
        server = app.listen (PORT, () => {
          console.log(`Express server listening on http://localhost:${PORT}`);
          resolve();
        }).on('error', err => {
          mongoose.disconnect();
          console.error(err);
          reject(err);
        });
      }
    }); 
  });
};

function stopServer(){
  return mongoose
    .disconnect()
    .then(() => new Promise((resolve, reject) => {
      server.close(err => {
        if(err){
          console.error(err);
          return reject(err);
        } else {
          console.log('express server stopped');
          resolve();
        }
      });
    }))
    .catch(err => console.error('err', err));
};