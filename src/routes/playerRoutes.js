const express = require("express");
const userAuth = require("../middleware/auth");
const User = require("../models/user");
const Video = require("../models/video");
const mongoose  = require("mongoose");
const authorizedRole = require("../middleware/authorizedRole");
const playerRouter = express.Router();

playerRouter.get("/player/:playerId", userAuth, async (req, res) => {
    try {
        const { playerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(playerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Player ID"
            });
        }

        const player = await User.findById(playerId)
            .select("name profilePhoto playerProfile createdAt role");

        if (!player || player.role !== "player") {
            return res.status(404).json({
                success: false,
                message: "Player not found."
            });
        }

        const playerVideos = await Video.find({ playerId })
            .select(
                "title description videoUrl isFeatured createdAt"
            )
            .sort({ createdAt: -1 });

        const featuredVideo = playerVideos.find(video => video.isFeatured) || null;

        const videos = playerVideos.filter(video => !video.isFeatured);

        const videoIds = playerVideos.map(video => video._id);

        const feedbackReceived = await Feedback.countDocuments({
            videoId: {
                $in: videoIds
            }
        });

        return res.status(200).json({
            success: true,
            message: "Player profile fetched successfully.",
            player,
            stats: {
                videosUploaded: playerVideos.length,
                feedbackReceived
            },
            featuredVideo,
            otherVideos: videos
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

playerRouter.get("/players/search" , userAuth , authorizedRole("scout") , async(req,res) => {
    try{
        const {name,region,minAge,maxAge,sport,sortBy} = req.query;

        const currentPage  = Math.max(parseInt(req.query.page)  || 1, 1);
        const pageLimit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip  = (currentPage - 1) * pageLimit;
        
        if (minAge && maxAge && Number(minAge) > Number(maxAge)){
            return res.status(400).json({
                success: false,
                message: "Minimum age cannot be greater than maximum age."
            });
        }

        const allowedSort = ["newest", "oldest"];

        if (sortBy && !allowedSort.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort option. Use 'newest' or 'oldest'."
            });
        }

        const filter = {
            role:"player",
        }
        
        if(name?.trim()){
            filter.name = {
                $regex: name.trim(),
                $options: "i",
            };
        }

        if(region) filter["playerProfile.region"] = region.trim();
        if(sport) filter["playerProfile.sport"] = sport.trim();

        if(minAge || maxAge){
            filter["playerProfile.age"] = {};
            if(minAge){
                filter["playerProfile.age"].$gte = Number(minAge);
            }
            if(maxAge){
                filter["playerProfile.age"].$lte = Number(maxAge);
            }
        }

        const sortOrder = sortBy === "oldest" ? 1 : -1;
        const sort = { createdAt: sortOrder };
        
        const players = await User.find(filter)
        .select("name playerProfile createdAt")
        .sort(sort)
        .skip(skip)
        .limit(pageLimit);

        const totalPlayers = await User.countDocuments(filter);

        return res.status(200).json({
            success: true,
            currentPage,
            pageSize: pageLimit,
            totalPages: Math.ceil(totalPlayers / pageLimit),
            totalResults: totalPlayers,
            hasNextPage: currentPage < Math.ceil(totalPlayers / pageLimit),
            hasPreviousPage: currentPage > 1,
            players
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

module.exports = playerRouter;