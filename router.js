'use strict';
const express = require('express');
const passport = require('passport');
const passportConfig = require('./config/passport');
const UserController = require('./controllers/user');
const RestaurantController = require('./controllers/restaurant');

const requireLocalLogin = passport.authenticate('local', { session: false, failWithError: true });
const requireJwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

const authError = (err, req, res, next) => {
  return res.status(401).json({ success: false, message: 'unauthorized' });
};

module.exports = app => {
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const userRoutes = express.Router();
  const restaurantRoutes = express.Router();

  /*
    Auth Routes
   */
  apiRoutes.use('/auth', authRoutes);

  authRoutes.post('/register', UserController.register);

  authRoutes.post('/login', requireLocalLogin, UserController.login, authError);

  /*
    User Routes
   */
  apiRoutes.use('/users', userRoutes);

  userRoutes.get('/', requireJwtAuth, UserController.fetchAll, authError);

  userRoutes.get('/:id', requireJwtAuth, UserController.findOne, authError);

  /*
    Restaurant Routes
   */
  apiRoutes.use('/restaurants', restaurantRoutes);

  restaurantRoutes.post('/', requireJwtAuth, RestaurantController.create, authError);

  restaurantRoutes.put('/:id', requireJwtAuth, RestaurantController.update, authError);

  app.use('/api', apiRoutes);
};
