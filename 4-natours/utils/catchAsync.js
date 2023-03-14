// To catch asynchronous errors
module.exports = (fn) => (req, res, next) => {
  // console.log("inside catchAsync.js");
  fn(req, res, next).catch((err) => next(err));
};
