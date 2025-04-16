import React, { useState } from "react";
import { Card } from "@components/ui/shadcn/card";
import { Button } from "@components/ui/shadcn/button";
import { Switch } from "@components/ui/shadcn/switch";
import { Globe, Users, X, Hash } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/shadcn/alert";
import { motion } from "framer-motion";
import axios from "axios";
import { toaster } from "./ui/toaster";

interface ChannelFormData {
  name: string;
  description: string;
  isGlobal: boolean;
  radius: number;
  hashtags: string[];
}

interface Props {
  onClose: () => void;
}

const ChannelCreationForm = ({ onClose }: Props) => {
  const [formData, setFormData] = useState<ChannelFormData>({
    name: "",
    description: "",
    isGlobal: true,
    radius: 0,
    hashtags: [],
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const [hashtagInput, setHashtagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/channel/create-channel`,
        formData,
        config
      );

      if (data) {
        toaster.create({
          title: `Channel: ${data.channel.name} created successfully`,
          description: "Redirecting you to the channel...",
          type: "success",
        });
        setFormData({
          name: "",
          description: "",
          isGlobal: true,
          radius: 0,
          hashtags: [],
        });
      }
    } catch (error: any) {
      toaster.create({
        title: `Channel not created 🥲, ${error.response.data.message}`,
        description: "Please login and try again",
        type: "error",
      });
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
          <div className="flex items-center gap-4 mb-10 relative">
            <div className="absolute -left-4 w-1 h-12 bg-gradient-to-b from-red-400 to-red-600" />
            <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl">
              <Users className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Create a New Channel
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Set up your channel and start connecting with others
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className={labelClasses}>Channel Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClasses}
                placeholder="Enter channel name..."
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`${inputClasses} resize-none min-h-[100px]`}
                placeholder="What's this channel about?"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className={labelClasses}>Hashtags</label>
              <div className="relative">
                <Hash className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  className={`${inputClasses} pl-9`}
                  placeholder="Add hashtags and press Enter..."
                />
              </div>
              {formData.hashtags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 mt-2"
                >
                  {formData.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <Globe className="h-5 w-5 text-red-400" />
                <div>
                  <h3 className={labelClasses}>Private Channel</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.isGlobal
                      ? "Admin permission needed to join the channel"
                      : "Anyone can join the channel"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isGlobal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isGlobal: checked })
                }
                className="transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 pt-6"
            >
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 
                                    hover:from-red-600 hover:to-red-700
                                    text-white py-4 px-6 rounded-xl
                                    flex items-center justify-center gap-2
                                    transition-all duration-300 ease-out
                                    transform hover:scale-[1.02] hover:shadow-xl
                                    font-medium tracking-wide"
              >
                Create Channel
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-50 hover:bg-gray-100 
                                    dark:bg-gray-800 dark:hover:bg-gray-700
                                    text-gray-700 dark:text-gray-200 
                                    py-4 px-6 rounded-xl
                                    transition-all duration-300 ease-out
                                    transform hover:scale-[1.02]
                                    font-medium tracking-wide"
              >
                Cancel
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ChannelCreationForm;
