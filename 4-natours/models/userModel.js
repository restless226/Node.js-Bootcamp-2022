const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!'],
    // trim: true,
    // maxLength: [40, 'username must have less than or equal to 40 characters'],
    // unique: true,
    // minLength: [
    //   10,
    //   'username must have greater than or equal to 10 characters',
    // ],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
    // trim: false,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minLength: 8,
    select: false,
    // trim: false,
  },
  passwordConfirm: {
    // trim: false,
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
  passwordChangedAt: Date,
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

// instance method - method which is available on all documents of a certain collection
userSchema.methods.verifyPassword = async function (
  candidatePassword,
  userPassword
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result ? true : false;
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

const User = mongoose.model('User', userSchema);

module.exports = User;
