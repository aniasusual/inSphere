// import React, { useState, useEffect, useRef } from 'react';
// import { ChevronLeft, ChevronRight, PlusCircle, X } from 'lucide-react';

// interface StoryItem {
//     id: number;
//     image: string;
//     timestamp: string;
// }

// interface Story {
//     id: number;
//     user: string;
//     avatar: string;
//     stories: StoryItem[];
// }

// interface StoriesComponentProps {
//     initialStories?: Story[];
// }

// const StoriesComponent: React.FC<StoriesComponentProps> = ({
//     initialStories = [
//         {
//             id: 1,
//             user: "alex.wav",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 101, image: "/api/placeholder/400/600", timestamp: "2h" },
//                 { id: 102, image: "/api/placeholder/400/600", timestamp: "1h" }
//             ]
//         },
//         {
//             id: 2,
//             user: "lily.jpeg",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 201, image: "/api/placeholder/400/600", timestamp: "3h" }
//             ]
//         },
//         {
//             id: 3,
//             user: "sam.png",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 301, image: "/api/placeholder/400/600", timestamp: "4h" },
//                 { id: 302, image: "/api/placeholder/400/600", timestamp: "3h" },
//                 { id: 303, image: "/api/placeholder/400/600", timestamp: "2h" }
//             ]
//         },
//         {
//             id: 4,
//             user: "kai_22",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 401, image: "/api/placeholder/400/600", timestamp: "5h" }
//             ]
//         },
//         {
//             id: 5,
//             user: "emma.j",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 501, image: "/api/placeholder/400/600", timestamp: "2h" }
//             ]
//         },
//         {
//             id: 6,
//             user: "jordan_b",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 601, image: "/api/placeholder/400/600", timestamp: "6h" },
//                 { id: 602, image: "/api/placeholder/400/600", timestamp: "5h" }
//             ]
//         },
//         {
//             id: 7,
//             user: "mia_ch",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 701, image: "/api/placeholder/400/600", timestamp: "1h" }
//             ]
//         },
//         {
//             id: 8,
//             user: "david.p",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 801, image: "/api/placeholder/400/600", timestamp: "7h" }
//             ]
//         },
//         {
//             id: 9,
//             user: "sophia",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 901, image: "/api/placeholder/400/600", timestamp: "3h" }
//             ]
//         },
//         {
//             id: 10,
//             user: "jake_m",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 1001, image: "/api/placeholder/400/600", timestamp: "4h" }
//             ]
//         },
//         {
//             id: 11,
//             user: "noah.r",
//             avatar: "/api/placeholder/150/150",
//             stories: [
//                 { id: 1101, image: "/api/placeholder/400/600", timestamp: "2h" }
//             ]
//         },
//     ]
// }) => {
//     const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
//     const [activeStoryItemIndex, setActiveStoryItemIndex] = useState<number>(0);
//     const [progress, setProgress] = useState<number>(0);
//     const [isViewingStory, setIsViewingStory] = useState<boolean>(false);
//     const storiesContainerRef = useRef<HTMLDivElement>(null);
//     const [containerWidth, setContainerWidth] = useState<number>(0);
//     const [storyIndicators, setStoryIndicators] = useState<Array<number>>([]);

//     // Track container width for responsive design
//     useEffect(() => {
//         const updateWidth = () => {
//             if (storiesContainerRef.current) {
//                 setContainerWidth(storiesContainerRef.current.offsetWidth);
//             }
//         };

//         updateWidth();
//         window.addEventListener('resize', updateWidth);
//         return () => window.removeEventListener('resize', updateWidth);
//     }, []);

//     // Set up story indicators when active story changes
//     useEffect(() => {
//         if (isViewingStory && initialStories[activeStoryIndex]) {
//             setStoryIndicators(
//                 Array.from({ length: initialStories[activeStoryIndex].stories.length }, 
//                 (_, i) => i === activeStoryItemIndex ? progress : i < activeStoryItemIndex ? 100 : 0)
//             );
//         }
//     }, [activeStoryIndex, activeStoryItemIndex, progress, isViewingStory, initialStories]);

//     // Progress timer for stories
//     useEffect(() => {
//         let timer: NodeJS.Timeout;

//         if (isViewingStory) {
//             timer = setInterval(() => {
//                 if (progress < 100) {
//                     setProgress(prev => prev + 1);
//                 } else {
//                     // Move to the next story item
//                     setProgress(0);
                    
//                     const currentStory = initialStories[activeStoryIndex];
                    
//                     // If we have more story items for this user
//                     if (activeStoryItemIndex < currentStory.stories.length - 1) {
//                         setActiveStoryItemIndex(prev => prev + 1);
//                     } else {
//                         // Move to the next user's stories
//                         setActiveStoryItemIndex(0);
//                         setActiveStoryIndex(prev => {
//                             const nextIndex = (prev + 1) % initialStories.length;
//                             if (nextIndex === 0) {
//                                 setIsViewingStory(false); // Close stories when we reach the end
//                             }
//                             return nextIndex;
//                         });
//                     }
//                 }
//             }, 50);
//         }

//         return () => clearInterval(timer);
//     }, [progress, activeStoryIndex, activeStoryItemIndex, initialStories.length, isViewingStory]);

//     const handleStoryClick = (index: number) => {
//         setActiveStoryIndex(index);
//         setActiveStoryItemIndex(0);
//         setProgress(0);
//         setIsViewingStory(true);
//     };

//     const handlePrevious = () => {
//         setProgress(0);
        
//         // If we're not at the first story item of this user
//         if (activeStoryItemIndex > 0) {
//             setActiveStoryItemIndex(prev => prev - 1);
//         } else {
//             // Go to previous user's last story
//             setActiveStoryIndex(prev => {
//                 const prevIndex = (prev - 1 + initialStories.length) % initialStories.length;
//                 setActiveStoryItemIndex(initialStories[prevIndex].stories.length - 1);
//                 return prevIndex;
//             });
//         }
//     };

//     const handleNext = () => {
//         setProgress(0);
//         const currentStory = initialStories[activeStoryIndex];
        
//         // If we have more story items for this user
//         if (activeStoryItemIndex < currentStory.stories.length - 1) {
//             setActiveStoryItemIndex(prev => prev + 1);
//         } else {
//             // Move to the next user's stories
//             setActiveStoryItemIndex(0);
//             setActiveStoryIndex(prev => (prev + 1) % initialStories.length);
//         }
//     };

//     const handleClose = () => {
//         setIsViewingStory(false);
//         setProgress(0);
//     };

//     // Jump to a specific story item within the current user's stories
//     const handleStoryIndicatorClick = (index: number) => {
//         setActiveStoryItemIndex(index);
//         setProgress(0);
//     };

//     // Scroll to active story
//     useEffect(() => {
//         if (isViewingStory && storiesContainerRef.current) {
//             const container = storiesContainerRef.current;
//             const activeStoryElement = container.children[activeStoryIndex + 1]; // +1 for the "Your story" element
            
//             if (activeStoryElement) {
//                 const scrollPosition = activeStoryElement.getBoundingClientRect().left + 
//                     container.scrollLeft - container.getBoundingClientRect().left - 
//                     (containerWidth / 2) + (activeStoryElement.getBoundingClientRect().width / 2);
                
//                 container.scrollTo({
//                     left: scrollPosition,
//                     behavior: 'smooth'
//                 });
//             }
//         }
//     }, [activeStoryIndex, isViewingStory, containerWidth]);

//     // Handle keyboard events for navigation and closing
//     useEffect(() => {
//         const handleKeyDown = (event: KeyboardEvent) => {
//             if (!isViewingStory) return;

//             switch (event.key) {
//                 case 'ArrowLeft':
//                     handlePrevious();
//                     break;
//                 case 'ArrowRight':
//                     handleNext();
//                     break;
//                 case 'Escape':
//                     handleClose();
//                     break;
//             }
//         };

//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [isViewingStory, activeStoryIndex, activeStoryItemIndex]);

//     // Determine story size based on container width for responsive design
//     const getStorySize = () => {
//         if (containerWidth < 640) return 'w-14 h-14'; // Small screens
//         if (containerWidth < 768) return 'w-16 h-16'; // Medium screens
//         return 'w-20 h-20'; // Large screens
//     };

//     const storySize = getStorySize();
//     const storyTextSize = storySize === 'w-14 h-14' ? 'text-xs' : 'text-sm';

//     // Get the current story item being displayed
//     const getCurrentStoryItem = () => {
//         if (!initialStories[activeStoryIndex]) return null;
//         return initialStories[activeStoryIndex].stories[activeStoryItemIndex];
//     };

//     const currentStoryItem = getCurrentStoryItem();

//     return (
//         <>
//             {/* Stories row */}
//             <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto py-2 sm:py-4 px-2 sm:px-4 transition-colors duration-200">
//                 <div 
//                     ref={storiesContainerRef}
//                     className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 py-2 sm:py-3 overflow-x-auto pb-2 no-scrollbar"
//                 >
//                     <div className="flex-shrink-0 p-1">
//                         <div className={`relative ${storySize} rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-0.5 cursor-pointer transform transition-transform hover:scale-105`}>
//                             <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5">
//                                 <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
//                                     <PlusCircle className={`${storySize === 'w-14 h-14' ? 'w-6 h-6' : storySize === 'w-16 h-16' ? 'w-8 h-8' : 'w-10 h-10'} text-gray-600 dark:text-gray-300`} />
//                                 </div>
//                             </div>
//                         </div>
//                         <p className={`${storyTextSize} text-center mt-1 text-gray-800 dark:text-gray-300`}>Your story</p>
//                     </div>

//                     {initialStories.map((story, index) => (
//                         <div key={story.id} className="flex-shrink-0 p-1" onClick={() => handleStoryClick(index)}>
//                             <div className={`relative ${storySize} rounded-full p-0.5 cursor-pointer transform transition-transform hover:scale-105 ${
//                                 index === activeStoryIndex && isViewingStory 
//                                     ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' 
//                                     : 'bg-gray-200 dark:bg-gray-700'
//                             }`}>
//                                 {/* Story count indicator */}
//                                 {story.stories.length > 1 && (
//                                     <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
//                                         {story.stories.length}
//                                     </div>
//                                 )}
                                
//                                 <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5">
//                                     <img
//                                         src={story.avatar}
//                                         alt={story.user}
//                                         className="w-full h-full rounded-full object-cover"
//                                     />
//                                 </div>
//                             </div>
//                             <p className={`${storyTextSize} text-center mt-1 text-gray-800 dark:text-gray-300 truncate max-w-16`}>
//                                 {story.user}
//                             </p>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Modal Story View - Responsive */}
//             {isViewingStory && currentStoryItem && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300">
//                     <div className="relative w-full h-full sm:h-[85vh] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
//                         {/* Progress indicators */}
//                         <div className="absolute top-0 left-0 right-0 z-10 flex px-2 sm:px-4 pt-2 gap-1">
//                             {storyIndicators.map((value, idx) => (
//                                 <div 
//                                     key={idx} 
//                                     className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden cursor-pointer"
//                                     onClick={() => handleStoryIndicatorClick(idx)}
//                                 >
//                                     <div
//                                         className="h-full bg-white transition-all duration-50 ease-linear"
//                                         style={{ width: `${value}%` }}
//                                     />
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Close button */}
//                         <button
//                             onClick={handleClose}
//                             className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
//                         >
//                             <X className="w-4 h-4 sm:w-5 sm:h-5" />
//                         </button>

//                         {/* Story content */}
//                         <div className="relative h-full rounded-none sm:rounded-3xl overflow-hidden">
//                             <img
//                                 src={currentStoryItem.image}
//                                 alt={initialStories[activeStoryIndex].user}
//                                 className="w-full h-full object-cover object-center"
//                             />

//                             {/* User info */}
//                             <div className="absolute top-6 sm:top-8 left-2 sm:left-4 flex items-center space-x-2">
//                                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-white">
//                                     <img
//                                         src={initialStories[activeStoryIndex].avatar}
//                                         alt={initialStories[activeStoryIndex].user}
//                                         className="w-full h-full object-cover"
//                                     />
//                                 </div>
//                                 <div>
//                                     <p className="text-white font-semibold text-xs sm:text-sm">
//                                         {initialStories[activeStoryIndex].user}
//                                     </p>
//                                     <p className="text-gray-300 text-xs">
//                                         {currentStoryItem.timestamp}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Story count indicator */}
//                             <div className="absolute top-6 sm:top-8 right-10 sm:right-16 bg-black/40 text-white text-xs rounded-full py-1 px-2 backdrop-blur-sm">
//                                 {activeStoryItemIndex + 1}/{initialStories[activeStoryIndex].stories.length}
//                             </div>

//                             {/* Navigation buttons - scaled for different devices */}
//                             <button
//                                 onClick={handlePrevious}
//                                 className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
//                             >
//                                 <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
//                             </button>

//                             <button
//                                 onClick={handleNext}
//                                 className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
//                             >
//                                 <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// // Add this CSS to your global stylesheet to hide scrollbars while preserving functionality
// // .no-scrollbar::-webkit-scrollbar {
// //     display: none;
// // }
// // .no-scrollbar {
// //     -ms-overflow-style: none;
// //     scrollbar-width: none;
// // }

// export default StoriesComponent;









import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, X } from 'lucide-react';
import CreateStoryComponent from './CreateStory';

interface StoryItem {
    id: number;
    image: string;
    timestamp: string;
}

interface Story {
    id: number;
    user: string;
    avatar: string;
    stories: StoryItem[];
}

interface StoriesComponentProps {
    initialStories?: Story[];
    currentUser?: {
        username: string;
        avatar: string;
    };
}

const StoriesComponent: React.FC<StoriesComponentProps> = ({
    initialStories = [
        {
            id: 1,
            user: "alex.wav",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 101, image: "/api/placeholder/400/600", timestamp: "2h" },
                { id: 102, image: "/api/placeholder/400/600", timestamp: "1h" }
            ]
        },
        {
            id: 2,
            user: "lily.jpeg",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 201, image: "/api/placeholder/400/600", timestamp: "3h" }
            ]
        },
        {
            id: 3,
            user: "sam.png",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 301, image: "/api/placeholder/400/600", timestamp: "4h" },
                { id: 302, image: "/api/placeholder/400/600", timestamp: "3h" },
                { id: 303, image: "/api/placeholder/400/600", timestamp: "2h" }
            ]
        },
        {
            id: 4,
            user: "kai_22",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 401, image: "/api/placeholder/400/600", timestamp: "5h" }
            ]
        },
        {
            id: 5,
            user: "emma.j",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 501, image: "/api/placeholder/400/600", timestamp: "2h" }
            ]
        },
        {
            id: 6,
            user: "jordan_b",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 601, image: "/api/placeholder/400/600", timestamp: "6h" },
                { id: 602, image: "/api/placeholder/400/600", timestamp: "5h" }
            ]
        },
        {
            id: 7,
            user: "mia_ch",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 701, image: "/api/placeholder/400/600", timestamp: "1h" }
            ]
        },
        {
            id: 8,
            user: "david.p",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 801, image: "/api/placeholder/400/600", timestamp: "7h" }
            ]
        },
        {
            id: 9,
            user: "sophia",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 901, image: "/api/placeholder/400/600", timestamp: "3h" }
            ]
        },
        {
            id: 10,
            user: "jake_m",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 1001, image: "/api/placeholder/400/600", timestamp: "4h" }
            ]
        },
        {
            id: 11,
            user: "noah.r",
            avatar: "/api/placeholder/150/150",
            stories: [
                { id: 1101, image: "/api/placeholder/400/600", timestamp: "2h" }
            ]
        },
    ],
    currentUser = {
        username: "you",
        avatar: "/api/placeholder/150/150"
    }
}) => {
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
    const [activeStoryItemIndex, setActiveStoryItemIndex] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [isViewingStory, setIsViewingStory] = useState<boolean>(false);
    const [isCreatingStory, setIsCreatingStory] = useState<boolean>(false);
    const storiesContainerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [storyIndicators, setStoryIndicators] = useState<Array<number>>([]);
    
    // My stories (current user)
    const [myStories, setMyStories] = useState<StoryItem[]>([]);

    // Track container width for responsive design
    useEffect(() => {
        const updateWidth = () => {
            if (storiesContainerRef.current) {
                setContainerWidth(storiesContainerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Set up story indicators when active story changes
    useEffect(() => {
        if (isViewingStory) {
            if (activeStoryIndex === -1 && myStories.length > 0) {
                // Viewing my stories
                setStoryIndicators(
                    Array.from({ length: myStories.length }, 
                    (_, i) => i === activeStoryItemIndex ? progress : i < activeStoryItemIndex ? 100 : 0)
                );
            } else if (stories[activeStoryIndex]) {
                // Viewing other user stories
                setStoryIndicators(
                    Array.from({ length: stories[activeStoryIndex].stories.length }, 
                    (_, i) => i === activeStoryItemIndex ? progress : i < activeStoryItemIndex ? 100 : 0)
                );
            }
        }
    }, [activeStoryIndex, activeStoryItemIndex, progress, isViewingStory, stories, myStories]);

    // Progress timer for stories
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isViewingStory) {
            timer = setInterval(() => {
                if (progress < 100) {
                    setProgress(prev => prev + 1);
                } else {
                    // Move to the next story item
                    setProgress(0);
                    
                    if (activeStoryIndex === -1) {
                        // Handling my stories
                        if (activeStoryItemIndex < myStories.length - 1) {
                            setActiveStoryItemIndex(prev => prev + 1);
                        } else {
                            // Move to the first user's stories
                            setActiveStoryItemIndex(0);
                            setActiveStoryIndex(0);
                        }
                    } else {
                        // Handling other users' stories
                        const currentStory = stories[activeStoryIndex];
                        
                        // If we have more story items for this user
                        if (activeStoryItemIndex < currentStory.stories.length - 1) {
                            setActiveStoryItemIndex(prev => prev + 1);
                        } else {
                            // Move to the next user's stories
                            setActiveStoryItemIndex(0);
                            setActiveStoryIndex(prev => {
                                const nextIndex = (prev + 1) % stories.length;
                                if (nextIndex === 0 && myStories.length === 0) {
                                    setIsViewingStory(false); // Close stories when we reach the end and no my stories
                                }
                                return nextIndex;
                            });
                        }
                    }
                }
            }, 50);
        }

        return () => clearInterval(timer);
    }, [progress, activeStoryIndex, activeStoryItemIndex, stories.length, myStories.length, isViewingStory]);

    const handleStoryClick = (index: number) => {
        setActiveStoryIndex(index);
        setActiveStoryItemIndex(0);
        setProgress(0);
        setIsViewingStory(true);
    };

    const handleMyStoryClick = () => {
        if (myStories.length > 0) {
            setActiveStoryIndex(-1); // Special index for my stories
            setActiveStoryItemIndex(0);
            setProgress(0);
            setIsViewingStory(true);
        } else {
            setIsCreatingStory(true);
        }
    };

    const handlePrevious = () => {
        setProgress(0);
        
        if (activeStoryIndex === -1) {
            // Handling my stories
            if (activeStoryItemIndex > 0) {
                setActiveStoryItemIndex(prev => prev - 1);
            } else {
                // Go to last user's last story
                setActiveStoryIndex(stories.length - 1);
                setActiveStoryItemIndex(stories[stories.length - 1].stories.length - 1);
            }
        } else {
            // If we're not at the first story item of this user
            if (activeStoryItemIndex > 0) {
                setActiveStoryItemIndex(prev => prev - 1);
            } else {
                // Go to previous user's last story or my stories
                if (activeStoryIndex === 0 && myStories.length > 0) {
                    // Go to my stories
                    setActiveStoryIndex(-1);
                    setActiveStoryItemIndex(myStories.length - 1);
                } else {
                    // Go to previous user
                    setActiveStoryIndex(prev => {
                        const prevIndex = (prev - 1 + stories.length) % stories.length;
                        setActiveStoryItemIndex(stories[prevIndex].stories.length - 1);
                        return prevIndex;
                    });
                }
            }
        }
    };

    const handleNext = () => {
        setProgress(0);
        
        if (activeStoryIndex === -1) {
            // Handling my stories
            if (activeStoryItemIndex < myStories.length - 1) {
                setActiveStoryItemIndex(prev => prev + 1);
            } else {
                // Move to the first user's stories
                setActiveStoryItemIndex(0);
                setActiveStoryIndex(0);
            }
        } else {
            // Handling other users' stories
            const currentStory = stories[activeStoryIndex];
            
            // If we have more story items for this user
            if (activeStoryItemIndex < currentStory.stories.length - 1) {
                setActiveStoryItemIndex(prev => prev + 1);
            } else {
                // Move to the next user's stories
                setActiveStoryItemIndex(0);
                setActiveStoryIndex(prev => (prev + 1) % stories.length);
            }
        }
    };

    const handleClose = () => {
        setIsViewingStory(false);
        setProgress(0);
    };

    // Jump to a specific story item
    const handleStoryIndicatorClick = (index: number) => {
        setActiveStoryItemIndex(index);
        setProgress(0);
    };

    // Handle new story creation
    const handleStoryCreated = (newStory: StoryItem) => {
        setMyStories(prev => [...prev, newStory]);
        setIsCreatingStory(false);
    };

    // Determine story size based on container width for responsive design
    const getStorySize = () => {
        if (containerWidth < 640) return 'w-14 h-14'; // Small screens
        if (containerWidth < 768) return 'w-16 h-16'; // Medium screens
        return 'w-20 h-20'; // Large screens
    };

    const storySize = getStorySize();
    const storyTextSize = storySize === 'w-14 h-14' ? 'text-xs' : 'text-sm';

    // Get the current story item being displayed
    const getCurrentStoryItem = () => {
        if (activeStoryIndex === -1) {
            return myStories[activeStoryItemIndex] || null;
        }
        if (!stories[activeStoryIndex]) return null;
        return stories[activeStoryIndex].stories[activeStoryItemIndex];
    };

    const currentStoryItem = getCurrentStoryItem();
    
    // Get the current user info
    const getCurrentUserInfo = () => {
        if (activeStoryIndex === -1) {
            return {
                user: currentUser.username,
                avatar: currentUser.avatar
            };
        }
        return {
            user: stories[activeStoryIndex].user,
            avatar: stories[activeStoryIndex].avatar
        };
    };

    // Get current stories count
    const getCurrentStoriesCount = () => {
        if (activeStoryIndex === -1) {
            return myStories.length;
        }
        if (!stories[activeStoryIndex]) return 0;
        return stories[activeStoryIndex].stories.length;
    };

    return (
        <>
            {/* Stories row */}
            <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto py-2 sm:py-4 px-2 sm:px-4 transition-colors duration-200">
                <div 
                    ref={storiesContainerRef}
                    className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 py-2 sm:py-3 overflow-x-auto pb-2 no-scrollbar"
                >
                    {/* My story */}
                    <div className="flex-shrink-0 p-1" onClick={handleMyStoryClick}>
                        <div className={`relative ${storySize} rounded-full p-0.5 cursor-pointer transform transition-transform hover:scale-105 ${
                            myStories.length > 0 
                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' 
                                : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                            {/* Story count indicator */}
                            {myStories.length > 1 && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                    {myStories.length}
                                </div>
                            )}
                            
                            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5">
                                {myStories.length > 0 ? (
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.username}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <PlusCircle className={`${storySize === 'w-14 h-14' ? 'w-6 h-6' : storySize === 'w-16 h-16' ? 'w-8 h-8' : 'w-10 h-10'} text-gray-600 dark:text-gray-300`} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className={`${storyTextSize} text-center mt-1 text-gray-800 dark:text-gray-300`}>
                            {myStories.length > 0 ? "Your story" : "Create"}
                        </p>
                    </div>

                    {stories.map((story, index) => (
                        <div key={story.id} className="flex-shrink-0 p-1" onClick={() => handleStoryClick(index)}>
                            <div className={`relative ${storySize} rounded-full p-0.5 cursor-pointer transform transition-transform hover:scale-105 ${
                                index === activeStoryIndex && isViewingStory 
                                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' 
                                    : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                                {/* Story count indicator */}
                                {story.stories.length > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                        {story.stories.length}
                                    </div>
                                )}
                                
                                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5">
                                    <img
                                        src={story.avatar}
                                        alt={story.user}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <p className={`${storyTextSize} text-center mt-1 text-gray-800 dark:text-gray-300 truncate max-w-16`}>
                                {story.user}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Story View - Responsive */}
            {isViewingStory && currentStoryItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300">
                    <div className="relative w-full h-full sm:h-[85vh] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
                        {/* Progress indicators */}
                        <div className="absolute top-0 left-0 right-0 z-10 flex px-2 sm:px-4 pt-2 gap-1">
                            {storyIndicators.map((value, idx) => (
                                <div 
                                    key={idx} 
                                    className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden cursor-pointer"
                                    onClick={() => handleStoryIndicatorClick(idx)}
                                >
                                    <div
                                        className="h-full bg-white transition-all duration-50 ease-linear"
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Story content */}
                        <div className="relative h-full rounded-none sm:rounded-3xl overflow-hidden">
                            <img
                                src={currentStoryItem.image}
                                alt={getCurrentUserInfo().user}
                                className="w-full h-full object-cover object-center"
                            />

                            {/* User info */}
                            <div className="absolute top-6 sm:top-8 left-2 sm:left-4 flex items-center space-x-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-white">
                                    <img
                                        src={getCurrentUserInfo().avatar}
                                        alt={getCurrentUserInfo().user}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-xs sm:text-sm">
                                        {getCurrentUserInfo().user}
                                    </p>
                                    <p className="text-gray-300 text-xs">
                                        {currentStoryItem.timestamp}
                                    </p>
                                </div>
                            </div>

                            {/* Story count indicator */}
                            <div className="absolute top-6 sm:top-8 right-10 sm:right-16 bg-black/40 text-white text-xs rounded-full py-1 px-2 backdrop-blur-sm">
                                {activeStoryItemIndex + 1}/{getCurrentStoriesCount()}
                            </div>

                            {/* Navigation buttons - scaled for different devices */}
                            <button
                                onClick={handlePrevious}
                                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            <button
                                onClick={handleNext}
                                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Story Modal */}
            {isCreatingStory && (
                <CreateStoryComponent
                    onStoryCreated={handleStoryCreated}
                    onCancel={() => setIsCreatingStory(false)}
                />
            )}
        </>
    );
};

export default StoriesComponent;
