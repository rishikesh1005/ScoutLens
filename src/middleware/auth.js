const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req,res,next) => {
    try{
        const token = req.cookies.token;

        if(!token){
            throw new Error("Invalid Token!!!");
        }

        const securedData = jwt.verify(token,process.env.JWT_SECRET);

        const userId = securedData._id;
        const user = await User.findById(userId)

        if(!user){
            throw new Error("User need to be loggedIn!!!");
        }

        req.user = user;

        next();
    }
    catch(err){
        return res.status(400).send({
            message: err.message
        })
    }
}

module.exports = userAuth