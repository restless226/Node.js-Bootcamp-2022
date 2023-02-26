const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!'],
    unique: true,
    trim: true,
    maxLength: [40, 'username must have less than or equal to 40 characters'],
    // minLength: [
    //   10,
    //   'username must have greater than or equal to 10 characters',
    // ],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    trim: false,
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
    trim: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
