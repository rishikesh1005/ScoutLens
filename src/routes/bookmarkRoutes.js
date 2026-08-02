const express = require("express");
const userAuth = require("../middleware/auth");
const bookmarkRouter = express.Router();
const Bookmark = require("../models/bookmark");
const mongoose = require("mongoose");
const authorizedRole = require("../middleware/authorizedRole");
const User = require("../models/user");
const Notification = require("../models/notification");

bookmarkRouter.post("/player/:playerId/bookmark" , userAuth, authorizedRole('scout') , async(req,res) => {
    try{
        const {playerId}= req.params;

        if(!mongoose.Types.ObjectId.isValid(playerId)){
            return res.status(400).json({
                success: false,
                message: "Invalid Player ID"
            });
        }

        const player = await User.findById(playerId);

        if(!player || player.role !== "player"){
            return res.status(404).json({
                success: false,
                message: "Player Not Found!!!"
            })
        }

        const present = await Bookmark.findOne({
            playerId,
            scoutId:req.user._id
        })

        if(present){
            return res.status(409).json({
                success: false,
                message: "Player already bookmarked"
            })
        }

        const bookmark = new Bookmark({
            playerId: playerId,
            scoutId: req.user._id,
        })

        await bookmark.save();

        const notification = new Notification({
            receiverId: playerId,
            senderId: req.user._id,
            type: "bookmark",
            message: `${req.user.name} bookmarked your profile.`,
            referenceId: bookmark._id,
        });

        await notification.save();

        return res.status(201).json({
            success: true,
            message:"Player bookmarked",
            bookmark
        })

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
});

bookmarkRouter.get("/bookmark" , userAuth , authorizedRole("scout"), async(req,res) => {
    try{
        const scoutId = req.user._id;

        const bookmarks = await Bookmark.find({
            scoutId
        }).populate("playerId" , "name playerProfile");


        return res.status(200).json({
            success: true,
            message: "Bookmark Players",
            bookmarks
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

bookmarkRouter.delete("/player/:playerId/bookmark", userAuth , authorizedRole('scout') , async(req,res) => {
    try{
        const {playerId} = req.params;
        const scoutId = req.user._id;
        
        if(!mongoose.Types.ObjectId.isValid(playerId)){
            return res.status(400).json({
                success: false,
                message: "Invalid Player ID"
            });
        }

        const player = await User.findById(playerId);

        if(!player || player.role !== "player"){
            return res.status(404).json({
                success: false,
                message: "Player not found"
            })
        }

        const bookmarkPresent = await Bookmark.findOne({
            scoutId,
            playerId
        })

        if(!bookmarkPresent){
            return res.status(404).json({
                success: false,
                message: "Bookmark not Present"
            })
        }

        await bookmarkPresent.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Bookmark Deleted"
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})


module.exports = bookmarkRouter;