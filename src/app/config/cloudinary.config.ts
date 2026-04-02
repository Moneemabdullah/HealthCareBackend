import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHealpers/AppError";
import status from "http-status";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY_API_SECRET,
});

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const regex = /\/([^\/]+)\.[^\/]+$/;

        const match = url.match(regex);

        if (!match || match[1]) {
            const publicId = match[1];

            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
            });
        }
    } catch (error) {
        throw new AppError(
            status.BAD_REQUEST,
            "Error deleting file from Cloudinary:" + (error as Error).message,
        );
    }
};

export const cloudinaryUpload = cloudinary;
