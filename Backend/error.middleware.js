const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'An account with this email already exists',
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { errorHandler };