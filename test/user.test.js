const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const { HTTP_STATUS_CODES } = require('../app/config');
const { startServer, stopServer, app } = require('../app/server');
const { User } = require('../app/user/user.model');

const expect = chai.expect
chai.use(chaiHttp)

describe('Integration test for : /api/user', function() {
  let testUser

  before(function() {
    return startServer(true)
  })

  beforeEach(function() {
    testUser = createFakerUser()

    return User.create(testUser)
      .then(() => {})
      .catch(err => {
        console.error(err)
      })
  })

  after(function() {
    return stopServer()
  })

  afterEach(function() {
    return new Promise((resolve, reject) => {
      mongoose.connection
        .dropDatabase()
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error('after each error: ', err)
          reject(err)
        })
    })
  })

  it('Should return all users', function() {
    return chai
      .request(app)
      .get('/api/user')
      .then(res => {
        expect(res).to.have.status(HTTP_STATUS_CODES.OK)
        expect(res).to.be.json
        expect(res.body).to.be.a('array')
        expect(res.body).to.have.lengthOf.at.least(1)
        expect(res.body[0]).to.include.keys('id', 'name', 'username', 'email')
        expect(res.body[0]).to.not.include.keys('password')
      })
  })

  it('Should return a specific user', function() {
    let foundUser
    return chai
      .request(app)
      .get('/api/user')
      .then(res => {
        expect(res).to.have.status(HTTP_STATUS_CODES.OK)
        expect(res).to.be.json
        expect(res.body).to.be.a('array')
        expect(res.body).to.have.lengthOf.at.least(1)
        foundUser = res.body[0]
        return chai.request(app).get(`/api/user/${foundUser.id}`)
      })
      .then(res => {
        expect(res).to.have.status(HTTP_STATUS_CODES.OK)
        expect(res).to.be.json
        expect(res.body).to.be.a('object')
        expect(res.body.id).to.equal(foundUser.id)
      })
  })

  it('Should create a new user', function() {
    let newUser = createFakerUser()
    return chai
      .request(app)
      .post('/api/user')
      .send(newUser)
      .then(res => {
        // console.log('LOGGIN: newUser: ', newUser)
        expect(res).to.have.status(HTTP_STATUS_CODES.CREATED);
        expect(res).to.be.json
        expect(res.body).to.be.a('object')
        expect(res.body).to.include.keys('id', 'name', 'username', 'email')
        expect(res.body.name).to.equal(newUser.name)
        expect(res.body.username).to.equal(newUser.username)
        expect(res.body.email).to.equal(newUser.email)
      })
  })

  function createFakerUser() {
    // console.log('user', user)
    return {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      username: `${faker.lorem.word()}${faker.random.number(100)}`,
      password: faker.internet.password(),
      email: faker.internet.email()
    }
  }
})
