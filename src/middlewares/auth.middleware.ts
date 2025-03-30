import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { env } from "../../config/env";

declare module 'express' {
    interface Request {
        user?: typeof User.prototype;
    }
}

const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Access token missing");
        }

        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
        
        if (!decoded?._id) {
            throw new ApiError(401, "Invalid token payload");
        }

        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new ApiError(401, "Token expired"));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new ApiError(401, "Invalid token"));
        }
        next(error);
    }
});

export { verifyJWT };