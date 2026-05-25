import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const adminDashboard = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                admin: req.user
            },
            "Welcome Admin"
        )
    )
})

export {adminDashboard};