// To catch asynchronous errors
module.exports = (fn) => {
  // console.log("inside catchAsync.js");
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
