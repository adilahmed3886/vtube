import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { IUser, User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      files?: {
        avatar?: Express.Multer.File[];
        coverImage?: Express.Multer.File[];
        [fieldname: string]: Express.Multer.File[] | undefined;
      };
    }
  }
}

const generateTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens");
  }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { displayName, email, username, password } = req.body;
  if (!displayName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const bio = req.body.bio?.trim() || "";

  const existingUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  let coverImagePath;
  if (req.files?.coverImage?.[0]) {
    coverImagePath = req.files.coverImage[0].path;
  }

  const avatar = await uploadToCloudinary(avatarPath);
  if (!avatar || !avatar.secure_url) {
    throw new ApiError(500, "Error while uploading avatar");
  }

  let coverImage;
  if (coverImagePath) {
    coverImage = await uploadToCloudinary(coverImagePath);
    if (!coverImage || !coverImage.secure_url) {
      throw new ApiError(500, "Error while uploading cover image");
    }
  }

  const user = await User.create({
    displayName: displayName.trim(),
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    avatar: { url: avatar.secure_url, public_id: avatar.public_id },
    coverImage: coverImage
      ? { url: coverImage.secure_url, public_id: coverImage.public_id }
      : "",
    bio: bio,
  });

  const createdUser = (await User.findById(user._id).select(
    "-password -refreshToken"
  )) as IUser | null;
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  console.log(req.body);
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required to login");
  }

  const user = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(
    user._id.toString()
  );

  const loggedInUser = (await User.findById(user._id).select(
    "-password -refreshToken"
  )) as IUser | null;
  if (!loggedInUser) {
    throw new ApiError(500, "User not found");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decodedUser = jwt.verify(
      incomingToken,
      env.REFRESH_TOKEN_SECRET
    ) as JwtPayload;
    const user = (await User.findById(decodedUser._id).select(
      "-password"
    )) as IUser | null;
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (user.refreshToken !== incomingToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateTokens(
      user._id.toString()
    );

    const loggedInUser = (await User.findById(user._id).select(
      "-password -refreshToken"
    )) as IUser | null;
    if (!loggedInUser) {
      throw new ApiError(500, "User not found");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "User logged in successfully", {
          user: loggedInUser,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(500, "Error while refreshing token");
  }
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password both are required");
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "Not authorized");
  }

  const isPasswordValid = await user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully", user));
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "Not authorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

const updateAccountDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { displayName, bio, email } = req.body;

    if (!displayName && !bio && !email) {
      throw new ApiError(400, "At least one field is required");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { displayName, bio, email } },
      { new: true }
    ).select("-password refreshToken");

    return res
      .status(200)
      .json(new ApiResponse(200, "User updated successfully", user));
  }
);

const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "Not authorized");
  }
  const oldPublicId = user.avatar?.public_id;

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  user.avatar = { public_id: avatar.public_id, url: avatar.secure_url };
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user?.avatar));
});

const updateCoverImage = asyncHandler(async (req: Request, res: Response) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(500, "Failed to upload cover image");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "Not authorized");
  }
  const oldPublicId = user.coverImage?.public_id;

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  user.coverImage = {
    public_id: coverImage.public_id,
    url: coverImage.secure_url,
  };
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Cover image updated successfully", user?.coverImage)
    );
});

const getUserChannelProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
      throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
      { $match: { username: username?.toLowerCase() } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscriberCount: {
            $size: "subscribers",
          },
          subscribedToCount: {
            $size: "subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          displayName: 1,
          username: 1,
          subscribersCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);

    if (!channel[0]) {
      throw new ApiError(404, "Channel not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Channel profile fetched successfully", channel[0])
      );
  }
);

const getWatchHistory = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.aggregate([
    { $match: { _id: req.user?._id } },
    //new mongoose.Types.ObjectId(req.user?._id as string)
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                { $project: { username: 1, displayName: 1, avatar: 1 } },
              ],
            },
          },
          { $addFields: { owner: { $first: "$owner" } } },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Watch history fetched successfully",
        user[0].watchHistory
      )
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
