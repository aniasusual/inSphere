import { v2 as cloudinary } from 'cloudinary';
import multer, { Multer } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Configure multer storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'],
        resource_type: 'auto', // allows both images and videos
    } as {
        folder: string;
        allowed_formats: string[];
        resource_type: string;
    },
});

// const storage = multer.memoryStorage(); // Use memory storage for buffer handling


// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB file size limit
    },
});

// Define single file upload for avatars
const singleAvatar = upload.single('avatar');
const singleFile = upload.single('displayImage');

// Define multiple file upload for attachments
const attachmentsMulter = upload.array('mediaFiles', 10);

// Export multer middlewares
export { singleAvatar, attachmentsMulter, singleFile };
