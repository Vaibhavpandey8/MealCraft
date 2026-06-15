const express = require('express');
const router = express.Router();
const Meal = require('./meal.model');
const { protect } = require('./auth.middleware');

// @desc Get all meals
// @route GET /api/meals
// @access Public
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Get single meal
// @route GET /api/meals/:id
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Create meal
// @route POST /api/meals
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Update meal
// @route PUT /api/meals/:id
// @access Private
router.put('/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Delete meal
// @route DELETE /api/meals/:id
// @access Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;