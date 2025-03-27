import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env";
import fs from "fs";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
})

const uploadToCloudinary = async (filePath: string) => {
    if (!filePath) {
        return null;
    }
    try {
        const response = await cloudinary.uploader.upload(filePath, {resource_type: "auto"});
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
}

const deleteFromCloudinary = async (publicId: string, resourceType: string = "auto") => {
    if (!publicId) {
        return null;
    }
    try {
        const deleted = await cloudinary.uploader.destroy(publicId, {resource_type: resourceType});
        return deleted;
    } catch (error) {
        return error;
    }
}

export { uploadToCloudinary, deleteFromCloudinary };