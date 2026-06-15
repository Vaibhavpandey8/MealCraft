require('dotenv').config(); // ← Sabse pehle

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const connectDB = require('./db');
const authRoutes = require('./auth.routes');
const { errorHandler } = require('./error.middleware');
const passport = require('./passport');
const orderRoutes = require('./order.routes');
const mealRoutes = require('./meal.routes');
const paymentRoutes = require('./payment.routes');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler - hamesha last mein
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;