import React, { useState } from 'react';
import { Plus, MessageSquarePlus, Users } from 'lucide-react';  // Importing X icon for close
import ChannelCreationForm from './CreateChannel';
import { XCircle } from 'lucide-react'; // Import the XCircle icon
import PostCreationForm from './CreatePost';
import CreateJam from './createJam';

const FloatingActionMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateJam, setShowCreateJam] = useState(false);

    const menuItems = [
        {
            id: 'channel',
            label: 'Create New Channel',
            icon: <Users className="h-5 w-5" />,
            onClick: () => setShowCreateChannel(true)
        },
        {
            id: 'post',
            label: 'Create New Post',
            icon: <MessageSquarePlus className="h-5 w-5" />,
            onClick: () => setShowCreatePost(true)
        },
        {
            id: 'jam',
            label: 'Create New Jam',
            icon: <MessageSquarePlus className="h-5 w-5" />,
            onClick: () => setShowCreateJam(true)
        }
    ];

    // Function to close both forms
    const closeModal = () => {
        setShowCreateChannel(false);
        setShowCreatePost(false);
    };

    // Function to handle clicks outside of the modal
    const handleBackdropClick = (e) => {
        // Close the modal only if the user clicks on the backdrop (not the modal content)
        if (e.target.classList.contains('backdrop')) {
            closeModal();
        }
    };

    return (
        <div className="fixed bottom-10 left-6 z-20 ">
            {/* Menu Items */}
            <div className={`flex flex-col-reverse justify-between gap-2 mb-4 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none w-0 h-0'}`}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            item.onClick();
                            setIsOpen(false);
                        }}
                        className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 
                            text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg
                            shadow-lg hover:shadow-xl transition-all duration-200
                            hover:translate-x-0 translate-x-12 transform
                            group relative"
                    >
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="flex items-center justify-center w-10 h-10 
                            bg-gray-100 dark:bg-gray-700 rounded-full
                            group-hover:bg-red-800 group-hover:text-white
                            transition-colors duration-200">
                            {item.icon}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full bg-red-700 hover:bg-red-900 
                   text-white shadow-lg hover:shadow-xl 
                   flex items-center justify-center
                   transition-all duration-300 transform
                   ${isOpen ? 'rotate-45' : 'rotate-0'}`}
            >
                <Plus className="h-6 w-6" />
            </button>

            {/* Modal for Create Channel and Create Post */}
            {(showCreateChannel || showCreatePost || showCreateJam) && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop"
                    onClick={handleBackdropClick} // Handle backdrop click
                >
                    <div className="relative p-6 rounded-lg lg:w-[50%] w-[100%] z-50">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-black dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>

                        {/* Show appropriate form */}
                        {showCreateChannel && <ChannelCreationForm />}
                        {showCreatePost && <PostCreationForm />}
                        {showCreateJam && <CreateJam />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingActionMenu;
