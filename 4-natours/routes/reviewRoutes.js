const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tour/32432etefd/reviews
// POST /reviews

// Protect all routes written below this middleware
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.authorize('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.authorize('user', 'admin'),reviewController.updateReview)
  .delete(authController.authorize('user', 'admin'),reviewController.deleteReview);

module.exports = router;
