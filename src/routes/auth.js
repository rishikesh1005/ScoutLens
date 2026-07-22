const express = require("express");
const authRouter = express.Router();

const User = require("../models/user");
const bcrypt = require("bcrypt");
const {validateSignupData,validatePlayerProfile,validateScoutProfile ,validateLoginData} = require("../utils/validation");
const jwt = require("jsonwebtoken");

authRouter.post("/signup" ,async (req,res) => {
    try{
        validateSignupData(req);

        const {name ,emailId , password , role} = req.body;
        const user = await User.findOne({emailId});

        if(user){
            return res.status(400).send("User already exists!!!");
        }

        if(role !== "player" && role !== "scout"){
            return res.status(400).send("Invalid role");
        }

        const hashPassword = await bcrypt.hash(password,10);

        let newUser;

        if(role === "player"){
            const playerProfile = req.body.playerProfile;
            if(!playerProfile){
                throw new Error("Player profile required");
            }

            validatePlayerProfile(playerProfile);
            
            const {region , age, sport} = playerProfile;

            newUser = new User({
                name,
                emailId,
                password: hashPassword,
                role:"player",
                playerProfile:{
                    region,
                    age,
                    sport
                }
            })
        }
        
        if(role === "scout"){
            const scoutProfile = req.body.scoutProfile;
            if(!scoutProfile){
                throw new Error("Scout profile required");
            }

            validateScoutProfile(scoutProfile);
            
            const {organisation,scoutId} = scoutProfile;

            newUser = new User({
                name,
                emailId,
                password: hashPassword,
                role:"scout",
                scoutProfile:{
                    organisation,
                    scoutId,
                    verificationStatus: "pending"
                }
            })
        }

        const savedUser = await newUser.save();

        savedUser.password = undefined

        res.status(201).send({
            message:"user saved",
            data:savedUser,
        })
    }
    catch(err){
        return res.status(400).send({
            message: err.message
        });
    }
})


authRouter.post("/login" , async(req,res) => {
    try{
        const {emailId , password} = req.body;
        validateLoginData(req.body);

        const user = await User.findOne({emailId});

        if(!user){
            return res.status(404).send("User not found!!!")
        }

        const hashedPassword = user.password;
        const isPasswordValid = await bcrypt.compare(password , hashedPassword);

        if(!isPasswordValid){
            return res.status(401).send("Invalid credentials");
        }

        const token = await jwt.sign(
            {_id: user._id , role: user.role}, 
            process.env.JWT_SECRET , 
            {expiresIn:"7d"}
        )

        res.cookie("token", token,{
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        user.password = undefined;
        res.send({
            message:"user loggedIn successfully",
            data: user
        });
    }
    catch(err){
        return res.status(400).send({
            message: err.message
        });
    }

})


module.exports = authRouter