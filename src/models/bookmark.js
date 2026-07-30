const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
    scoutId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true,
})

bookmarkSchema.index(
    {scoutId:1,playerId:1},
    {unique:true}
)

const Bookmark = mongoose.model("Bookmark" , bookmarkSchema);

module.exports = Bookmark;