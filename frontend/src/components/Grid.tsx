import React from "react";

const BentoGrid = () => {

    const images = [
        { url: "https://picsum.photos/300/300?random=1" },
        { url: "https://picsum.photos/300/400?random=2" },
        { url: "https://picsum.photos/400/300?random=3" },
        { url: "https://picsum.photos/500/300?random=4" },
        { url: "https://picsum.photos/300/500?random=5" },
        { url: "https://picsum.photos/400/500?random=6" },
        { url: "https://picsum.photos/300/300?random=7" },
        { url: "https://picsum.photos/300/300?random=7" },
        { url: "https://picsum.photos/400/300?random=8" },
    ];


    const structuredImages = images.map((image, index) => ({
        ...image,
        gridClass:
            index % 8 === 0
                ? "col-span-2 row-span-2" // Large square
                : index % 8 === 1
                    ? "col-span-1 row-span-1" // Small square
                    : index % 8 === 2
                        ? "col-span-1 row-span-1" // Small square
                        : index % 8 === 3
                            ? "col-span-1 row-span-2" // Tall rectangle
                            : index % 8 === 4
                                ? "col-span-2 row-span-1" // Wide rectangle
                                : index % 8 === 5
                                    ? "col-span-1 row-span-2" // Tall rectangle (new condition)
                                    : index % 8 === 6
                                        ? "col-span-2 row-span-2" // Extra large square (new condition)
                                        : "col-span-1 row-span-1", // Small square (default case)
    }));


    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-6 lg:gap-1 p-2 max-w-screen-md mx-auto">
            {structuredImages.map((image, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden rounded-lg shadow-lg ${image.gridClass}`}
                >
                    <img
                        src={image.url}
                        alt={`Image ${index}`}
                        className="w-full h-full object-cover hover:scale-105 aspect-square transition-transform duration-300 ease-in-out"
                    />
                </div>
            ))}
        </div>
    );

};

export default BentoGrid;
