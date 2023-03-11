const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

/// 1] GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
console.log('process.env.NODE_ENV =', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const corsOption = {
  credentials: true,
  origin: ['http://localhost:3000'],
};
app.use(cors(corsOption));

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

// Body parser - reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log('app.use middleware req.headers = ', req.headers);
  next();
});

/// 2] ROUTES

/// mouting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/// 3] handling unhandled requests
app.all('*', (req, res, next) => {
  // console.log('app.all req = ', req);
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

// global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
