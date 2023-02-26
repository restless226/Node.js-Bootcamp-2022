const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less than or equal to 40 characters',
      ],
      minLength: [
        10,
        'A tour name must have greater than or equal to 10 characters',
      ],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (discount) {
          // this only points to current doc on NEW document creation
          return discount < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Property -- They are not saved in db
// as they can be easily derived from existing attributes which are saved into db
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// 1. DOCUMENT MIDDLEWARE:
// I. pre: runs before .save() and .create() after these commands are issued
// II. post: runs after .save() and .create() after these commands are issued
// Here we are using it for 'save' hook/middleware

tourSchema.pre('save', function (next) {
  // .this refers to current document
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', (next) => {
  // .this refers to current document
  // console.log('This document is going to be saved...');
  next();
});

tourSchema.post('save', (doc, next) => {
  // .this refers to current document
  // console.log('This is post hook for save middleware');
  next();
});

// 2. QUERY MIDDLEWARE:
// I. pre: runs before .find() after the command is issued
// II. post: runs after .find() after the command is issued

// ^find: this RE means all the strings which start with find
// tourSchema.pre('find', (next) => {
tourSchema.pre(/^find/, function (next) {
  // select all document where secretTour = false
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`tourSchema.post query took: ${Date.now() - this.start} ms`);
  // console.log("tourSchema.post docs = ", docs);
  next();
});

// 3. AGGREGATION MIDDLEWARE:
// I. pre: runs before .aggregate() after the command is issued
// II. post: runs after .aggregate() after the command is issued
tourSchema.pre('aggregate', function (next) {
  // console.log("tourSchema aggregate middleware pipeline = ", this.pipeline());
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
