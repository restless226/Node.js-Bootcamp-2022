const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const generateFilteredBody = (body, ...allowedFields) => {
  const filteredBody = {};
  Object.keys(body).forEach((e) => {
    if (allowedFields.includes(e)) {
      filteredBody[e] = body[e];
    }
  });
  return filteredBody;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('inside getAllUsers in userController.js');
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('inside updateMe in userController.js');

  // 1] Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not defined for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2] Filter out unwanted field names that are not allowed to be updated
  const filteredBody = generateFilteredBody(req.body, 'name', 'email');

  // 3] Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // 4] send back success response
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.getUser = factory.getOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  console.log('inside createUser in userController.js');
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead.',
  });
};
  
// Do not update passwords with this route
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
