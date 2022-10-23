const express = require('express');

const router = express.Router(); /// router acts as middleware for api/v1/tours api requests
const tourController = require('../controllers/tourController');

// router.param('id', tourController.checkID); /// middleware

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
