import React, { useState, useRef } from "react";
import { Users, Plus, Music, X, Image, Upload } from "lucide-react";
import { Card } from "@components/ui/shadcn/card";
import { motion } from "framer-motion";
import axios from "axios";

// Interface aligned with MongoDB Jam schema with added displayImage
interface JamFormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxParticipants: number;
  datetime: string;
  location?: [number, number]; // [longitude, latitude]
  displayImage?: File | null;
}

interface Props {
  onClose: () => void;
}

const CreateJam = ({ onClose }: Props) => {
  const [formData, setFormData] = useState<JamFormData>({
    name: "",
    description: "",
    isPublic: true,
    maxParticipants: 10,
    datetime: "",
    displayImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const coordinates = localStorage.getItem("userCoordinates");
      const parsedData = coordinates ? JSON.parse(coordinates) : null;

      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("isPublic", formData.isPublic.toString());
      formDataToSend.append(
        "maxParticipants",
        formData.maxParticipants.toString()
      );

      if (parsedData) {
        formDataToSend.append("location[0]", parsedData.longitude);
        formDataToSend.append("location[1]", parsedData.latitude);
      }

      // Append the image file if it exists
      if (formData.displayImage) {
        formDataToSend.append("displayImage", formData.displayImage);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/jam/create`,
        formDataToSend,
        config
      );

      setFormData({
        name: "",
        description: "",
        isPublic: true,
        maxParticipants: 10,
        datetime: "",
        displayImage: null,
      });
      setImagePreview(null);
      onClose(); // Close modal on success
    } catch (err) {
      setError("Failed to create jam. Please try again.");
      console.error("Error creating jam:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isPublic" ? value === "true" : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Update form data with the selected file
      setFormData((prev) => ({
        ...prev,
        displayImage: file,
      }));

      // Create and set image preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      displayImage: null,
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
              <Music className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Create a New Jam
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Set up your jam session and invite others to join
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
            {/* Image Upload Section - Added Above Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-red-400" />
                  Display Image
                </div>
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden h-48 mb-4">
                  <img
                    src={imagePreview}
                    alt="Jam display"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={triggerFileInput}
                  className="flex flex-col items-center justify-center h-48 
                  bg-gray-50/80 dark:bg-gray-800/50 
                  border-2 border-dashed border-gray-200 dark:border-gray-700 
                  rounded-xl cursor-pointer
                  hover:border-red-300 dark:hover:border-red-500
                  transition-all duration-300"
                >
                  <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Click to upload a display image
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Recommended: 1200 × 800px
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </motion.div>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className={labelClasses}>Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Give your jam session a catchy name"
                required
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className={labelClasses}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="What's this jam session about? Share the vibe you're going for..."
                required
              />
            </motion.div>

            {/* Date/Time and Participants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    Schedule
                  </div>
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </motion.div> */}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-400" />
                    Capacity
                  </div>
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="2"
                  max="100"
                  className={inputClasses}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className={labelClasses}>Visibility</label>
                <select
                  name="isPublic"
                  value={formData.isPublic.toString()}
                  onChange={handleInputChange}
                  className={inputClasses}
                >
                  <option value="true">Public (Anyone can join)</option>
                  <option value="false">Private (Invite only)</option>
                </select>
              </motion.div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 pt-6"
            >
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700
                  text-white py-4 px-6 rounded-xl
                  flex items-center justify-center gap-2
                  transition-all duration-300 ease-out
                  transform hover:scale-[1.02] hover:shadow-xl
                  font-medium tracking-wide ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <Plus className="w-5 h-5" />
                {loading ? "Creating..." : "Create Jam Session"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
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

export default CreateJam;
