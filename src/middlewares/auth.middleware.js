import { User } from "../models/user.models.js";
import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from 'jsonwebtoken';


export const verifyJWT = asyncHandler(async (req, res, next)=> {
    try {
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }else{
           const decodeToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
           const user = await User.findById(decodeToken?._id).select("--password -refreshToken");
           if(!user){
            // Discuss frontend with chai_aur_code
            throw new ApiError(401, "Invalid Access Token")
           }
           req.user = user;
           next();
        }
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
})