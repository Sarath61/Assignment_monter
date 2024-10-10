import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User, { IUser } from "../Models/userModel";
import { Request, Response, NextFunction } from "express";

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      satuts: "success",
      data: {
        user: req.headers["user"],
      },
    });
  }
);

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) create error if user POSTs password , username , email
    if (req.body.password || req.body.username || req.body.email) {
      return next(
        new AppError("This not for Password or Username/email update.", 400)
      );
    }
    // 2) ownly wanted fields are taken and unwanted are filtered
    const filterdBody = filterObj(
      req.body,
      "age",
      "location",
      "description",
      "DOB",
      "work"
    );
    if (!req.user) {
      return res.status(401).json({
        state: "failed",
        message: "user don't exists",
      });
    }
    // 3) update user documnet
    if (!req.user.isVerified) {
      return next(new AppError("User not verified", 400));
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  }
);

export default {
  updateMe,
  getUser,
};
