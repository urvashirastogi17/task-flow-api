import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath){
            return null;
        }
        const response = await cloudinary.uploader.upload(// upload image from local storage to cloudinary server
            localFilePath,
            {
                resource_type:"auto"
            }
        );
        fs.unlinkSync(localFilePath); // after upload temp file no longer needed so delete it

        return response;

    } catch (error){
        fs.unlinkSync(localFilePath);

        return null;
    }
}

export {uploadOnCloudinary};

// frontend
// ↓
// multer temp storage
// ↓
// req.file.path
// ↓
// cloudinary upload
// ↓
// cloudinary URL
// ↓
// save URL in DB
// ↓
// delete local temp file