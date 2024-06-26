const User = require("../Models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.updateRole = (req, res, next) => {
  req.body.role = "admin";
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const usersData = await User.aggregate([
    {
      $match: {
        role: {
          $ne: "admin",
        },
      },
    },
    {
      $project: {
        _id: 0,
        username: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    usernames: usersData,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username, role: { $ne: "admin" } });
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  res.status(204).json({
    status: "success",
    data: null,
  });
});
