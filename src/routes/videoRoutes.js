const express = require("express");
const videoRouter = express.Router();
const userAuth = require("../middleware/auth");
const upload = require("../middleware/multer");
const Video = require("../models/video");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const cloudinary = require("../config/cloudinary");
const mongoose  = require("mongoose");
const authorizedRole = require("../middleware/authorizedRole")

videoRouter.post("/video/upload" , userAuth , authorizedRole("player") ,upload.single("video") , async (req,res) =>{
    try{
        const loggedInUser = req.user;

        const {title, description} = req.body;
        const isFeatured = req.body.isFeatured === "true";
        const file = req.file;

        if(!file){
            return res.status(400).send({
                message: "Video is required."
            });
        } 

        const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            "video",
            "ScoutLens/Videos"
        );

        const video = new Video({
            title,
            description,
            playerId: loggedInUser._id,
            videoUrl: uploadResult.url,
            publicId: uploadResult.publicId,
            isFeatured
        });

        await video.save();
        
        res.status(201).send({
            success: true,
            message:"video uploaded successfully",
            data: video,
        })
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        });
    }
})


videoRouter.get("/video/feed" , userAuth , async(req,res) => {
    try{
        const FEED_BATCH_SIZE = 20
        const videos = await Video.aggregate([{$sample: {size: FEED_BATCH_SIZE}}])

        const populatedVideos = await Video.populate(videos , {
            path : "playerId",
            select : "name playerProfile"
        });

        res.status(200).json({
            success: true,
            videos: populatedVideos
        });

    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
})

// feature/unfeature video
videoRouter.patch("/video/:videoId/feature", userAuth , authorizedRole("player"), async(req,res) => {
    try{
        const videoId = req.params.videoId

        if(!mongoose.Types.ObjectId.isValid(videoId)){
            return res.status(400).json({
                success: false,
                message: "Invalid video ID"
            });
        }

        const video = await Video.findById(videoId)

        if(!video){
            return res.status(404).json({
                success: false,
                message:"video Not found!!!"
            })
        }

        //if found check the owner
        if(video.playerId.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message: "owner not verified"
            })
        }

        if(video.isFeatured === true){
            return res.status(200).json({
                success: true,
                message: "This video is already Featured"
            })
        }

        const featuredVideo = await Video.findOne({playerId:video.playerId, isFeatured:true})

        if(featuredVideo){
            featuredVideo.isFeatured = false;
            await featuredVideo.save()
        }

        video.isFeatured = true;
        
        await video.save()

        res.status(200).json({
            success: true,
            message:"video featured successfully"
        })
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

// updating video details
videoRouter.patch("/video/:videoId" , userAuth , authorizedRole("player") , async(req,res) => {
    try{
        const videoId = req.params.videoId

        const {title,description} = req.body

        if(!mongoose.Types.ObjectId.isValid(videoId)){
            return res.status(400).json({
                success: false,
                message: "Invalid video ID"
            });
        }

        if (!title?.trim() || !description?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        const video = await Video.findById(videoId)

        if(!video){
            return res.status(404).json({
                success: false,
                message:"video Not found!!!"
            })
        }

        //if found, check the owner
        if(video.playerId.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message: "You are not authorized to update this video."
            })
        }

        video.title = title
        video.description = description;

        await video.save();

        return res.status(200).json({
            success: true,
            message: "video content updated",
            video
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message : err.message
        })
    }    
})


// Delete video
videoRouter.delete("/video/:videoId" , userAuth , authorizedRole("player"), async(req,res) => {
    try{
        const videoId = req.params.videoId;

        if(!mongoose.Types.ObjectId.isValid(videoId)){
            return res.status(400).json({
                success: false,
                message: "Invalid video id"
            })
        }

        const video = await Video.findById(videoId);

        if(!video){
            return res.status(404).json({
                success:false,
                message:"video not found"
            })
        }

        if(video.playerId.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this video"
            })
        }

        // delete from cloudinary
        await cloudinary.uploader.destroy(video.publicId, {
            resource_type: "video"
        });

        await video.deleteOne();

        return res.status(200).json({
            success:true,
            message:"video deleted successfully"
        })
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

module.exports = videoRouter;