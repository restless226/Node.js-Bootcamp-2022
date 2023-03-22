const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must be non-empty!'],
      maxLength: [
        1000,
        'A review must have less than or equal to 1000 characters',
      ],
      minLength: [
        10,
        'A review must have greater than or equal to 10 characters',
      ],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({tour: 1, user: 1}, {unique: true})

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  // Here this keyoword points to Review model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log({ stats });
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // Here this keyoword points to current review document
  this.constructor.calculateAverageRatings(this.tour);
});

// query middleware - works for findByIdAndUpdate and findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.currentReview = await this.findOne();
  console.log(`this.currentReview = ${this.currentReview}`);
  next();
});

// query middleware - works for findByIdAndUpdate and findByIdAndDelete
reviewSchema.post(/^findOneAnd/, async function () {
  // "await this.findOne()" does not work here because has been already executed
  await this.currentReview.constructor.calculateAverageRatings(
    this.currentReview.tour
  );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
