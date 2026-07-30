const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
    feedbackId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback",
        required:true,
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    message:{
        type:String,
        required: true,
        trim: true,
        maxlength: 500,
    },
}, {
    timestamps:true,
});

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;