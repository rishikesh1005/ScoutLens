const express = require("express")
const profileRouter = express.Router();
const userAuth = require("../middleware/auth.js");
const User = require("../models/user.js");
const { validateEditData } = require("../utils/validation.js");
const upload = require("../middleware/multer.js");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const cloudinary = require("../config/cloudinary");

profileRouter.get("/profile/view", userAuth ,async (req,res)=>{
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        return res.status(400).send({
            message: err.message
        })
    }
})

profileRouter.patch("/profile/edit",userAuth , async(req,res) => {
    try{
        // validate kro data edit karna allowed h ki nahi
        if(!validateEditData(req)){
            throw new Error("Provide only valid data to update!!!")
        }
        // user find karo 
        const loggedInUser = req.user;

        // user ki who fields update kr do
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])

        await loggedInUser.save()
        loggedInUser.password = undefined
        // send kardo
        res.status(200).send({
            message:"Profile updated successfully!!!",
            data: loggedInUser
        }) 
    }
    catch(err){
        return res.status(400).send({
            message:err.message
        })
    }
})

profileRouter.patch("/profile/photo",userAuth,upload.single("profilePhoto"),async (req, res) => {
        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a profile photo."
                });
            }

            const loggedInUser = req.user;

            if (loggedInUser.profilePhotoPublicId) {
                await cloudinary.uploader.destroy(
                    loggedInUser.profilePhotoPublicId,
                    {
                        resource_type: "image"
                    }
                );
            }

            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                "image",
                "ScoutLens/ProfilePhotos"
            );

            loggedInUser.profilePhoto = uploadResult.url;
            loggedInUser.profilePhotoPublicId = uploadResult.publicId;

            await loggedInUser.save();

            return res.status(200).json({
                success: true,
                message: "Profile photo updated successfully.",
                profilePhoto: loggedInUser.profilePhoto
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }
);

module.exports = profileRouter