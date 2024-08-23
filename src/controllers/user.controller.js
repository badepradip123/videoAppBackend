import { User } from "../models/user.models.js";
import {  ApiError, uploadOnCloudinary, ApiResponse, asyncHandler } from "../utils/index.js";

const generateAccessAndRefreshToken = async(userId) => {
  try {
        const user = await User.findById(userId);
        const accessToken =  user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generation access token");

  }
}

const registerUser = asyncHandler(async (req, res) => {
  const  {fullName, username, email, password} = req.body;

  if (
    [fullName, username, email, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email/username already exists!")
  }

  let avatarLocalPath;
  let coverImageLocalPath;

  if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length){
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length){
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required!")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email, 
    password
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User register successfully!")
   )
  
});

const loginUser = asyncHandler(async (req, res) => {
  // login data
  // find the user 
  // encrypt the password
  // check the password
  // generate the access and refresh token
  // send cookie
  // get basic userinfo
  // send response - userinfo, access and refresh token

  const {email, username, password} = req.body;

  if(!email && !username){
    throw new ApiError(400, "username or email is required");
  }

  if(!password){
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if(!user){
    throw new ApiError(404, "User does not exists")
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // set cookeis
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken,
    },"User logged in successfully")
    )

})

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },{
      new: true
    }
   ) 

   const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200,{}, "User logout successfully"))

})

export { 
  registerUser,
  loginUser,
  logoutUser
 };
