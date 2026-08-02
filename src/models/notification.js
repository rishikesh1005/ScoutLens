const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["bookmark", "feedback", "reply"],
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
},{
    timestamps: true,
});

const Notification = mongoose.model("Notification",notificationSchema);

module.exports = Notification;