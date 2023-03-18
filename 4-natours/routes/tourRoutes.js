const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

/// router acts as middleware for api/v1/tours api requests
const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.authorize('admin', 'lead-tour-guide'),
    tourController.deleteTour
  );

// POST /tour/32432etefd/reviews
// GET /tour/32432etefd/tour

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.authorize('user'),
    reviewController.createReview
  );

module.exports = router;
