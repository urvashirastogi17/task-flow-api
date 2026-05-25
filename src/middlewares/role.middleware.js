import { ApiError } from "../utils/api-error.js";

const authorizeRoles = (...allowedRoles) =>{
    return (req,res,next)=>{
        
        const userRole = req.user?.role;

        if(!allowedRoles.includes(userRole)){
            throw new ApiError(
                403, "You are not allowed to access this resource"
            );
        }
        next();
    };
};

export {authorizeRoles};