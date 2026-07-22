const validate = require("validator");

const validateSignupData = (req) => {
    const {name ,emailId , password , role} = req.body;

    if(!name || !emailId || !password || !role){
        throw new Error("Enter all valid credentials!!!")
    }
    else if(!validate.isStrongPassword(password)){
        throw new Error("Enter strong password")
    }
    else if(!validate.isEmail(emailId)){
        throw new Error("Enter valid email id")
    }
}

const validatePlayerProfile = (playerProfile) => {
    const {region , age ,sport } = playerProfile;

    if(!region || !age || !sport){
        throw new Error("Enter all required details!!!")
    }
    else if(age<5 || age > 70){
        throw new Error("Invalid age");
    }
}

const validateScoutProfile = (scoutProfile) => {
    const {organisation} = scoutProfile;

    if(!organisation){
        throw new Error("Enter organisation name");
    }

}

const validateLoginData = (req) => {
    const {emailId,password} = req;
    if(!emailId || !password){
        throw new Error("Enter all required details!!!");
    }
    else if(!validate.isEmail(emailId)){
        throw new Error("Enter valid Email!!!");
    }
    
}


const validateEditData = (req) => {
    const allowedEditData = ["name", "playerProfile" , "scoutProfile"];

    const isEditAllowed = Object.keys(req.body).every((key) => allowedEditData.includes(key));

    return isEditAllowed;
}


module.exports = {
    validateSignupData,
    validatePlayerProfile,
    validateScoutProfile,
    validateLoginData,
    validateEditData
}    