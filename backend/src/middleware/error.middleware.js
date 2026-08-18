export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    statusCode = 400;
    message = `Duplicate value entered for '${field}'. Please use another value.`;
    errorCode = 'DUPLICATE_ENTRY';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    errorCode = 'VALIDATION_ERROR';
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource with ID '${err.value}' was not found.`;
    errorCode = 'RESOURCE_NOT_FOUND';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
