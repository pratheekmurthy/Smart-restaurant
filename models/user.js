'use strict';

const db = require('../db');
const Schema = require('mongoose').Schema;
const bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
            v
          );
        },
        message: props => `${props.value} is not a valid email`
      },
      required: [true, 'User email is required']
    },
    password: {
      type: String,
      required: [true, 'User password is required']
    },
    name: {
      type: String,
      required: [true, 'User name is required']
    },
    mobile: {
      type: String,
      required: [true, 'User mobile is required']
    },
    key: {
      type: String,
      sparse: true
    },
    keyExpiry: {
      type: String
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordTokenExpiry: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', function (next) {
  const user = this;
  const SALT_FACTOR = 5;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePass, cb) {
  bcrypt.compare(candidatePass, this.password, (err, res) => {
    if (err) return cb(err);
    cb(null, res);
  });
};

module.exports = db.model('User', UserSchema);
