import cloudinary from "../config/cloudinary.js";
import AppError from "./AppError.js";

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param {Buffer} fileBuffer  - The file buffer from multer memoryStorage
 * @param {Object} options
 * @param {string} options.folder         - Cloudinary folder (e.g. "lms/thumbnails")
 * @param {string} options.resourceType   - "image" | "video" | "auto"
 * @param {string} [options.publicId]     - Optional custom public ID
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  const { folder = "lms", resourceType = "auto", publicId } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(
            new AppError(`Cloudinary upload failed: ${error.message}`, 500)
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID.
 *
 * @param {string} publicId     - The Cloudinary public ID
 * @param {string} resourceType - "image" | "video"
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

export default uploadToCloudinary;
