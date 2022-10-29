/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

/*
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};
*/

/*
/// Create a checkBody middleware function
/// Check if the body contains "name" and "price" property
/// If not, send back 400 (bad request), Also add it to post handler stack
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};
*/

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
  /// 2. EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();
  const tours = await features.query;
  // const tours = await query;

  /// 3. SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // It is equivalent to - Tour.findOne({_id: req.params.id})
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  /*
  console.log(req.params);
  const id = req.params.id * 1; // converting "req.params.id" string into a number
  const tour = tours.find((e) => e.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  */
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  /*
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newId = tours[tours.length - 1].id + 1;
    const newTour = { id: newId, ...req.body };
    tours.push(newTour);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      () => {
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      }
    );
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Data Sent!!!',
      // message: err,
    });
  }
  */
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
  /*
  res.status(204).json({
    status: 204,
    data: null,
  });
  */
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {ratingsAverage: {$gte: 4.5}}
    },
    {
      $group: {
        _id: '$difficulty',
        numRatings: {$sum: '$ratingsQuantity'},
        numTours: {$sum: 1},
        avgRating: {$avg: '$ratingsAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'},
      }
    },
    {
      $sort: {avgPrice: 1}
    },
    // {
    //   $match: {_id: {$ne: 'easy'}}
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      },
    },
    {
      $group: {
        _id: {$month: '$startDates'},
        numTours: {$sum: 1},
        tours: {
          $push: '$name',
        }, 
      }
    },
    {
      $addFields: {
        month: '$id',
      },
    },
    {
      $project: {
        _id: 0,
      }
    },
    {
      $sort: {
        numTourStarts: -1,
      }
    },
    // {
    //   $limit: 12
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});