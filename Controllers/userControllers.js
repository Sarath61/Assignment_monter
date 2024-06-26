const catchAsync = require("../utils/catchAsync");

exports.getUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    satuts: "success",
    data: {
      user: req.user,
    },
  });
});
