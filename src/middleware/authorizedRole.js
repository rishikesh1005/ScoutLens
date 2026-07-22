
const authorizedRole = (...allowedRoles) => {
    return (req,res,next) => {      
        const userRole = req.user.role;

        if(allowedRoles.includes(userRole)){
            return next();
        }
        else{
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }
    }
}

module.exports = authorizedRole;