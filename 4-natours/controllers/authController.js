const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const util = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/sendEmail');

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('inside forgotPassword in authController.js');
  /// 1] Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user exists with that email address!', 404));
  }
  /// 2] Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  /// 3] Send it back to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to email!',
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email! Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log('inside resetPassword in authController.js');

  /// 1] Get user based on the token
  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  /// 2] If token has not expired and there is a user set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  console.log({user}, {req});
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  /// 3] Update changedPasswordAt property for the current user

  /// 4] Log the user in and send JWT to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
