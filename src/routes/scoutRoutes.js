const express = require("express");
const scoutRouter = express.Router();

const userAuth = require("../middleware/auth");
const authorizedRole = require("../middleware/authorizedRole");
const Bookmark = require("../models/bookmark");
const Feedback = require("../models/feedback");
const User = require("../models/user");


scoutRouter.get("/scout/dashboard" , userAuth , authorizedRole("scout") , async(req,res)=>{
    try{
        const scoutId = req.user._id;

        const [totalBookmarks, feedbackGiven, recentBookmarks] = await Promise.all([
            Bookmark.countDocuments({ scoutId }),
            Feedback.countDocuments({ scoutId }),
            Bookmark.find({ scoutId })
                .populate("playerId", "name profilePhoto playerProfile")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalBookmarks,
                feedbackGiven
            },
            recentBookmarks
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

scoutRouter.get("/scout/recommendation" , userAuth , authorizedRole("scout") , async(req,res) => {
    try {
        const scoutId = req.user._id;
        const scoutSports = req.user.scoutProfile?.sports || [];

        if (scoutSports.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Scout sports are not configured."
            });
        }

        const bookmarks = await Bookmark.find({ scoutId })
            .select("playerId");

        const bookmarkedPlayerIds = bookmarks.map(
            (bookmark) => bookmark.playerId
        );

        const recommendations = await User.find({
            role: "player",
            "playerProfile.sport": {
                $in: scoutSports
            },
            _id: {
                $nin: bookmarkedPlayerIds
            }
        })
        .select(
            "name playerProfile createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(10);

        return res.status(200).json({
            success: true,
            totalRecommendations: recommendations.length,
            recommendations
        });

    } 
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

module.exports = scoutRouter;