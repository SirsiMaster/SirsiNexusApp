const winston = require('winston');

// Error types
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  winston.error({
    error: error.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Mongoose/Database validation errors
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = new ValidationError(message, errors);
  }

  // Mongoose/Database duplicate field error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ConflictError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // PostgreSQL/CockroachDB errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        const field = err.detail?.match(/Key \((.+)\)=/)?.[1] || 'field';
        error = new ConflictError(`${field} already exists`);
        break;
      case '23503': // Foreign key violation
        error = new ValidationError('Referenced resource does not exist');
        break;
      case '23502': // Not null violation
        const column = err.column || 'field';
        error = new ValidationError(`${column} is required`);
        break;
      case '22001': // String data right truncation
        error = new ValidationError('Data too long for field');
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          error = new AppError(`Database error: ${err.message}`, 500);
        } else {
          error = new AppError('Internal server error', 500);
        }
    }
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new AppError('Internal server error', 500, false);
  }

  // Send error response
  const response = {
    status: error.status || 'error',
    message: error.message
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err;
    response.stack = err.stack;
  }

  // Add validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(error.statusCode || 500).json(response);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
