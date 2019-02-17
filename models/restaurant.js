'use strict';

const db = require('../db');
const Schema = require('mongoose').Schema;

const RestaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant Name is required']
    },
    address: {
      type: String,
      required: [true, 'Restaurant Address is required']
    },
    pricing: {
      type: String,
      required: [true, 'Restaurant Pricing is required']
    },
    manager: {
      type: Schema.Types.ObjectId,
      required: [true, 'Restaurant manager is required'],
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = db.model('Restaurant', RestaurantSchema);
