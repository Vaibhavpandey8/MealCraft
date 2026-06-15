const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['vegetarian', 'vegan', 'paleo', 'jain', 'fasting'], required: true },
  calories: { type: Number, required: true },
  nutriscore: { type: Number, required: true },
  rating: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '/img/meals/meal-1.jpg' },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);