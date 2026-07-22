const mongoose = require("mongoose");
const validator = require("validator")

const playerSchema = new mongoose.Schema({
    region:{
        type:String,
        required: true,

    },
    age:{
        type:Number,
        required:true,
    },
    sport:{
        type: String,
        required:true,
    },

},{
    timestamps:true,
})

const scoutSchema = new mongoose.Schema({
    organisation:{
        type:String,
        required:true,
    },
    scoutId:{
        type:String,
    },
    verificationStatus:{
        type: String,
        enum: ["approved", "rejected", "pending"],
        default: "pending"
    },
},{
    timestamps:true,
})

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:2,
    },
    emailId:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email!! enter correct emailId" + value);
            }
        },
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Password not Strong!!! Enter strong Password")
            }
        },
    },
    role:{
        type: String,
        enum:{
            values: ["player", "scout" , "admin"],
        },
        required:true,
    },
    playerProfile:playerSchema,
    scoutProfile:scoutSchema,
},{
    timestamps:true,
})

const User = mongoose.model("User" , userSchema);

module.exports = User;