const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (file) => {
    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "video" }, (error, result) => {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        }).end(file);
    });

    return {
        videoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
    };
}

module.exports = uploadToCloudinary;