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
exports.findJamsAround = exports.getSearchData = exports.getLocalJams = exports.createJam = void 0;
const jamsModel_1 = require("../models/jamsModel");
const createJam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, isPublic, maxParticipants, location } = req.body;
    const displayImage = req.file ? {
        mediaType: req.file.mimetype.startsWith("image/") ? "image" : "video",
        public_id: req.file.filename,
        url: req.file.path,
    } : null;
    const user = req.user; // From auth middleware
    try {
        const inviteCode = Math.random().toString(36).substring(7);
        const jam = new jamsModel_1.Jam({
            name,
            description,
            creator: user._id,
            isPublic,
            inviteCode,
            displayImage,
            location: location ? { type: 'Point', coordinates: location } : undefined,
            maxParticipants,
            participants: [user._id],
        });
        yield jam.save();
        res.status(201).json(jam);
    }
    catch (error) {
        console.log("error: ", error);
        res.status(500).json({
            error: 'Failed to create jam',
            message: error
        });
    }
});
exports.createJam = createJam;
const getLocalJams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { longitude, latitude } = req.query;
    try {
        const jams = yield jamsModel_1.Jam.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
                    $maxDistance: 10000, // 10 km
                },
            },
        }).populate('creator', 'username avatar');
        res.json(jams);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch local jams' });
    }
});
exports.getLocalJams = getLocalJams;
const getSearchData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get query parameters
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const searchQuery = req.query.q;
        // Validate limit and page
        if (limit < 1 || limit > 100) {
            res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 100'
            });
            return;
        }
        if (page < 1) {
            res.status(400).json({
                success: false,
                message: 'Page must be 1 or greater'
            });
            return;
        }
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        // Get total count of jam documents
        const totalJams = yield jamsModel_1.Jam.countDocuments();
        // If no jams exist, return empty response
        if (totalJams === 0) {
            res.status(200).json({
                success: true,
                data: [],
                message: 'No jams found',
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalItems: 0,
                    limit
                }
            });
            return;
        }
        let jams;
        let message;
        let totalMatchingItems;
        if (searchQuery && searchQuery.trim().length > 0) {
            // Search mode with pagination
            const searchConditions = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } }
                ]
            };
            // Get total matching documents for pagination
            totalMatchingItems = yield jamsModel_1.Jam.countDocuments(searchConditions);
            jams = yield jamsModel_1.Jam.find(searchConditions)
                .skip(skip)
                .limit(limit)
                .populate('creator', 'username email')
                .populate('participants', 'username')
                .lean();
            message = `Retrieved ${jams.length} jams matching search query "${searchQuery}"`;
        }
        else {
            // Random mode with pagination
            totalMatchingItems = totalJams; // For random, total is all jams
            // For random selection with pagination, we'll use $sample with skip
            jams = yield jamsModel_1.Jam.aggregate([
                { $sample: { size: totalJams } }, // Randomize all documents
                { $skip: skip },
                { $limit: limit }
            ]).exec();
            // Populate after aggregation
            jams = yield jamsModel_1.Jam.populate(jams, [
                { path: 'creator', select: 'username email' },
                { path: 'participants', select: 'username' }
            ]);
            message = `Retrieved ${jams.length} random jams`;
        }
        // Filter out any null results and format the data
        const formattedJams = jams
            .filter(jam => jam !== null)
            .map(jam => ({
            id: jam._id,
            name: jam.name,
            description: jam.description,
            creator: jam.creator,
            isPublic: jam.isPublic,
            inviteCode: jam.inviteCode,
            location: jam.location,
            displayImage: jam.displayImage,
            participantCount: jam.participants.length,
            participants: jam.participants,
            maxParticipants: jam.maxParticipants,
            createdAt: jam.createdAt,
            updatedAt: jam.updatedAt
        }));
        // Calculate pagination info
        const totalPages = Math.ceil(totalMatchingItems / limit);
        res.status(200).json({
            success: true,
            data: formattedJams,
            message,
            totalAvailable: totalJams,
            searchTerm: searchQuery || null,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalMatchingItems,
                limit,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            }
        });
        return;
    }
    catch (error) {
        console.error('Error in getSearchData:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching jams',
            error: error.message
        });
        return;
    }
});
exports.getSearchData = getSearchData;
const findJamsAround = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // const currentUser = req.user;
        const { longitude, latitude, maxDistance } = req.body;
        if (!longitude && !latitude) {
            res.status(500).json({ success: false, message: 'Cant access your location, please give location permissions if not given already' });
            return;
        }
        ;
        if (!longitude) {
            res.status(500).json({ success: false, message: 'Longitude not provided' });
            return;
        }
        ;
        if (!latitude) {
            res.status(500).json({ success: false, message: 'Latitude not provided' });
            return;
        }
        ;
        try {
            const jams = yield jamsModel_1.Jam.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: maxDistance * 1000
                    }
                }
            }).populate('creator', 'username email')
                .populate('participants', 'username')
                .lean();
            ;
            res.json({ success: true, jams });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to find jams nearby' });
        }
    });
};
exports.findJamsAround = findJamsAround;
