const User = require('./user.model');
const generateToken = require('./generateToken');
const { sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail } = require('./email');
const crypto = require('crypto');

// @desc    Register
// @route   POST /api/users/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 600000; // 10 minutes

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'Email already in use' });
      } else {
        // User registered but not verified, overwrite details and send new OTP
        userExists.fullName = fullName;
        userExists.password = password;
        userExists.otp = otp;
        userExists.otpExpires = otpExpires;
        await userExists.save();

        let emailInfo;
        try {
          emailInfo = await sendOTPEmail(email, fullName, otp);
        } catch (emailError) {
          console.log('OTP Email sending failed:', emailError.message);
        }

        if (emailInfo && emailInfo.previewUrl) {
          return res.status(201).json({
            message: 'OTP verification code sent! Virtual test mail delivered.',
            email,
            devLink: emailInfo.previewUrl,
            devOtp: otp
          });
        }

        return res.status(201).json({
          message: 'OTP verification code sent to your email! Please verify.',
          email
        });
      }
    }

    // New user registration
    const user = await User.create({
      fullName,
      email,
      password,
      otp,
      otpExpires,
      isVerified: false,
    });

    let emailInfo;
    try {
      emailInfo = await sendOTPEmail(email, fullName, otp);
    } catch (emailError) {
      console.log('OTP Email sending failed:', emailError.message);
    }

    if (emailInfo && emailInfo.previewUrl) {
      return res.status(201).json({
        message: 'OTP verification code sent! Virtual test mail delivered.',
        email,
        devLink: emailInfo.previewUrl,
        devOtp: otp
      });
    }

    res.status(201).json({
      message: 'Registration successful! OTP sent to your email to verify your account.',
      email
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect('http://localhost:5173?verified=true');

  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/users/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first!' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      photo: user.photo,
      token,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName },
      { new: true }
    );
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      photo: user.photo,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Me
// @route   GET /api/users/me
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    photo: req.user.photo,
  });
};

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Create reset URL
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    try {
      const info = await sendPasswordResetEmail(email, user.fullName, resetURL);

      if (info && info.previewUrl) {
        return res.json({
          message: 'Password reset link sent! Virtual test mail delivered successfully.',
          devLink: resetURL,
          previewUrl: info.previewUrl
        });
      }

      res.json({ message: 'Password reset link sent to your email!' });
    } catch (emailError) {
      console.log('Nodemailer failed to send password reset email:', emailError.message);
      console.log('=== DEVELOPMENT FALLBACK PASSWORD RESET LINK ===');
      console.log(resetURL);
      console.log('================================================');

      // Development fallback: succeed and return the link
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        return res.json({
          message: 'Email service is unavailable, but a recovery link has been generated for development.',
          devLink: resetURL
        });
      }

      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ message: 'Error sending email. Please try again later.' });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP code' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Verification successful!',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        photo: user.photo,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, verifyEmail, updateProfile, forgotPassword, resetPassword, verifyOTP };
