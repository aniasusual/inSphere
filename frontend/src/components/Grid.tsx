import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface MediaFile {
  _id: string;
  url: string;
  type: string;
}

interface Post {
  _id: string;
  title: string;
  description: string;
  creator: {
    _id: string;
    username: string;
    avatar?: string;
  };
  mediaFiles: MediaFile[];
}

interface GridProps {
  posts: Post[];
}

interface StructuredMediaFile extends MediaFile {
  postId: string;
  creator: Post["creator"];
  title: string;
  description: string;
  gridClass: string;
}

const BentoGrid: React.FC<GridProps> = ({ posts }) => {
  const navigate = useNavigate();

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

  const getStructuredMediaFiles = (): StructuredMediaFile[] => {
    // Take only the first media file from each post
    const allMediaFiles = posts.map((post) => ({
      ...post.mediaFiles[0], // Only the first media file
      postId: post._id,
      creator: post.creator,
      title: post.title,
      description: post.description,
      gridClass: "",
    }));

    // Apply grid classes as before
    return allMediaFiles.map((mediaFile, index) => {
      const setIndex = Math.floor(index / 6);
      const withinSetIndex = index % 6;

      return {
        ...mediaFile,
        gridClass:
          setIndex % 2 === 0
            ? withinSetIndex === 0
              ? "col-span-2 row-span-2"
              : "col-span-1 row-span-1"
            : withinSetIndex === 0
            ? "col-span-1 row-span-1"
            : withinSetIndex === 1
            ? "col-span-2 row-span-2"
            : "col-span-1 row-span-1",
      };
    });
  };

  const structuredMediaFiles =
    posts && posts.length > 0 ? getStructuredMediaFiles() : [];

  // Handle click to navigate to post detail page
  const handleImageClick = (postId: string): void => {
    navigate(`/post/detail/${postId}`);
  };

  return (
    <div className="relative">
      {structuredMediaFiles.length > 0 ? (
        <div className="grid grid-cols-3 grid-rows-2 gap-1 sm:gap-1 lg:gap-2 p-2 lg:max-w-xl mx-auto">
          {structuredMediaFiles.map((mediaFile) => (
            <motion.div
              key={mediaFile._id}
              className={`${mediaFile.gridClass} relative group cursor-pointer overflow-hidden rounded-lg`}
              onClick={() => handleImageClick(mediaFile.postId)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={mediaFile.url}
                alt={mediaFile.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <p className="text-white text-sm font-medium">
                  {mediaFile.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No posts to display
        </div>
      )}
    </div>
  );
};

export default BentoGrid;
