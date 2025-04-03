import { Request, Response } from "express";
import { IUser } from "../models/User";
import { Jam } from "../models/jamsModel";

export const createJam = async (req: Request, res: Response) => {
    const { name, description, isPublic, maxParticipants, location } = req.body;

    const displayImage = req.file ? {
        mediaType: req.file.mimetype.startsWith("image/") ? "image" : "video",
        public_id: req.file.filename,
        url: req.file.path,
    } : null;

    const user = req.user as IUser; // From auth middleware

    try {
        const inviteCode = Math.random().toString(36).substring(7);

        const jam = new Jam({
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


        await jam.save();
        res.status(201).json(jam);
    } catch (error: any) {
        console.log("error: ", error);
        res.status(500).json({
            error: 'Failed to create jam',
            message: error
        });
    }
};

export const getLocalJams = async (req: Request, res: Response) => {
    const { longitude, latitude } = req.query;
    try {
        const jams = await Jam.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
                    $maxDistance: 10000, // 10 km
                },
            },
        }).populate('creator', 'username avatar');
        res.json(jams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch local jams' });
    }
};

export const getSearchData = async (req: Request, res: Response) => {
    try {
        // Get query parameters
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const searchQuery = req.query.q as string;

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
        const totalJams = await Jam.countDocuments();

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
        let message: string;
        let totalMatchingItems: number;

        if (searchQuery && searchQuery.trim().length > 0) {
            // Search mode with pagination
            const searchConditions = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } }
                ]
            };

            // Get total matching documents for pagination
            totalMatchingItems = await Jam.countDocuments(searchConditions);

            jams = await Jam.find(searchConditions)
                .skip(skip)
                .limit(limit)
                .populate('creator', 'username email')
                .populate('participants', 'username')
                .lean();

            message = `Retrieved ${jams.length} jams matching search query "${searchQuery}"`;
        } else {
            // Random mode with pagination
            totalMatchingItems = totalJams; // For random, total is all jams

            // For random selection with pagination, we'll use $sample with skip
            jams = await Jam.aggregate([
                { $sample: { size: totalJams } }, // Randomize all documents
                { $skip: skip },
                { $limit: limit }
            ]).exec();

            // Populate after aggregation
            jams = await Jam.populate(jams, [
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

    } catch (error: any) {
        console.error('Error in getSearchData:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching jams',
            error: error.message
        });
        return;
    }
};