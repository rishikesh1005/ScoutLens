const express = require("express");
const feedbackRoute = express.Router();
const userAuth = require("../middleware/auth");
const authorizedRole = require("../middleware/authorizedRole");
const mongoose = require("mongoose");
const Feedback = require("../models/feedback");
const Video = require("../models/video");
const Reply = require("../models/reply");


feedbackRoute.post("/video/:videoId/feedback", userAuth , authorizedRole("scout"), async(req,res) => {
    try{
        const {videoId} = req.params;
        const {message} = req.body;

        if(!message?.trim()){
            return res.status(400).json({
                success: false,
                message: "Feedback message is required."
            })
        }

        if(!mongoose.Types.ObjectId.isValid(videoId)){
            return res.status(400).json({
                success: false,
                message: "Invalid Video ID"
            });
        }

        const video = await Video.findById(videoId);

        if(!video){
            return res.status(404).json({
                success: false,
                message: "Video not found!!!"
            })
        }

        const existingFeedback = await Feedback.findOne({
            videoId,
            scoutId: req.user._id
        });

        if (existingFeedback) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted feedback for this video."
            });
        }

        const feedback = new Feedback({
            videoId: videoId,
            scoutId: req.user._id,
            message
        })

        await feedback.save();

        return res.status(201).json({
            success: true,
            message: "feedback sent successfully",
            feedback
        })

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

feedbackRoute.get("/video/:videoId/feedback" , userAuth , async(req,res) => {
    try{
        const {videoId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(videoId)){
            return res.status(400).json({
                success: false,
                message: "Invalid Video ID"
            });
        }

        const video = await Video.findById(videoId);

        if(!video){
            return res.status(404).json({
                success: false,
                message: "Video not found"
            })
        }

        const feedback = await Feedback.find({videoId})
        .populate("scoutId", "name")
        .sort({createdAt:-1})

        return res.status(200).json({
            success: true,
            feedback
        })

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

feedbackRoute.delete("/feedback/:feedbackId", userAuth, authorizedRole('scout') , async(req,res) => {
    try{
        const {feedbackId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(feedbackId)){
            return res.status(400).json({
                success: false,
                message: "Invalid Feedback ID"
            });
        }

        const feedback = await Feedback.findById(feedbackId);

        if(!feedback){
            return res.status(404).json({
                success: false,
                message: "Feedback does not exist."
            })
        }

        if (!feedback.scoutId.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this feedback."
            });
        }

        await Reply.deleteMany({ feedbackId });

        await feedback.deleteOne();

        return res.status(200).json({
            success: true,
            message:"Feedback deleted successfully"
        })

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }

})

feedbackRoute.post("/feedback/:feedbackId/reply" , userAuth , authorizedRole('player') , async(req,res) => {
    try{
        const {feedbackId} = req.params;

        const {message} = req.body;

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Reply message is required."
            });
        }

        if(!mongoose.Types.ObjectId.isValid(feedbackId)){
            return res.status(400).json({
                success: false,
                message: "Invalid Feedback ID"
            });
        }

        const feedback = await Feedback.findById(feedbackId);

        if(!feedback){
            return res.status(404).json({
                success: false,
                message: "Feedback does not exist."
            })
        }

        const video = await Video.findById(feedback.videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found."
            });
        }

        if (!video.playerId.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reply to this feedback."
            });
        }

        const existingReply = await Reply.findOne({
            feedbackId,
            playerId: req.user._id
        });

        if (existingReply) {
            return res.status(409).json({
                success: false,
                message: "You have already replied to this feedback."
            });
        }

        const reply = new Reply({
            feedbackId,
            playerId: req.user._id,
            message
        })

        await reply.save();

        return res.status(201).json({
            success: true,
            message: "Reply sent successfully",
            reply,
        })

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

feedbackRoute.get("/feedback/:feedbackId/replies",userAuth,async (req, res) => {
    try {
        const { feedbackId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Feedback ID"
            });
        }

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found."
            });
        }

        const replies = await Reply.find({ feedbackId })
            .populate("playerId", "name profilePhoto")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            replies
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
    }
);

feedbackRoute.delete("/reply/:replyId", userAuth , authorizedRole("player") ,async (req, res) => {
    try {
        const { replyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(replyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Reply ID"
            });
        }

        const reply = await Reply.findById(replyId);

        if (!reply) {
            return res.status(404).json({
                success: false,
                message: "Reply not found."
            });
        }

        if (!reply.playerId.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this reply."
            });
        }

        await reply.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Reply deleted successfully."
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
    }
);

module.exports = feedbackRoute;