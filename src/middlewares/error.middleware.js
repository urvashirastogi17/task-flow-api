import {logger} from "../utils/logger.js";

const errorHandler = ( err, req, res, next  )=>{

    let error = err;

    if(!(error instanceof Error)){ // check is this real error object
        error = new Error(
            "Something went wrong"
        );
    }

    const response = {
        success: false,
        message: error.message || "Internal Server Error",
        errors: error.errors || [],
        stack: process.env.NODE_ENV === "development"
        ? error.stack
        : undefined
    };

    logger.error(`${err.message}`)

    return res.status(error.statusCode || 500).json(response)

};

export {errorHandler};