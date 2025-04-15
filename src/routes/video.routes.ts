import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} 
from "../controllers/video.controllers";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyJWT)

router.route("/").get(getAllVideos)

router.route("/upload").post(upload.fields([
    {name: "video", maxCount: 1},
    {name: "thumbnail", maxCount: 1}
]), publishAVideo)

router.route("/:videoId")
.get(getVideoById)
.delete(deleteVideo)
.patch(upload.single("thumbnail"), updateVideo)

router.route("/toggle/:videoId").patch(togglePublishStatus)

export default router;
