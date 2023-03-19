const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

/// router acts as middleware for api/v1/tours api requests
const router = express.Router();

// POST /tour/32432etefd/reviews
// GET /tour/32432etefd/tour

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.authorize('admin', 'lead-tour-guide', 'tour-guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.authorize('admin', 'lead-tour-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.authorize('admin', 'lead-tour-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.authorize('admin', 'lead-tour-guide'),
    tourController.deleteTour
  );

module.exports = router;
