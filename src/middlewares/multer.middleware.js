import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({ // store uploaded file physically on disk ex- public/temp/myimage.png
    destination: function(req,file,cb){ //where upload file will be stored
        cb(null,"./public/temp");// cb - callback function - means in this line - No error save value
        // public/temp - this stores temporary uploaded files
    },
    filename:function(req,file,cb){ // controls final saved filename
        const uniqueName = Date.now()+"-"+ file.originalname;// without it - same filename overwrites old files

        cb(null,uniqueName)
    }
});

export const upload = multer({
    storage
});

// after multer executes - req.file gets craeted automatically 
//ex -  {
// fieldname:"avatar",
// originalname:"photo.png",
// filename: "9839878957-photo.png",
// path:"public/temp/9839878957-photo.png"
//}