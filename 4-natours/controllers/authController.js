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

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  console.log('inside protect in authController.js');
  let token;
  /// 1] Acquire token and check whether it exists or not.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log({ token });
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
  // const isPasswordChanged = currentUser.changePasswordAfterTokenAssignment(
  //   decodedObject.iat
  // );
  // if (isPasswordChanged) {
  //   return next(
  //     new AppError(
  //       'Your password has been changed recently! Please log in again!',
  //       401
  //     )
  //   );
  // }
  /// 5] Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log('inside isLoggedIn in authController.js');
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await util.promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      // console.log({ currentUser });
      if (!currentUser) {
        return next();
      }
      // 3) Check if user changed password after the token was issued
      // if (currentUser.changedPasswordAfter(decoded.iat)) {
      //   return next();
      // }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      // console.log('res.locals.user = ', res.locals.user);
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

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
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  /// 2] If token has not expired and there is a user set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  console.log({ user }, { req });
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  /// 3] Update changedPasswordAt property for the current user

  /// 4] Log the user in and send JWT to the client
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('inside updatePassword in authController.js');

  // 1] Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2] check if posted current password is correct or not
  // User.findByIdAndUpdate() will not work as intended
  if (!(await user.verifyPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect!', 401));
  }

  // 3] If correct then update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  await user.save();

  // 4] Log user in, send JWT
  createSendToken(user, 200, res);
});
