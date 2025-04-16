import React, { useState, useRef } from "react";
import { X, Send, Image as ImageIcon } from "lucide-react";

interface CreateStoryProps {
  onStoryCreated: (story: { image: string; caption: string }) => void;
  onCancel: () => void;
}

const CreateStoryComponent: React.FC<CreateStoryProps> = ({
  onStoryCreated,
  onCancel,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleOpen = () => {
  //   setIsOpen(true);
  // };

  const handleClose = () => {
    setPreviewImage(null);
    setCaptionText("");
    if (onCancel) onCancel();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);

      // Create a new story object
      const newStory = {
        image: previewImage || "/api/placeholder/400/600",
        caption: captionText,
      };

      if (onStoryCreated) {
        onStoryCreated(newStory);
      }

      handleClose();
    }, 1500);
  };

  // Story creation modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300">
      <div className="relative w-full sm:w-96 md:w-[450px] h-auto bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Create Story
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-auto p-4 flex flex-col items-center">
          {!previewImage ? (
            <div
              onClick={triggerFileInput}
              className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors p-4"
            >
              <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Click to select an image for your story
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Recommended: Square or vertical images
              </p>
            </div>
          ) : (
            <div className="relative w-full">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />

          <div className="w-full mt-4">
            <textarea
              placeholder="Add a caption to your story..."
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!previewImage || isUploading}
            className={`px-4 py-2 rounded-lg flex items-center ${
              !previewImage || isUploading
                ? "bg-blue-400 dark:bg-blue-500 opacity-50 cursor-not-allowed"
                : "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700"
            } text-white font-medium transition-colors`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Share Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryComponent;
