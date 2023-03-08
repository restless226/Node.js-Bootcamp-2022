const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This works only on CREATE and SAVE!!!
      validator: function (e) {
        return e === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  role: {
    type: String,
    enum: ['user', 'tour-guide', 'lead-tour-guide', 'admin'],
    default: 'user',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/// query middleware to show only active users in GetAllUsers query 
/// here "this" points to current query
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method - method which is available on all documents of a certain collection
userSchema.methods.verifyPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// checks if user has changed the password after the token was issued.
// false means - user did not change his password after the token was issued
userSchema.methods.changePasswordAfterTokenAssignment = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    // as JWTTimestamp is in milliseconds we need to convert passwordChangedAt in milliseconds for comparision
    const modifiedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(
      'modifiedTimestamp = ',
      modifiedTimestamp,
      'JWTTimestamp = ',
      JWTTimestamp
    );
    return JWTTimestamp < modifiedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(
    { resetToken },
    'this.passwordResetToken = ',
    this.passwordResetToken
  );

  // adding 10 min as a timer for expiry
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
