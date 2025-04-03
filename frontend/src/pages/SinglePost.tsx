// src/pages/SinglePost.tsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Use "next/router" if using Next.js
import axios from "axios";
import { motion } from "framer-motion";
import { Avatar } from "@material-tailwind/react";
import {
  IconHeart,
  IconHeartFilled,
  IconMessage2,
  IconShare3,
  IconBookmark,
} from "@tabler/icons-react";
import { CarouselDefault } from "@components/Carousels/carouselDefault";

import defaultImage from "@assets/defaultImage.jpg";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { toaster } from "@components/ui/toaster";

interface PostItem {
  _id?: string;
  creator: {
    avatar?: { url?: string };
    firstName?: string;
    username?: string;
    _id?: string;
  };
  title?: string;
  description?: string;
  createdAt?: string;
  hashtags?: string[];
  savedBy?: any[];
  mediaFiles?: { url?: string }[];
  likes?: any[];
}

export function SinglePost() {
  const [post, setPost] = useState<PostItem | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const { postId } = useParams<{ postId: string }>();
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/detail/${postId}`,
          { withCredentials: true }
        );
        setPost(data.post);
        setLikeCount(data.post.likes?.length || 0);
        if (user) {
          setIsLiked(data.post.likes?.includes(user._id) || false);
          setIsBookmarked(data.post.savedBy?.includes(user._id) || false);
          setIsFollowing(
            user.usersFollowed?.includes(data.post.creator?._id) || false
          );
        }
      } catch (error) {
        toaster.create({
          title: "Failed to load post",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, user]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
    setLikeCount(newLikeCount);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/like/${post?._id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toaster.create({
          title: `${data.message}`,
          type: "info",
        });
        setLikeCount(data.post.likes?.length || newLikeCount);
      }
    } catch (error: any) {
      toaster.create({
        title: error.response.data.message,
        type: "error",
      });
      setIsLiked(false);
      setLikeCount(likeCount); // Revert on error
    }
  };

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/save/${post?._id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toaster.create({
          title: `${data.message}`,
          type: "info",
        });
      }
    } catch (error: any) {
      toaster.create({
        title: error.response.data.message,
        type: "error",
      });
      setIsBookmarked(false);
    }
  };

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFollowing(!isFollowing);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/follow/${post?.creator?._id
        }`,
        { withCredentials: true }
      );

      if (data.success) {
        toaster.create({
          title: `${data.message}`,
          type: "info",
        });
      }
    } catch (error: any) {
      toaster.create({
        title: error.response.data.message,
        type: "error",
      });
      setIsFollowing(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();

    const shareUrl = `${window.location.origin}/post/${post?._id}`;
    const shareData = {
      title: post?.title || "Check out this post!",
      text: post?.description || "Found this awesome post!",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toaster.create({
          title: "Post shared successfully!",
          type: "success",
        });
      } else {
        const copyToClipboard = async () => {
          await navigator.clipboard.writeText(shareUrl);
          toaster.create({
            title: "Link copied to clipboard!",
            type: "info",
          });
        };

        toaster.create({
          title: "Share Post",
          description: (
            <div>
              <p>Copy the link to share:</p>
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full p-2 mt-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={copyToClipboard}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy Link
              </button>
            </div>
          ),
          type: "info",
          duration: 5000,
        });
      }
    } catch (error: any) {
      toaster.create({
        title: "Failed to share post",
        type: "error",
      });
      console.error("Share error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-white">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-white">
        Post not found
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-8 mb-10 bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4">
        <motion.div
          className="flex flex-row justify-between items-center text-left mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.div
            className="flex flex-row justify-center items-center w-fit text-left"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar
                src={post.creator?.avatar?.url || defaultImage}
                alt={post.creator?.firstName || "unknown user"}
                size="md"
                className="border-2 border-blue-500 shadow-lg"
              />
            </motion.div>
            <div className="pl-5">
              <motion.p
                className="text-xl font-semibold dark:text-white"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {post.creator?.username || "Unknown"}
                <motion.div
                  className="text-sm flex items-center"
                  whileHover={{ scale: 1.05, x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  {user && (
                    <>
                      {isFollowing ? (
                        <button onClick={toggleFollow} className="outline-none">
                          <span className="text-green-500 font-medium">
                            following
                          </span>
                        </button>
                      ) : (
                        <button onClick={toggleFollow} className="outline-none">
                          <span className="text-red-500 font-medium">
                            follow
                          </span>
                        </button>
                      )}
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        whileHover={{ width: "100%", opacity: 1 }}
                        className="h-0.5 bg-red-500 ml-0.5"
                      />
                    </>
                  )}
                </motion.div>
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : "N/A"}
          </motion.div>
        </motion.div>
      </div>

      {post.mediaFiles && post.mediaFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <CarouselDefault
            images={post.mediaFiles.map((file) => file?.url || defaultImage)}
          />
        </motion.div>
      )}

      <div className="p-4 relative">
        <motion.div
          className="flex flex-row justify-between items-center text-left mb-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center">
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
              {isLiked ? (
                <IconHeartFilled
                  size={32}
                  className="text-red-500 hover:cursor-pointer"
                  onClick={toggleLike}
                />
              ) : (
                <IconHeart
                  stroke={1.5}
                  size={32}
                  className="hover:text-red-500 hover:cursor-pointer transition-colors"
                  onClick={toggleLike}
                />
              )}
            </motion.div>

            <motion.div
              className="ml-3"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <IconMessage2
                stroke={1.5}
                size={30}
                className="hover:text-blue-500 hover:cursor-pointer transition-colors dark:text-gray-300"
                onClick={() => setShowComments(!showComments)}
              />
            </motion.div>

            <motion.div
              className="ml-3"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <IconShare3
                stroke={1.5}
                size={28}
                className="hover:text-green-500 hover:cursor-pointer transition-colors dark:text-gray-300"
                onClick={handleShare}
              />
            </motion.div>
          </div>

          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
            <IconBookmark
              stroke={1.5}
              size={30}
              fill={isBookmarked ? "currentColor" : "none"}
              className={`hover:cursor-pointer transition-colors ${isBookmarked
                  ? "text-purple-500"
                  : "hover:text-purple-500 dark:text-gray-300"
                }`}
              onClick={toggleBookmark}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="text-sm font-medium mb-2 dark:text-gray-300"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          {likeCount} likes
        </motion.div>

        <motion.div
          className="text-sm text-left dark:text-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <span className="font-bold">
            {post.creator?.username || "Unknown"}
          </span>
          : {post.description || "No description"}
        </motion.div>

        {post.hashtags && post.hashtags.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            {post.hashtags.map((hashtag, idx) => (
              <span
                key={idx}
                className="bg-black text-white rounded-full text-sm px-4 py-1 dark:bg-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                {hashtag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Comments Section */}
        {showComments && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t pt-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white mb-4">
                Comments
              </h3>
              <div className="space-y-4">
                {/* Placeholder comments - replace with actual comment fetching */}
                <div className="text-sm dark:text-gray-300">
                  <span className="font-bold">Sarah</span>: This looks amazing!
                  😍
                </div>
                <div className="text-sm dark:text-gray-300">
                  <span className="font-bold">Mike</span>: Where was this taken?
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
