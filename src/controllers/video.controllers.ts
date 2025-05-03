import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/apiResponse";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title) {
    throw new ApiError(400, "Title is required");
  }
  const videoPath = req.files?.video?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (!videoPath || !thumbnailPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const video = await uploadToCloudinary(videoPath);
  if (!video) {
    throw new ApiError(500, "Error while uploading video");
  }

  const thumbnail = await uploadToCloudinary(thumbnailPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error while uploading thumbnail");
  }

  const newVideo = await Video.create({
    title,
    description: description ? description : "",
    video: {
      url: video.secure_url,
      public_id: video.public_id,
    },
    thumbnail: thumbnail
      ? {
          url: thumbnail.secure_url,
          public_id: thumbnail.public_id,
        }
      : "",
    duration: video.duration,
    isPublished: true,
    owner: req.user?._id
    //new mongoose.Types.ObjectId(req.user._id as string)
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Video published successfully", newVideo));
});

const getVideoById = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  if(!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);
  if(!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video));
});

const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if(!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);
  if(!video) {
    throw new ApiError(404, "Video not found");
  }

  let newThumbnailPath;
  if(req.files?.thumbnail?.[0]) {
    newThumbnailPath = req.files.thumbnail[0].path;
  }

  let newThumbnail;
  if(newThumbnailPath) {
    newThumbnail = await uploadToCloudinary(newThumbnailPath);
    if(!newThumbnail) {
      throw new ApiError(500, "Error while uploading thumbnail");
    }
  }

  const oldPublicId = video.thumbnail?.public_id;
  if(oldPublicId) {
    const deleteThumbnail = await deleteFromCloudinary(oldPublicId);
    if(!deleteThumbnail) {
      throw new ApiError(500, "Error while deleting thumbnail");
    }
  }
  
  video.title = title;
  video.description = description;
  if(newThumbnail) {
    video.thumbnail = {
      url: newThumbnail.secure_url,
      public_id: newThumbnail.public_id,
    };
  }

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  if(!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);
  if(!video) {
    throw new ApiError(404, "Video not found");
  }
  const deletedVideo = await deleteFromCloudinary(video.video.public_id);
  if(!deletedVideo) {
    throw new ApiError(500, "Error while deleting video");
  }
  await video.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  if(!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);
  if(!video) {
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Video publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};