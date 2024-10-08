import User from "../Models/userModel";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

const updateRole = (req, res, next) => {
  req.body.role = "admin";
  next();
};

const getAllUsers = catchAsync(async (req, res, next) => {
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

const getUser = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username, role: { $ne: "admin" } });
  res.status(200).json({
    status: "success",
    data: user,
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  await User.deleteOne({ username });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export default {
  getAllUsers,
  getUser,
  deleteUser,
  updateRole,
};
