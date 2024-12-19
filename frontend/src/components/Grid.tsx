import React from "react";

const BentoGrid = () => {

    const images = [
        { url: "https://images.pexels.com/photos/2564841/pexels-photo-2564841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/951408/pexels-photo-951408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/3049394/pexels-photo-3049394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/3450887/pexels-photo-3450887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/3049394/pexels-photo-3049394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/3450887/pexels-photo-3450887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { url: "https://images.pexels.com/photos/10230612/pexels-photo-10230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },

    ];


    const structuredImages = images.map((image, index) => ({
        ...image,
        gridClass:
            index % 6 === 0
                ? "col-span-2 row-span-2"
                : index % 6 === 1
                    ? "col-span-1 row-span-1"
                    : index % 6 === 2
                        ? "col-span-1 row-span-1"
                        : index % 6 === 3
                            ? "col-span-1 row-span-1"
                            : index % 6 === 4
                                ? "col-span-2 row-span-2"
                                : index % 6 === 5
                                    ? "col-span-1 row-span-1"
                                    : "col-span-1 row-span-2"
    }));


    return (
        <div className="grid grid-cols-3 grid-rows-2 gap-1 sm:gap-1 lg:gap-2 p-2 lg:max-w-lg mx-auto">
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
