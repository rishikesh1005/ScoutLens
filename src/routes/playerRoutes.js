const express = require("express");
const userAuth = require("../middleware/auth");
const User = require("../models/user");
const Video = require("../models/video");
const playerRouter = express.Router();

playerRouter.get("/player/:playerId", userAuth , async(req,res) => {
    try{
        const searchedPlayerId = req.params.playerId
        
        if (!mongoose.Types.ObjectId.isValid(searchedPlayerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Player ID"
            });
        }

        const player = await User.findById(searchedPlayerId);

        if(!player || player.role !== "player"){
            return res.status(404).json({
                "success":false,
                message: "Player not found!!!"
            })
        }

        const featuredVideo = await Video.findOne({
            playerId: searchedPlayerId,
            isFeatured: true
        });

        const otherVideos = await Video.find({
            playerId: searchedPlayerId,
            isFeatured: false
        });

        res.status(200).json({
            "success": true,
            "player" : player,
            "featuredVideo": featuredVideo,
            "videos": otherVideos
        })
    }
    catch(err){
        res.status(500).json({
            "success":false,
            message : err.message
        })
    }
})

module.exports = playerRouter;