const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../Models/userModel");

const filterObj = (obj, ...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el]=obj[el]
  })
  return newObj
}

exports.getUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    satuts: "success",
    data: {
      user: req.user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password , username , email
  if (req.body.password || req.body.username || req.body.email) {
    return next(
      new AppError("This not for Password or Username/email update.", 400)
    );
  }
  // 2) ownly wanted fields are taken and unwanted are filtered
  const filerdBody = filterObj(req.body,'age','location','description','DOB','work')
  // 3) update user documnet
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filerdBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
