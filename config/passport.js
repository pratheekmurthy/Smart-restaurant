'use strict';
const passport = require('passport');
const User = require('../models/user');
const config = require('./main');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const Local = new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    User.findOne({ email: email }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      user.comparePassword(password, (err, res) => {
        if (err) {
          return done(err);
        }

        if (!res) {
          return done(null, false);
        }

        done(null, user);
      });
    });
  } catch (error) {
    done(error);
  }
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'), // extracting from auth header
  secretOrKey: config.secret // secret
};

const jwtLogin = new JWTStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload._id);
    if (user.key === payload.key) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

passport.use(jwtLogin);
passport.use(Local);
