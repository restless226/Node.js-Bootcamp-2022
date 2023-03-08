const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

/// 1] MIDDLEWARES
console.log('process.env.NODE_ENV =', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('app.use middleware req.headers = ', req.headers);
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
