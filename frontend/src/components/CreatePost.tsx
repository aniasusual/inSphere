import React, { useState, useRef, useEffect } from "react";
import { Card } from "@components/ui/shadcn/card";

import { motion, AnimatePresence } from "framer-motion";

import { Loader2 } from "lucide-react";

import {
  MessageSquare,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
  Lock,
  Globe,
} from "lucide-react";
import axios from "axios";
import { toaster } from "./ui/toaster";

interface PostFormData {
  title: string;
  content: string;
  channelId: string;
  mediaFiles: File[];
  hashtags: string[];
  isPrivate: boolean;
  location: [number, number];
}

interface MediaPreview {
  url: string;
  type: "image" | "video";
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

interface Props {
  onClose: () => void;
}
const PostCreationForm = ({ onClose }: Props) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    channelId: "general",
    mediaFiles: [],
    hashtags: [],
    isPrivate: false,
    location: [0, 0],
  });

  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [uploadError, setUploadError] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        // setIsSelectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size should not exceed 100MB");
      return false;
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      setUploadError(
        "Invalid file type. Please upload images (JPG, PNG, GIF, WEBP) or videos (MP4, WEBM, MOV)"
      );
      return false;
    }

    return true;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");

    if (files.length + formData.mediaFiles.length > 10) {
      setUploadError("Maximum 10 media files allowed");
      return;
    }

    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...validFiles],
    }));

    const newPreviews: MediaPreview[] = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
    }));

    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index].url);

    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && hashtagInput.trim()) {
      e.preventDefault();
      const newTag = hashtagInput.trim().startsWith("#")
        ? hashtagInput.trim()
        : `#${hashtagInput.trim()}`;

      if (!formData.hashtags.includes(newTag)) {
        setFormData({
          ...formData,
          hashtags: [...formData.hashtags, newTag],
        });
      }
      setHashtagInput("");
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter((tag) => tag !== tagToRemove),
    });
  };

  const togglePrivacy = () => {
    setFormData((prev) => ({
      ...prev,
      isPrivate: !prev.isPrivate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const coordinates = localStorage.getItem("userCoordinates");

    const parsedData = JSON.parse(coordinates as string);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.content);
    formDataToSend.append("channelId", formData.channelId);
    formDataToSend.append("isPrivate", String(formData.isPrivate));
    formDataToSend.append("hashtags", JSON.stringify(formData.hashtags));
    formDataToSend.append(
      "locationString",
      JSON.stringify([parsedData.longitude, parsedData.latitude])
    );

    formData.mediaFiles.forEach((file) => {
      formDataToSend.append(`mediaFiles`, file);
    });

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/create-post`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      console.log("data: ", data);

      if (data.success) {
        toaster.create({
          description: data.message,
          type: "success",
        });
      }
    } catch (error: any) {
      toaster.create({
        description: error.response.data.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const scrollPosition =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const inputClasses = `
    w-full px-5 py-4 
    bg-gray-50/50 dark:bg-gray-800/50
    border-2 border-gray-100 dark:border-gray-700
    rounded-xl
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-0 focus:border-red-300 dark:focus:border-red-700
    transition-all duration-300 ease-out
    hover:border-gray-200 dark:hover:border-gray-600
    text-base
`;

  const labelClasses = `
    block text-sm font-medium tracking-wide uppercase
    text-gray-600 dark:text-gray-300
    mb-2 transition-colors duration-200
`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-6 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50"
    >
      <Card className="w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto h-fit">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10 relative">
            <div className="absolute -left-4 w-1 h-12 bg-gradient-to-b from-red-400 to-red-600" />
            <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl">
              <MessageSquare className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Create a New Post
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Share your thoughts with the community
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Privacy Toggle */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-end"
            >
              <button
                type="button"
                onClick={togglePrivacy}
                className={`
                                py-4 px-6 rounded-xl border-2
                                transition-all duration-300 ease-out
                                flex items-center gap-2
                                ${
                                  formData.isPrivate
                                    ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                                    : "bg-gradient-to-br from-red-500 to-red-600 text-white border-transparent"
                                }
                            `}
              >
                {formData.isPrivate ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Public
                  </>
                )}
              </button>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className={labelClasses}>Post Title</label>
              <input
                type="text"
                placeholder="Give your post a title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={inputClasses}
                required
              />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className={labelClasses}>Content</label>
              <textarea
                placeholder="What's on your mind?"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className={`${inputClasses} min-h-[150px] resize-none`}
                required
              />
            </motion.div>

            {/* Hashtags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <label className={labelClasses}>Hashtags</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  placeholder="Add hashtags and press Enter..."
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  className={`${inputClasses} pl-12`}
                />
              </div>
              <AnimatePresence>
                {formData.hashtags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {formData.hashtags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm group hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Media Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <label className={labelClasses}>Add media files (up to 10)</label>

              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl"
                >
                  {uploadError}
                </motion.div>
              )}

              <div className="relative">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex
                     p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg
                     hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors duration-200"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>

                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex
                     p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg
                     hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors duration-200"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto space-x-4 px-0 sm:px-12 py-4 scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <AnimatePresence>
                    {mediaPreviews.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative flex-none group"
                      >
                        {preview.type === "image" ? (
                          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden">
                            <video
                              src={preview.url}
                              className="w-full h-full object-cover"
                              controls
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 p-2 
                                     bg-red-500 hover:bg-red-600 
                                     rounded-full text-white
                                     opacity-0 group-hover:opacity-100 
                                     transition-all duration-200
                                     transform hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}

                    {formData.mediaFiles.length < 10 && (
                      <motion.label
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-none cursor-pointer"
                      >
                        <div
                          className="w-24 h-24 sm:w-32 sm:h-32 
                                    border-2 border-dashed border-gray-200 dark:border-gray-700 
                                    rounded-xl
                                    flex flex-col items-center justify-center gap-2
                                    hover:border-red-300 dark:hover:border-red-700
                                    hover:bg-red-50 dark:hover:bg-red-900/20
                                    transition-all duration-300"
                        >
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center px-2">
                            Upload Image/Video
                          </span>
                        </div>
                        <input
                          type="file"
                          accept={[
                            ...ALLOWED_IMAGE_TYPES,
                            ...ALLOWED_VIDEO_TYPES,
                          ].join(",")}
                          onChange={handleMediaUpload}
                          className="hidden"
                          multiple
                        />
                      </motion.label>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4 pt-6"
            >
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 
                                hover:from-red-600 hover:to-red-700
                                text-white py-4 px-6 rounded-xl
                                flex items-center justify-center gap-2
                                transition-all duration-300 ease-out
                                transform hover:scale-[1.02] hover:shadow-xl
                                font-medium tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Post"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-50 hover:bg-gray-100 
                                dark:bg-gray-800 dark:hover:bg-gray-700
                                text-gray-700 dark:text-gray-200 
                                py-4 px-6 rounded-xl
                                transition-all duration-300 ease-out
                                transform hover:scale-[1.02]
                                font-medium tracking-wide"
              >
                Cancel
              </button>
            </motion.div>
          </form>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default PostCreationForm;
