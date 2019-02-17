'use strict';
const Restaurant = require('../models/restaurant');
const errorParser = require('../error');

const create = async (req, res, next) => {
  try {
    const name = req.body.name;
    const address = req.body.address;
    const pricing = req.body.address;
    const manager = req.body.manager;

    const existingRestaurant = await Restaurant.findOne({ name: name, address: address });
    if (existingRestaurant) {
      return res.status(403).json({ success: false, error: 'Restaurant with name and address exists' });
    }

    const restaurantObj = new Restaurant({
      name,
      address,
      pricing,
      manager
    });

    const restaurant = await restaurantObj.save();

    return res.status(200).json({ success: true, restaurant });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(403).json({ success: false, error: errorParser(error) });
    }
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;

    const updatedRestaurant = await Restaurant.findOneAndUpdate({ _id: id }, update, { new: true }).select(
      '-createdAt -updatedAt'
    );

    return res.status(200).json({ success: true, restaurant: updatedRestaurant });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(403).json({ success: false, error: errorParser(error) });
    }
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

module.exports = { create, update };
