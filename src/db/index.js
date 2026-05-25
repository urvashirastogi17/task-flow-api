import mongoose from "mongoose";
import {logger} from "../utils/logger.js";

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        logger.info("✅ MongoDb connected")
    }catch (error){
        logger.error(`❌ MongoDb connection error: ${error.stack}`);
        setTimeout(()=>{
            process.exit(1);
        },1000);
    }
}

export default connectDB;