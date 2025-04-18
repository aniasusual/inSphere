import { NextFunction, Request, Response } from "express"
import { userModel } from "../models/User";
import { ErrorHandler } from "../utils/errorHandler";
// import { sendEmail } from "../utils/apifeatures";
import crypto from "crypto";
import { sendToken } from "../utils/jwtToken";

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const { firstName, lastName, email, password, username } = req.body;
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            username,
            password,
            verificationToken,
            isVerified: false
        });

        if (!user) {
            return next(new ErrorHandler("User creation failed", 500));
        }

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the link: \n\n ${verificationUrl}`;

        // await sendEmail({
        //     email: user.email,
        //     subject: 'Email Verification',
        //     message,
        // });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            user
        });


    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not created due to an unknown error",
                error: "Unknown error"
            });
        }
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return next(new ErrorHandler("Please enter username and password", 400));

        }
        const user = await userModel.findOne({ username }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));

        }

        // if (!user.isVerified) {
        //     const verificationToken = crypto.randomBytes(32).toString('hex');

        //     const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        //     const message = `Please verify your email by clicking on the link: \n\n ${verificationUrl}`;

        //     await sendEmail({
        //         email: user.email,
        //         subject: 'Email Verification',
        //         message,
        //     });
        //     // return next(new ErrorHandler("Please verify your email to login", 401));
        //     res.status(500).json({
        //         status: "verification",
        //         message: "You are not verified. Email Sent for Verification. Please verify 🙄"
        //     })

        // }
        // else

        sendToken(user, 200, res);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
}

export const getUserDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;

        res.status(200).json({
            status: "success",
            message: "User Loaded",
            user
        })

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
}

export const logout = (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid", {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : false,
        });
        // Clear the token cookie
        res.cookie("token", "", {
            expires: new Date(Date.now()), // Set the cookie to expire immediately
            httpOnly: true,
        });
        res.status(200).json({
            message: "Logged Out",
        });
    });
};

export const fetchUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await userModel.findOne({ _id: id });

        res.status(200).json({
            "success": true,
            user
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }

}


export const findUsersAround = async function (req: Request, res: Response) {
    // const currentUser = req.user;
    const { longitude, latitude, maxDistance } = req.body;

    if (!longitude && !latitude) {
        res.status(500).json({ success: false, message: 'Cant access your location, please give location permissions if not given already' })
        return;
    };

    if (!longitude) {
        res.status(500).json({ success: false, message: 'Longitude not provided' });
        return;
    };

    if (!latitude) {
        res.status(500).json({ success: false, message: 'Latitude not provided' });
        return;
    };




    try {
        const users = await userModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: maxDistance * 1000
                }
            }
        });

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to find users nearby' });
    }
};


export const updateUserLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?._id;

        const { longitude, latitude } = req.body;

        if (!longitude && !latitude) {
            res.status(400).json({ success: false, message: 'Cannot access your location. Please grant location permissions if not already given.' });
            return;
        }
        if (!longitude) {
            res.status(400).json({ success: false, message: 'Longitude not provided' });
            return;
        }
        if (!latitude) {
            res.status(400).json({ success: false, message: 'Latitude not provided' });
            return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Update user's location
        user.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        await user.save();
        res.json({ success: true, message: 'User location updated successfully', user });

    } catch (error) {
        console.error('Error updating user location:', error);
        next(error); // Properly forward errors to the Express error handler
    }
};


export const followUser = async (req: Request, res: Response) => {
    const currentUserId = req.user?._id;
    const userIdToFollow = req.params.id;

    if (!currentUserId || !userIdToFollow) {
        res.status(400);
        throw new Error("User IDs are required");
    }

    if (currentUserId.toString() === userIdToFollow) {
        res.status(400).json({
            success: false,
            message: "You cannot follow yourself"
        });
        return;
    }

    try {
        const [currentUser, userToFollow] = await Promise.all([
            userModel.findById(currentUserId),
            userModel.findById(userIdToFollow)
        ]);

        if (!currentUser) {
            res.status(404);
            throw new Error("Current user not found");
        }
        if (!userToFollow) {
            res.status(404).json({
                success: false,
                message: "User not found!"
            });
            return;
        }

        // Check if user is blocked
        if (userToFollow.blockedUsers.includes(currentUserId.toString())) {
            res.status(403).json({
                success: false,
                message: "You cannot follow this user"
            });
            return;
        }

        const isAlreadyFollowing = currentUser.usersFollowed.some(id => id.toString() === userIdToFollow);

        if (isAlreadyFollowing) {
            // Unfollow the user
            await Promise.all([
                userModel.findByIdAndUpdate(
                    currentUserId,
                    { $pull: { usersFollowed: userIdToFollow } },
                    { new: true }
                ),
                userModel.findByIdAndUpdate(
                    userIdToFollow,
                    { $inc: { followersCount: -1 } }
                )
            ]);

            res.status(200).json({
                success: true,
                message: `Successfully unfollowed ${userToFollow.username}`,
                data: {
                    unfollowedUserId: userIdToFollow,
                    username: userToFollow.username
                }
            });
        } else {
            // Follow the user
            await Promise.all([
                userModel.findByIdAndUpdate(
                    currentUserId,
                    { $push: { usersFollowed: userIdToFollow } },
                    { new: true }
                ),
                userModel.findByIdAndUpdate(
                    userIdToFollow,
                    { $inc: { followersCount: 1 } }
                )
            ]);

            res.status(200).json({
                success: true,
                message: `Successfully followed ${userToFollow.username}`,
                data: {
                    followedUserId: userIdToFollow,
                    username: userToFollow.username
                }
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error("Error following/unfollowing user: " + (error as Error).message);
    }
};


interface UserSearchQuery {
    q?: string; // Search term for username, email, firstName, lastName, or bio
    status?: "online" | "offline" | "away" | "do_not_disturb";
    location?: string; // GeoJSON coordinates as string
    radius?: string; // Radius in meters for location search
    visibility?: "public" | "friends_only" | "private";
    limit?: string;
    page?: string;
}

export const getSearchData = async (req: Request, res: Response) => {
    try {
        // Extract query parameters
        const {
            q,
            status,
            location,
            radius,
            visibility,
            limit = "10",
            page = "1",
        } = req.query as UserSearchQuery;

        // Build the MongoDB query
        const query: any = {};

        // Text search across username, email, firstName, lastName, and bio
        if (q) {
            query.$or = [
                { username: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { firstName: { $regex: q, $options: "i" } },
                { lastName: { $regex: q, $options: "i" } },
                { bio: { $regex: q, $options: "i" } },
            ];
        }

        // Filter by status
        if (status && ["online", "offline", "away", "do_not_disturb"].includes(status)) {
            query.status = status;
        }

        // Filter by profile visibility
        if (
            visibility &&
            ["public", "friends_only", "private"].includes(visibility)
        ) {
            query["preferences.privacySettings.profileVisibility"] = visibility;
        }

        // Geospatial search
        if (location && radius) {
            try {
                const coords = JSON.parse(location);
                if (Array.isArray(coords) && coords.length === 2) {
                    query.location = {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [coords[0], coords[1]],
                            },
                            $maxDistance: parseInt(radius) || 10000, // Default 10km
                        },
                    };
                }
            } catch (error) {
                res.status(400).json({ error: "Invalid location format" });
                return;
            }
        }

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Execute the query
        const users = await userModel
            .find(query)
            .select("-password -authToken -resetPasswordToken -resetPasswordExpire -verificationToken") // Exclude sensitive fields
            .populate("userPosts", "title createdAt") // Populate basic post info
            .populate("usersFollowed", "username avatar") // Populate followed users
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Newest users first

        // Get total count for pagination
        const totalUsers = await userModel.countDocuments(query);

        // Response
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalUsers / limitNum),
                totalUsers,
                limit: limitNum,
            },
        });
    } catch (error) {
        console.error("Error in getUserSearchData:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
