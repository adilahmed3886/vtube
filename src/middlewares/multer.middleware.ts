import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
    destination: function(req: Request, file, cb){
        const tempPath = path.resolve(__dirname, '../../public/temp');
        cb(null, tempPath);
    },
    filename: function(req: Request, file, cb){
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });