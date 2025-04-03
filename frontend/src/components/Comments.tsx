import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toaster } from "./ui/toaster";
import { MessageCircle, Send, X, Reply, Trash2 } from "lucide-react";

interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: { url?: string };
  };
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Comments({ postId, isVisible, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = { _id: "user1", username: "currentUser" };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API_BACKEND_URL
        }/api/v1/comment/comments/${postId}`,
        { withCredentials: true }
      );
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toaster.create({
        title: "Couldn't load comments",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const endpoint = replyTo
        ? `/api/v1/comment/${postId}/reply/${replyTo}`
        : `/api/v1/comment/${postId}`;

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}${endpoint}`,
        { content: newComment },
        { withCredentials: true }
      );

      if (data.success) {
        setNewComment("");
        setReplyTo(null);
        fetchComments();
        toaster.create({
          title: "Comment added",
          type: "success",
        });
      }
    } catch (error: any) {
      toaster.create({
        title: error.response?.data?.message || "Failed to add comment",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/comment/${commentId}`,
        { withCredentials: true }
      );

      if (data.success) {
        fetchComments();
        toaster.create({
          title: "Comment deleted",
          type: "success",
        });
      }
    } catch (error: any) {
      toaster.create({
        title: error.response?.data?.message || "Failed to delete comment",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserColor = (username: string) => {
    const hash = username.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, postId]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-2xl bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg z-50 flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{ maxHeight: "80vh" }}
          >
            <div className="w-full flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                <MessageCircle className="text-blue-500" size={20} />
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4">
              {isLoading && comments.length === 0 ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle
                    size={28}
                    className="mx-auto mb-2 opacity-40"
                  />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="py-2">
                  {comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: getUserColor(
                              comment.user.username
                            ),
                          }}
                        >
                          {comment.user.avatar?.url ? (
                            <img
                              src={comment.user.avatar.url}
                              alt={comment.user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(comment.user.username)
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm dark:text-gray-200">
                              {comment.user.username}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="mt-1 text-sm dark:text-gray-300">
                            {comment.content}
                          </p>

                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => setReplyTo(comment._id)}
                              className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                            >
                              <Reply size={14} /> Reply
                            </button>

                            {comment.user._id === currentUser._id && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-11">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="py-2">
                              <div className="flex gap-3">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{
                                    backgroundColor: getUserColor(
                                      reply.user.username
                                    ),
                                  }}
                                >
                                  {reply.user.avatar?.url ? (
                                    <img
                                      src={reply.user.avatar.url}
                                      alt={reply.user.username}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    getInitials(reply.user.username)
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm dark:text-gray-200">
                                      {reply.user.username}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(
                                        reply.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm dark:text-gray-300">
                                    {reply.content}
                                  </p>

                                  {reply.user._id === currentUser._id && (
                                    <div className="mt-1">
                                      <button
                                        onClick={() =>
                                          handleDeleteComment(reply._id)
                                        }
                                        className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                      >
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              {replyTo && (
                <div className="mb-2 text-xs flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <span className="text-blue-600 dark:text-blue-400">
                    Replying to a comment
                  </span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <form onSubmit={handleAddComment}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      replyTo ? "Write your reply..." : "Add a comment..."
                    }
                    className="flex-1 p-3 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !newComment.trim()}
                    className={`p-3 rounded-full ${
                      newComment.trim()
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } text-white transition-colors disabled:opacity-70`}
                  >
                    <Send
                      size={18}
                      className={isLoading ? "animate-pulse" : ""}
                    />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
