import React, { useState } from "react";
import { Plus, MessageSquarePlus, Users } from "lucide-react";
import ChannelCreationForm from "./CreateChannel";
import { XCircle } from "lucide-react";
import PostCreationForm from "./CreatePost";
import CreateJam from "./createJam";

const FloatingActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateJam, setShowCreateJam] = useState(false);

  const menuItems = [
    {
      id: "post",
      label: "Create New Post",
      icon: <MessageSquarePlus className="h-5 w-5" />,
      onClick: () => setShowCreatePost(true),
      color: "bg-purple-500",
    },
    {
      id: "jam",
      label: "Create New Jam",
      icon: <MessageSquarePlus className="h-5 w-5" />,
      onClick: () => setShowCreateJam(true),
      color: "bg-teal-500",
    },
  ];

  // Function to close both forms
  const closeModal = () => {
    setShowCreateChannel(false);
    setShowCreatePost(false);
    setShowCreateJam(false);
  };

  // Function to handle clicks outside of the modal
  const handleBackdropClick = (e: any) => {
    if (e.target.classList.contains("backdrop")) {
      closeModal();
    }
  };

  return (
    <div className="fixed bottom-10 left-6 z-20">
      {/* Menu Items */}
      <div className="flex flex-col-reverse gap-3 mb-4">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick();
              setIsOpen(false);
            }}
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.8)",
              transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                index * 0.08
              }s`,
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg
                            text-white overflow-hidden
                            hover:shadow-xl hover:brightness-110
                            ${item.color} ${
              !isOpen ? "pointer-events-none" : ""
            }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-20">
              {item.icon}
            </span>
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-pink-600 
                    text-white shadow-lg hover:shadow-xl hover:scale-105
                    flex items-center justify-center
                    transition-all duration-300 ease-in-out"
        style={{
          boxShadow: isOpen
            ? "0 0 15px rgba(245, 40, 145, 0.5)"
            : "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Plus
          className="h-8 w-8 transition-transform duration-300 ease-in-out"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}
        />
      </button>

      {/* Modal */}
      {(showCreateChannel || showCreatePost || showCreateJam) && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 backdrop"
          onClick={handleBackdropClick}
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            // style={{
            //   transform: "translate(-50%, -50%)",
            //   animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            // }}
          >
            {/* Show appropriate form */}
            {showCreateChannel && <ChannelCreationForm onClose={closeModal} />}
            {showCreatePost && <PostCreationForm onClose={closeModal} />}
            {showCreateJam && <CreateJam onClose={closeModal} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingActionMenu;
