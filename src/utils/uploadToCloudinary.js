const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (file, resourceType, folder) => {
    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                folder: folder,
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        ).end(file);
    });

    return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
    };
};

module.exports = uploadToCloudinary;