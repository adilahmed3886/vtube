import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controllers";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshToken);

//Protected Routes:

router.route("/logout").get(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").patch(verifyJWT, changePassword);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

export default router;
