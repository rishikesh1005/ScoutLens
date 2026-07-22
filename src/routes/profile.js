const express = require("express")
const profileRouter = express.Router();
const userAuth = require("../middleware/auth.js");
const User = require("../models/user.js");
const { validateEditData } = require("../utils/validation.js");

profileRouter.get("/profile/view", userAuth ,async (req,res)=>{
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        return res.status(400).send({
            message: err.message
        })
    }
})

profileRouter.patch("/profile/edit",userAuth , async(req,res) => {
    try{
        // validate kro data edit karna allowed h ki nahi
        if(!validateEditData(req)){
            throw new Error("Provide only valid data to update!!!")
        }
        // user find karo 
        const loggedInUser = req.user;

        // user ki who fields update kr do
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])

        await loggedInUser.save()
        loggedInUser.password = undefined
        // send kardo
        res.status(200).send({
            message:"Profile updated successfully!!!",
            data: loggedInUser
        }) 
    }
    catch(err){
        return res.status(400).send({
            message:err.message
        })
    }
})

module.exports = profileRouter