import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, X } from 'lucide-react';

interface Story {
    id: number;
    user: string;
    avatar: string;
    image: string;
    timestamp: string;
}

interface StoriesComponentProps {
    initialStories?: Story[];
}

const StoriesComponent: React.FC<StoriesComponentProps> = ({
    initialStories = [
        {
            id: 1,
            user: "alex.wav",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "2h"
        },
        {
            id: 2,
            user: "lily.jpeg",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "3h"
        },
        {
            id: 3,
            user: "sam.png",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "4h"
        },
        {
            id: 4,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 5,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 6,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 7,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 8,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 9,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 10,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
        {
            id: 11,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            image: "/api/placeholder/400/600",
            timestamp: "5h"
        },
    ]
}) => {
    const [activeStory, setActiveStory] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [isViewingStory, setIsViewingStory] = useState<boolean>(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isViewingStory) {
            timer = setInterval(() => {
                if (progress < 100) {
                    setProgress(prev => prev + 1);
                } else {
                    setProgress(0);
                    setActiveStory(prev => {
                        const nextStory = (prev + 1) % initialStories.length;
                        if (nextStory === 0) {
                            setIsViewingStory(false); // Close stories when we reach the end
                        }
                        return nextStory;
                    });
                }
            }, 50);
        }

        return () => clearInterval(timer);
    }, [progress, initialStories.length, isViewingStory]);

    const handleStoryClick = (index: number) => {
        setActiveStory(index);
        setProgress(0);
        setIsViewingStory(true);
    };

    const handlePrevious = () => {
        setActiveStory(prev => (prev - 1 + initialStories.length) % initialStories.length);
        setProgress(0);
    };

    const handleNext = () => {
        setActiveStory(prev => (prev + 1) % initialStories.length);
        setProgress(0);
    };

    const handleClose = () => {
        setIsViewingStory(false);
        setProgress(0);
    };

    // Handle keyboard events for navigation and closing
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isViewingStory) return;

            switch (event.key) {
                case 'ArrowLeft':
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'Escape':
                    handleClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isViewingStory]);

    return (
        <>
            {/* Stories row */}
            <div className="w-full max-w-screen-xl mx-auto py-4 dark:bg-transparent transition-colors duration-200">
                <div className="flex gap-3 mb-6 py-3 overflow-x-auto pb-2">
                    <div className="flex-shrink-0 p-1" >
                        <div className="relative w-16 h-16  rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-0.5 cursor-pointer transform transition-transform hover:scale-105">
                            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5">
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <PlusCircle className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-center mt-1 dark:text-gray-300">Your story</p>
                    </div>

                    {initialStories.map((story, index) => (
                        <div key={story.id} className="flex-shrink-0 p-1" onClick={() => handleStoryClick(index)}>
                            <div className={`relative w-16 h-16 rounded-full p-0.5 cursor-pointer transform transition-transform hover:scale-105 ${index === activeStory && isViewingStory ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5">
                                    <img
                                        src={story.avatar}
                                        alt={story.user}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-center mt-1 dark:text-gray-300">{story.user}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Story View */}
            {isViewingStory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300">
                    <div className="relative w-full max-w-2xl h-[80vh] mx-4">
                        {/* Progress bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600 z-10">
                            <div
                                className="h-full bg-white transition-all duration-50 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Story content */}
                        <div className="relative h-full rounded-3xl overflow-hidden">
                            <img
                                src={initialStories[activeStory].image}
                                alt={initialStories[activeStory].user}
                                className="w-full h-full object-cover"
                            />

                            {/* User info */}
                            <div className="absolute top-4 left-4 flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                    <img
                                        src={initialStories[activeStory].avatar}
                                        alt={initialStories[activeStory].user}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{initialStories[activeStory].user}</p>
                                    <p className="text-gray-300 text-xs">{initialStories[activeStory].timestamp}</p>
                                </div>
                            </div>

                            {/* Navigation buttons */}
                            <button
                                onClick={handlePrevious}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <button
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StoriesComponent;