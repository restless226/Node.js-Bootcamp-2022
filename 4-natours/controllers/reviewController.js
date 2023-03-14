const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  console.log('inside getAllReviews in reviewController.js');
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  console.log('inside createReview in reviewController.js');
  const newReview = await Review.create(req.body);
  res.redirect('/');
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});