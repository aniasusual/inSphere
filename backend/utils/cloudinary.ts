import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuid } from 'uuid';

interface File {
    mimetype: string;
    buffer: Buffer;
}

interface CloudinaryUploadResult {
    public_id: string;
    url: string;
}

interface CloudinaryDeleteResult {
    public_id: string;
    result: string;
}

// Helper function to convert a file to a base64 string
export const getBase64 = (file: File): string =>
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

// Function to upload files to Cloudinary
const uploadFilesToCloudinary = async (files: File[] = []): Promise<CloudinaryUploadResult[]> => {
    const uploadPromises = files.map((file) => {
        return new Promise<CloudinaryUploadResult>((resolve, reject) => {
            cloudinary.uploader.upload(
                getBase64(file),
                {
                    resource_type: 'auto',
                    public_id: uuid(),
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        public_id: result?.public_id as string,
                        url: result?.secure_url as string,
                    });
                }
            );
        });
    });

    try {
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (err) {
        throw new Error(`Error uploading files to Cloudinary: ${(err as Error).message}`);
    }
};

// Function to delete files from Cloudinary
const deleteFilesFromCloudinary = async (public_ids: string[] = []): Promise<CloudinaryDeleteResult[]> => {
    const deletePromises = public_ids.map((public_id) => {
        return new Promise<CloudinaryDeleteResult>((resolve, reject) => {
            cloudinary.uploader.destroy(
                public_id,
                { resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        public_id: result?.public_id as string,
                        result: result?.result as string,
                    });
                }
            );
        });
    });

    try {
        const results = await Promise.all(deletePromises);
        return results;
    } catch (err) {
        throw new Error(`Error deleting files from Cloudinary: ${(err as Error).message}`);
    }
};

export { uploadFilesToCloudinary, deleteFilesFromCloudinary };
