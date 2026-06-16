const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, updateProfile, forgotPassword, resetPassword, verifyOTP } = require('./auth.controller');
const { protect } = require('./auth.middleware');
const passport = require('./passport');
const generateToken = require('./generateToken');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-email', verifyEmail);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOTP);

router.get('/google', (req, res, next) => {
  const clientUrl = req.query.client_url || process.env.CLIENT_URL || 'http://localhost:5173';
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: Buffer.from(clientUrl).toString('base64')
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL || 'http://localhost:5173' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const photo = req.user.photo || '';
    
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (req.query.state) {
      try {
        const decoded = Buffer.from(req.query.state, 'base64').toString('ascii');
        // Simple safety check to prevent open redirects to malicious sites
        if (decoded.startsWith('http://localhost') || decoded.startsWith('https://mealcraft-ai.vercel.app')) {
          clientUrl = decoded;
        }
      } catch (err) {
        console.error('Error decoding state:', err);
      }
    }
    
    res.redirect(`${clientUrl}?token=${token}&name=${encodeURIComponent(req.user.fullName)}&photo=${encodeURIComponent(photo)}`);
  }
);

module.exports = router;