const express = require("express");
const notificationRouter = express.Router();

const Notification = require("../models/notification");
const userAuth = require("../middleware/auth");

notificationRouter.get("/notification",userAuth,async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const [notifications, unreadCount] = await Promise.all([
            Notification.find({
                receiverId: loggedInUser
            })
            .populate("senderId","name profilePhoto")
            .sort({ createdAt: -1 }),

            Notification.countDocuments({
                receiverId: loggedInUser,
                isRead: false
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully.",
            unreadCount,
            notifications
        });

    } 
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

notificationRouter.patch("/notification/:notificationId/read",userAuth,async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Notification ID."
            });
        }

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        if (!notification.receiverId.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this notification."
            });
        }

        if (notification.isRead) {
            return res.status(200).json({
                success: true,
                message: "Notification already marked as read.",
                notification
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read successfully.",
            notification
        });

    } 
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

notificationRouter.delete("/notification/:notificationId",userAuth,async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Notification ID."
            });
        }

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        if (!notification.receiverId.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this notification."
            });
        }

        await notification.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully."
        });

    } 
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);

module.exports = notificationRouter;