"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFilesFromCloudinary = exports.uploadFilesToCloudinary = exports.getBase64 = void 0;
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
// Helper function to convert a file to a base64 string
const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
exports.getBase64 = getBase64;
// Function to upload files to Cloudinary
const uploadFilesToCloudinary = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (files = []) {
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload((0, exports.getBase64)(file), {
                resource_type: 'auto',
                public_id: (0, uuid_1.v4)(),
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve({
                    public_id: result === null || result === void 0 ? void 0 : result.public_id,
                    url: result === null || result === void 0 ? void 0 : result.secure_url,
                });
            });
        });
    });
    try {
        const results = yield Promise.all(uploadPromises);
        return results;
    }
    catch (err) {
        throw new Error(`Error uploading files to Cloudinary: ${err.message}`);
    }
});
exports.uploadFilesToCloudinary = uploadFilesToCloudinary;
// Function to delete files from Cloudinary
const deleteFilesFromCloudinary = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (public_ids = []) {
    const deletePromises = public_ids.map((public_id) => {
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.destroy(public_id, { resource_type: 'image' }, (error, result) => {
                if (error)
                    return reject(error);
                resolve({
                    public_id: result === null || result === void 0 ? void 0 : result.public_id,
                    result: result === null || result === void 0 ? void 0 : result.result,
                });
            });
        });
    });
    try {
        const results = yield Promise.all(deletePromises);
        return results;
    }
    catch (err) {
        throw new Error(`Error deleting files from Cloudinary: ${err.message}`);
    }
});
exports.deleteFilesFromCloudinary = deleteFilesFromCloudinary;
