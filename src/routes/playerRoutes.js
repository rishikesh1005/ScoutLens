const express = require("express");
const userAuth = require("../middleware/auth");
const User = require("../models/user");
const Video = require("../models/video");
const mongoose  = require("mongoose");
const authorizedRole = require("../middleware/authorizedRole");
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

playerRouter.get("/players/search" , userAuth , authorizedRole("scout") , async(req,res) => {
    try{
        const {name,region,age,sport} = req.query;
        
        const filter = {
            role:"player",
        }
        
        if(name){
            filter.name = {
                $regex: name,
                $options: "i",
            };
        }

        if(region) filter["playerProfile.region"] = region;
        if(age) filter["playerProfile.age"] = age;
        if(sport) filter["playerProfile.sport"] = sport;

        const player = await User.find(filter).select(
            "name playerProfile"
        );

        return res.status(200).json({
            success: true,
            message: "Players profile based on filter",
            player
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

module.exports = playerRouter;