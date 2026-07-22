const mongoose = require("mongoose");
const User = require("./user");


const videoSchema = new mongoose.Schema({
    playerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    videoUrl:{
        type:String,
        required:true,
    },
    publicId:{
        type:String,
        required:true,
    },
    likes:{
        type: Number,
        default: 0
    },

    isFeatured:{
        type: Boolean,
        default: false
    }
},{
    timestamps:true,
})

const Video = mongoose.model("Video" , videoSchema);

module.exports = Video;