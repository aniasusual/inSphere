"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleFile = exports.attachmentsMulter = exports.singleAvatar = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure multer storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'],
        resource_type: 'auto', // allows both images and videos
    },
});
// const storage = multer.memoryStorage(); // Use memory storage for buffer handling
// Configure multer upload
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB file size limit
    },
});
// Define single file upload for avatars
const singleAvatar = upload.single('avatar');
exports.singleAvatar = singleAvatar;
const singleFile = upload.single('displayImage');
exports.singleFile = singleFile;
// Define multiple file upload for attachments
const attachmentsMulter = upload.array('mediaFiles', 10);
exports.attachmentsMulter = attachmentsMulter;
