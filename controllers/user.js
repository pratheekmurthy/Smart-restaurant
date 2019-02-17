'use strict';
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const moment = require('moment');
const randomstring = require('randomstring');
const errorParser = require('../error');

//TODO: Add resetPassword,forgotPassword links once mailer is setup

const signToken = (data, expiry) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, config.secret, { expiresIn: expiry }, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });
};

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secret, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

const isKeyExpired = keyExpiry => {
  return moment().diff(moment(keyExpiry)) > 0;
};

const validate = email => {
  const RE = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return RE.test(email);
};

const login = async (req, res, next) => {
  try {
    let user = req.user;

    let token;
    if (user.key && !isKeyExpired(user.keyExpiry)) {
      token = await signToken({ _id: user.id, key: user.key }, '7d'); //expiry 7 days
    } else {
      const key = `${Date.now()}${randomstring.generate()}`;
      const keyExpiry = moment()
        .add(7, 'days')
        .seconds(0)
        .format();
      token = await signToken({ _id: user._id, key }, '7d');
      user = User.findOneAndUpdate({ _id: user._id }, { key, keyExpiry }, { new: true });
    }
    res.status(200).json({ success: true, token: 'JWT ' + token, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

const create = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const mobile = req.body.mobile;

    // if (!!!email) {
    //   return res.status(403).json({ success: false, error: 'Enter email' });
    // }

    // if (!validate(email)) {
    //   return res.status(403).json({ success: false, error: 'Enter correct email' });
    // }

    // if (!!!password) {
    //   return res.status(403).json({ success: false, error: 'Enter password' });
    // }

    // if (!!!name) {
    //   return res.status(403).json({ success: false, error: 'Enter name' });
    // }

    // if (!!!mobile) {
    //   return res.status(403).json({ success: false, error: 'Enter mobile' });
    // }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(403).json({ success: false, error: 'User with email already exists' });
    }

    const UserObj = new User({
      email,
      password,
      name,
      mobile
    });

    let user = await UserObj.save();

    const key = `${Date.now()}${randomstring.generate()}`;
    const keyExpiry = moment()
      .add(7, 'days')
      .seconds(0)
      .format();
    const token = await signToken({ _id: user._id, key }, '7d');
    user = await User.findOneAndUpdate({ _id: user._id }, { key, keyExpiry }, { new: true }).select(
      '-key -keyExpiry -createdAt -updatedAt -resetPasswordToken -resetPasswordTokenExpiry'
    );
    return res.status(200).json({ success: true, token: 'JWT ' + token, user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(403).json({ success: false, error: errorParser(error) });
    }
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-key -keyExpiry -createdAt -updatedAt');
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

const findOne = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findById({ _id: id }).select('-key -keyExpiry -createdAt -updatedAt');

    if (!user) return res.status(200).json({ success: false, message: 'No user found' });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

module.exports = {
  login,
  register: create,
  fetchAll,
  findOne
};
