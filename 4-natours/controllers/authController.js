const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;

  const { email, password } = req.body;
  /// 1] Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  /// 2] Check if user exist and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  const isPasswordVerified = await User.verifyPassword(password, user.password);
  if (!user || !isPasswordVerified) {
    return next(new AppError('Invalid email or password!', 401));
  }
  console.log('exports.login user = ', user);

  /// 3] If everything is ok, send json web token to the client
  const token = '';
  res.status(200).json({
    status: 'success',
    token,
  });
});
