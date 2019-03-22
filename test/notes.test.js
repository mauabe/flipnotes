const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const { HTTP_STATUS_CODES, JWT_SECRET, JWT_EXPIRY } = require('../app/config');
const { startServer, stopServer, app } = require('../app/server');
const { User } = require('../app/user/user.model');
const { Note } = require('../app/note/note.model');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for: /api/note', function(){
  let testUser, jwtToken;

  before(function() {
    return startServer(true);
  });

  beforeEach(function () {
    testUser = createFakerUser();

    return User.hashPassword(testUser.password)
      .then(hashedPassword => {
        return User.create({
          name: testUser.name,
          email: testUser.email,
          username: testUser.username,
          password: hashedPassword
        }).catch(err => {
          console.error(err);
          throw new Error(err);
      });
      })
      .then(createdUser => {
        testUser.id = createdUser.id;

        jwtToken = jsonwebtoken.sign(
          {
            user: {
              id: testUser.id,
              name: testUser.name,
              email: testUser.email,
              username: testUser.username
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            expiresIn: JWT_EXPIRY,
            subject: testUser.username
          }
        );

        const seedData = [];
        for (let i = 1; i <= 10; i++) {
          const newNote = createFakerNote();
          newNote.user = createdUser.id;
          seedData.push(newNote);
        }
        return Note.insertMany(seedData)
          .catch(err => {
            console.error(err);
            throw new Error(err);
          });
    });
});

  after(function(){
    return stopServer();
  });
  
  afterEach(function(){
    return new Promise((resolve, reject) => {
      mongoose.connection.dropDatabase()
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        console.error('after each error: ',err);
        reject(err);
      });
    });
  });
  
  it('Should return user notes', function () {
    return chai.request(app)
    .get('/api/note')
    .set('Authorization', `Bearer ${jwtToken}`)
    .then(res => {
      expect(res).to.have.status(HTTP_STATUS_CODES.OK);
      expect(res).to.be.json;
      expect(res.body).to.be.a('array');
      expect(res.body).to.have.lengthOf.at.least(1);
      const note = res.body[0];
      console.log('NOTE', res.body[0])
      expect(note).to.include.keys('user', 'title', 'content');
      expect(note.user).to.be.a('object');
      expect(note.user).to.include.keys('name', 'email', 'username');
      expect(note.user).to.deep.include({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        name: testUser.name
      });
    });
  });


  it('Should return a specific note', function () {
    let foundNote;
    return Note.find()
      .then(notes => {
        expect(notes).to.be.a('array');
        expect(notes).to.have.lengthOf.at.least(1);
        foundNote = notes[0];

        return chai.request(app)
          .get(`/api/note/${foundNote.id}`)
          .set('Authorization', `Bearer ${jwtToken}`);
      })
      .then(res => {
        expect(res).to.have.status(HTTP_STATUS_CODES.OK);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('user', 'title', 'content');
        expect(res.body).to.deep.include({
          id: foundNote.id,
          title: foundNote.title,
          content: foundNote.content
        });
      });
  });


  it('Sould update a specific note', function(){
    let noteToUpdate;
    const newNoteData = createFakerNote();
    return Note.find()
      .then(notes => {
        expect(notes).to.be.a('array');
        expect(notes).to.have.lengthOf.at.least(1);
        noteToUpdate = notes[0];

        return chai.request(app)
        .put(`/api/note/${noteToUpdate.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newNoteData);
      })
      .then(res =>{
        expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);
        return Note.findById(noteToUpdate.id);
      })
      .then(note => {
        expect(note).to.be.a('object');
        expect(note).to.deep.include({
          id: noteToUpdate.id,
          title: newNoteData.title,
          content: newNoteData.content
        });
      });
  });


  it ('Should delete a specific note', function(){
    let noteToDelete;
    return Note.find()
      .then(notes =>{
        expect(notes).to.be.a('array');
        expect(notes).to.have.lengthOf.at.least(1);
        noteToDelete = notes[0];
        return chai.request(app)
          .delete(`/api/note/${noteToDelete.id}`)
          .set('Authorization', `Bearer ${jwtToken}`);
      })
      .then(res => {
        expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);
        return Note.findById(noteToDelete.id);
      })
      .then(note => {
        expect(note).to.not.exist;
      });
  })


  function createFakerUser() {
    return {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        username: `${faker.lorem.word()}${faker.random.number(100)}`,
        password: faker.internet.password(),
        email: faker.internet.email()
    };
  }

  function createFakerNote() {
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs()
    };
  }

});