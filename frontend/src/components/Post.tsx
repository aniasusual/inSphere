"use client";
import React, { useEffect, useState } from "react";
import { CarouselDefault } from "@components/Carousels/carouselDefault";
import { Avatar } from "@material-tailwind/react";
import {
  IconHeart,
  IconHeartFilled,
  IconMessage2,
  IconShare3,
  IconBookmark,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import defaultImage from "@assets/defaultImage.jpg";
import { useSelector } from "react-redux";
import { RootState } from "store";
import axios from "axios";
import { toaster } from "./ui/toaster";
import { Comments } from "./Comments";

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

interface PostProps {
  posts: PostItem[];
}

export function Post({ posts }: PostProps) {
  console.log("posts: ", posts);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <motion.div
        className="antialiased pt-4 relative w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {posts?.length > 0 ? (
          posts.map((item, index) => (
            <PostItem
              key={item._id || `content-${index}`}
              item={item}
              index={index}
              setShowComments={setShowComments}
              setActivePostId={setActivePostId}
            />
          ))
        ) : (
          <p>No posts available</p>
        )}
      </motion.div>

      {activePostId && (
        <Comments
          postId={activePostId}
          isVisible={showComments}
          onClose={() => {
            setShowComments(false);
            setActivePostId(null);
          }}
        />
      )}
    </>
  );
}

function PostItem({
  item,
  index,
  setShowComments,
  setActivePostId,
}: {
  item: PostItem;
  index: number;
  setShowComments: (value: boolean) => void;
  setActivePostId: (id: string | null) => void;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes?.length || 0);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user } = useSelector((state: RootState) => state.user);

  const toggleLike = async (e: any) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/like/${item._id}`,
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
      setIsLiked(false);
    }
  };

  useEffect(() => {
    if (user && item) {
      setIsLiked(item.likes?.includes(user._id) || false);
      setIsBookmarked(item.savedBy?.includes(user._id) || false);
      setIsFollowing(user.usersFollowed?.includes(item.creator?._id) || false);
    }
  }, [user, item]);

  const toggleBookmark = async (e: any) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/save/${item._id}`,
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

  const toggleFollow = async (e: any, id: string) => {
    e.preventDefault();
    setIsFollowing(!isFollowing);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/follow/${id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toaster.create({
          title: `${data.message}`,
          type: "info",
        });
      }
      setIsFollowing(data.success);
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

    const shareUrl = `${window.location.origin}/post/detail/${item._id}`;
    const shareData = {
      title: item.title || "Check out this post!",
      text: item.description || "Found this awesome post!",
      url: shareUrl,
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toaster.create({
          title: "Link copied to clipboard!",
          type: "info",
        });
      } catch (error) {
        toaster.create({
          title: "Failed to copy link",
          type: "error",
        });
      }
    };

    const triggerNativeShare = async () => {
      try {
        await navigator.share(shareData);
        toaster.create({
          title: "Post shared successfully!",
          type: "success",
        });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          toaster.create({
            title: "Failed to share post",
            type: "error",
          });
        }
      }
    };

    toaster.create({
      title: "Share Post",
      description: (
        <div className="space-y-2">
          <p>Share this post:</p>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy Link
            </button>
            {navigator.share && (
              <button
                onClick={triggerNativeShare}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Share
              </button>
            )}
          </div>
        </div>
      ),
      type: "info",
      duration: 5000,
    });
  };

  if (!item) {
    return <div>Error: Post item is undefined</div>;
  }

  return (
    <motion.div className="mb-10 bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden">
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
              <Link to={`/user/${item.creator?._id}`}>
                <Avatar
                  src={item.creator?.avatar?.url || defaultImage}
                  alt={item.creator?.firstName || "unknown user"}
                  size="md"
                  className="border-2 border-blue-500 shadow-lg"
                />
              </Link>
            </motion.div>
            <div className="pl-5">
              <motion.p
                className="text-xl font-semibold dark:text-white"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Link to={`/user/${item.creator?._id}`}>
                  {item.creator?.username || "Unknown"}
                </Link>
                <motion.div
                  className="text-sm flex items-center"
                  whileHover={{ scale: 1.05, x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  {isFollowing ? (
                    <button
                      onClick={(e) => toggleFollow(e, item.creator?._id || "")}
                      className="outline-none"
                    >
                      <span className="text-green-500 font-medium">
                        following
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => toggleFollow(e, item.creator?._id || "")}
                      className="outline-none"
                    >
                      <span className="text-red-500 font-medium">follow</span>
                    </button>
                  )}
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    whileHover={{ width: "100%", opacity: 1 }}
                    className="h-0.5 bg-red-500 ml-0.5"
                  />
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
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "N/A"}
          </motion.div>
        </motion.div>
      </div>

      {item.mediaFiles && item.mediaFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <CarouselDefault
            images={item.mediaFiles.map((file) => file?.url || defaultImage)}
          />
        </motion.div>
      )}

      <div className="p-4">
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
                  onClick={(e) => toggleLike(e)}
                />
              ) : (
                <IconHeart
                  stroke={1.5}
                  size={32}
                  className="hover:text-red-500 hover:cursor-pointer transition-colors"
                  onClick={(e) => toggleLike(e)}
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
                onClick={() => {
                  setActivePostId(item._id || "");
                  setShowComments(true);
                }}
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
              onClick={(e) => toggleBookmark(e)}
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
            {item.creator?.username || "Unknown"}
          </span>:
          <div className="font-bold text-center">{item.title}</div>
          {item.description || "No description"}
        </motion.div>

        {item.hashtags && item.hashtags.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            {item.hashtags.map((hashtag, idx) => (
              <Link
                key={idx}
                to={`/hashtags/${hashtag}`}
                className="bg-black text-white rounded-full text-sm px-4 py-1 dark:bg-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                {hashtag}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
