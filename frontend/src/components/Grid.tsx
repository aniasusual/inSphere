// import React from "react";

// const BentoGrid = () => {

//     const images = [
//         { url: "https://images.pexels.com/photos/2564841/pexels-photo-2564841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/951408/pexels-photo-951408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/3049394/pexels-photo-3049394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/3450887/pexels-photo-3450887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/3049394/pexels-photo-3049394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/3450887/pexels-photo-3450887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
//         { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },

//     ];


//     const structuredImages = images.map((image, index) => ({
//         ...image,
//         gridClass:
//             index % 6 === 0
//                 ? "col-span-2 row-span-2"
//                 : index % 6 === 1
//                     ? "col-span-1 row-span-1"
//                     : index % 6 === 2
//                         ? "col-span-1 row-span-1"
//                         : index % 6 === 3
//                             ? "col-span-1 row-span-1"
//                             : index % 6 === 4
//                                 ? "col-span-2 row-span-2"
//                                 : index % 6 === 5
//                                     ? "col-span-1 row-span-1"
//                                     : "col-span-1 row-span-2"
//     }));


//     return (
//         <div className="grid grid-cols-3 grid-rows-2 gap-1 sm:gap-1 lg:gap-2 p-2 lg:max-w-lg mx-auto">
//             {structuredImages.map((image, index) => (
//                 <div
//                     key={index}
//                     className={`relative overflow-hidden rounded-lg shadow-lg ${image.gridClass}`}
//                 >
//                     <img
//                         src={image.url}
//                         alt={`Image ${index}`}
//                         className="w-full h-full object-cover hover:scale-105 aspect-square transition-transform duration-300 ease-in-out"
//                     />
//                 </div>
//             ))}
//         </div>
//     );

// };

// export default BentoGrid;


import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Post = ({ image, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <button
                    className="absolute top-4 right-4 text-black bg-gray-100 p-2 rounded-full shadow-md hover:bg-gray-200"
                    onClick={onClose}
                >
                    &times;
                </button>
                <img src={image.url} alt="Selected" className="w-full h-64 object-cover" />
                <div className="p-4">
                    <h2 className="text-xl font-semibold">Post Title</h2>
                    <p className="text-gray-600 mt-2">
                        This is a placeholder for the post content. You can add more creative details here, like captions or comments.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const BentoGrid = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
        { url: "https://images.pexels.com/photos/2564841/pexels-photo-2564841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/951408/pexels-photo-951408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/3049394/pexels-photo-3049394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/3450887/pexels-photo-3450887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    ];

    const structuredImages = images.map((image, index) => ({
        ...image,
        gridClass:
            index % 6 === 0
                ? "col-span-2 row-span-2"
                : "col-span-1 row-span-1",
    }));

    return (
        <div className="relative">
            <div className="grid grid-cols-3 grid-rows-2 gap-1 sm:gap-1 lg:gap-2 p-2 lg:max-w-lg mx-auto">
                {structuredImages.map((image, index) => (
                    <motion.div
                        key={index}
                        className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer ${image.gridClass}`}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedImage(image)}
                    >
                        <img
                            src={image.url}
                            alt={`Image ${index}`}
                            className="w-full h-full object-cover aspect-square"
                        />
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <Post image={selectedImage} onClose={() => setSelectedImage(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BentoGrid;
