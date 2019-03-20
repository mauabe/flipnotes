const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');


const { User } = require('../user/userModel.js');
const { JWT_SECRET } = require('../config');

//  SET LOCAL STRATEGY
const localStrategy = new LocalStrategy((username, password, passportVerify) => {
  let user;
  User.findOne({ username: username }).then(_user => {
      user = _user;
      if(!user){
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return user.validatePassword(password);
    }).then(isValid => {
      if(!isValid){
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        })
      }
      return passportVerify(null, user);
    }).catch( err => {
      if(err.reason === 'LoginError'){
        return passportVerify(null, false, err.message);
      }
      return passportVerify(err, false);
    });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algoritms: ['HS256']
  },
  (token, done) => {
    done(null, token.user);
  }
);

const localPassportMiddleware = passport.authenticate('local', {session: false});
const jwtPassportMiddleware = passport.authenticate('jwt', {sesion: false});

module.exports = {
  localStrategy, 
  jwtStrategy,
  localPassportMiddleware,
  jwtPassportMiddleware
};