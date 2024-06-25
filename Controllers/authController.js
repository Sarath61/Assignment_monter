const catchAsync = require("../utils/catchAsync");

exports.signup = catchAsync( async(req,res,next)=>{
    const newUser = await User.create({})
})