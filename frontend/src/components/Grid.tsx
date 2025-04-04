import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BentoGrid = ({ posts }) => {
    const navigate = useNavigate();

    console.log("posts from bento: ", posts);

    // Function to create structured media files for the grid with proper styling classes
    // const getStructuredMediaFiles = () => {
    //     // Flatten all media files from all posts
    //     const allMediaFiles = posts.flatMap((post, postIndex) =>
    //         post.mediaFiles.map((mediaFile) => ({
    //             ...mediaFile,
    //             postId: post._id,
    //             creator: post.creator,
    //             title: post.title,
    //             description: post.description
    //         }))
    //     );

    //     // Apply grid classes to each media file
    //     return allMediaFiles.map((mediaFile, index) => {
    //         const setIndex = Math.floor(index / 6); // Determine which set of 6 images this belongs to
    //         const withinSetIndex = index % 6; // Index within the current set of 6 images

    //         return {
    //             ...mediaFile,
    //             gridClass:
    //                 (setIndex % 2 === 0) // Even set: big image on the left
    //                     ? (withinSetIndex === 0
    //                         ? "col-span-2 row-span-2"
    //                         : "col-span-1 row-span-1")
    //                     : (withinSetIndex === 0 // Odd set: big image on the right
    //                         ? "col-span-1 row-span-1"
    //                         : withinSetIndex === 1
    //                             ? "col-span-2 row-span-2"
    //                             : "col-span-1 row-span-1")
    //         };
    //     });
    // };

    const getStructuredMediaFiles = () => {
        // Take only the first media file from each post
        const allMediaFiles = posts.map((post) => ({
            ...post.mediaFiles[0], // Only the first media file
            postId: post._id,
            creator: post.creator,
            title: post.title,
            description: post.description
        }));

        // Apply grid classes as before
        return allMediaFiles.map((mediaFile, index) => {
            const setIndex = Math.floor(index / 6);
            const withinSetIndex = index % 6;

            return {
                ...mediaFile,
                gridClass:
                    (setIndex % 2 === 0)
                        ? (withinSetIndex === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1")
                        : (withinSetIndex === 0 ? "col-span-1 row-span-1" : withinSetIndex === 1 ? "col-span-2 row-span-2" : "col-span-1 row-span-1")
            };
        });
    };

    const structuredMediaFiles = posts && posts.length > 0 ? getStructuredMediaFiles() : [];

    // Handle click to navigate to post detail page
    const handleImageClick = (postId) => {
        navigate(`/post/detail/${postId}`);
    };

    return (
        <div className="relative">
            {structuredMediaFiles.length > 0 ? (
                <div className="grid grid-cols-3 grid-rows-2 gap-1 sm:gap-1 lg:gap-2 p-2 lg:max-w-xl mx-auto">
                    {structuredMediaFiles.map((mediaFile, index) => (
                        <motion.div
                            key={mediaFile._id}
                            className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer ${mediaFile.gridClass}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleImageClick(mediaFile.postId)}
                        >
                            <img
                                src={mediaFile.url}
                                alt={`${mediaFile.creator.username}'s post`}
                                className="w-full h-full object-cover aspect-square"
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-gray-500">No posts available</div>
            )}
        </div>
    );
};

export default BentoGrid;