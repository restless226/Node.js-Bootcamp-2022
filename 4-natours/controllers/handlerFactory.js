const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log('inside deleteOne in handlerFactory.js');
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log('inside updateOne in handlerFactory.js');
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log('inside createOne in handlerFactory.js');
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    console.log('inside getOne in handlerFactory.js');
    let query = await Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log('inside getAll in handlerFactory.js');
    /// To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    /// 1. EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    console.log({ docs });
    /// 2. SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
