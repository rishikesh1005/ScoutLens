const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Video",
        required: true 
    },
    scoutId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
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

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;