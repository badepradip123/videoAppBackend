import { User } from "../models/user.models.js";
import {  ApiError, uploadOnCloudinary, ApiResponse, asyncHandler } from "../utils/index.js";

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

export { registerUser };
