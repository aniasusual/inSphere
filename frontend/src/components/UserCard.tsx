import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @material-tailwind-react
import {
    Card,
    Avatar,
    Button,
    CardBody,
    Typography,
} from "@material-tailwind/react";

import { IconLibraryPhoto, IconArrowRight } from '@tabler/icons-react';


const imgs = [
    "https://www.material-tailwind.com/image/web3-card-1.svg",
    "https://www.material-tailwind.com/image/web3-card-2.svg",
    "https://www.material-tailwind.com/image/web3-card-3.svg",
];

export function CryptoCard() {
    const [showImages, setShowImages] = useState(false);

    const handleToggleImages = () => {
        setShowImages(!showImages);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
        >
            <Card className="w-full m-0 overflow-hidden dark:bg-black ">
                <CardBody className="p-4 w-full">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3 m-2">
                            <Avatar
                                src="https://www.material-tailwind.com/img/avatar1.jpg"
                                alt="Tina Andrew"
                            />
                            <div>
                                <Typography
                                    color="blue-gray"
                                    variant="h6"
                                    className="dark:text-white text-md"
                                >
                                    Tina Andrew
                                </Typography>
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-medium dark:text-gray-400 text-sm"
                                >
                                    Creator
                                </Typography>
                            </div>
                        </div>
                        <div className="flex justify-center items-center gap-4 lg:gap-5 md:gap-5">
                            {/* <Button
                                size="sm"
                                variant="outlined"
                                className="border-gray-300 dark:border-gray-800 dark:text-gray-300 outline-none text-xs"
                                onClick={handleToggleImages}
                            >
                                {showImages ? "Hide Collection" : "See Collection"}
                            </Button> */}

                            <IconLibraryPhoto stroke={1} onClick={handleToggleImages} className="text-black dark:text-white hover:cursor-pointer" />
                            <IconArrowRight stroke={1} className="text-black dark:text-white hover:cursor-pointer" />
                            {/* <Button
                                size="sm"
                                variant="outlined"
                                className="border-gray-300 dark:border-gray-800 dark:text-gray-300 outline-none text-xs"
                            >
                                Visit
                            </Button> */}
                        </div>
                    </div>
                    <AnimatePresence>
                        {showImages && (
                            <motion.div
                                className="flex gap-2 overflow-x-auto pb-2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                {imgs.map((img, key) => (
                                    <motion.img
                                        key={key}
                                        src={img}
                                        className="flex-shrink-0 rounded-xl object-cover"
                                        alt="imgs"
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardBody>
            </Card>
        </motion.div>
    );
}

export default CryptoCard;
