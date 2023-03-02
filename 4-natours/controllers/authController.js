const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const util = require('util');

/// generates a unique jwt token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log('inside signup in authController.js');
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt ?? Date.now(),
    role: req.body.role,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('inside login in authController.js');
  // const email = req.body.email;
  // const password = req.body.password;

  const { email, password } = req.body;
  /// 1] Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  /// 2] Check if user exist and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Invalid email or password!', 401));
  }
  console.log('exports.login user = ', user);

  /// 3] If everything is ok, send json web token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log('inside protect in authController.js');
  let token;

  /// 1] Acquire token and check whether it exists or not.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log('token = ', token);
  if (!token) {
    return next(
      new AppError(
        'Hey, You are not logged in! Please log in to get access.',
        401
      )
    );
  }

  /// 2] Verify the token.
  const decodedObject = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // console.log('decodedObject = ', decodedObject);

  /// 3] Check if current user exists or not.
  const currentUser = await User.findById(decodedObject.id);
  // console.log('currentUser = ', currentUser);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  /// 4] Check if user changes password after the token was issued.
  const isPasswordChanged = currentUser.changePasswordAfterTokenAssignment(
    decodedObject.iat
  );
  if (isPasswordChanged) {
    return next(
      new AppError(
        'Your password has been changed recently! Please log in again!',
        401
      )
    );
  }

  /// 5] Grant access to protected route
  req.user = currentUser;
  next();
});

exports.authorize = (...roles) => {
  console.log('inside authorize in authController.js');
  return catchAsync((req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action!', 403)
      );
    }
    next();
  });
};
