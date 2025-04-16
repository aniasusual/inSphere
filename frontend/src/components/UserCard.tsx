import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// @material-tailwind-react
import { Card, Avatar, Typography } from "@material-tailwind/react";

import { IconLibraryPhoto, IconArrowRight } from "@tabler/icons-react";

import defaultAvatar from "@assets/defaultImage.jpg";

const imgs = [
  "https://www.material-tailwind.com/image/web3-card-1.svg",
  "https://www.material-tailwind.com/image/web3-card-2.svg",
  "https://www.material-tailwind.com/image/web3-card-3.svg",
];

interface User {
  _id: string;
  firstName?: string;
  email?: string;
  avatar?: {
    url: string;
  };
}

export function CryptoCard({ user }: { user: User }) {
  const [showImages, setShowImages] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleToggleImages = () => {
    setShowImages(!showImages);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 },
      }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <Card
        className="w-full m-0 overflow-hidden dark:bg-black border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        placeholder=""
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovering ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="p-4 w-full">
          <div className="flex justify-between items-center w-full">
            <Link
              to={`/user/${user._id}`}
              className="flex items-center gap-3 m-2 hover:opacity-90 transition-opacity"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar
                  src={user.avatar?.url || defaultAvatar}
                  alt={user.firstName || "User"}
                  className="border-2 border-blue-500 shadow-md"
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                />
              </motion.div>
              <div>
                <Typography
                  color="blue-gray"
                  variant="h6"
                  className="dark:text-white text-md font-bold flex items-center gap-1"
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  {user.firstName || "Unknown User"}
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="font-medium dark:text-gray-400 text-sm"
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  {user.email || "No email"}
                </Typography>
              </div>
            </Link>
            <div className="flex justify-center items-center gap-4 lg:gap-5 md:gap-5">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <IconLibraryPhoto
                  stroke={1.5}
                  onClick={handleToggleImages}
                  className="text-black dark:text-white hover:cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                />
              </motion.div>

              <Link to={`/user/${user._id}`}>
                <motion.div
                  whileHover={{ scale: 1.2, x: 3 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <IconArrowRight
                    stroke={1.5}
                    className="text-black dark:text-white hover:cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  />
                </motion.div>
              </Link>
            </div>
          </div>
          <AnimatePresence>
            {showImages && (
              <motion.div
                className="flex gap-2 overflow-x-auto pb-2 mt-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {imgs.map((img, key) => (
                  <motion.div
                    key={key}
                    className="relative overflow-hidden rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { delay: key * 0.1 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={img}
                      className="flex-shrink-0 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                      alt={`Collection item ${key + 1}`}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white text-xs font-medium p-2">
                        Item #{key + 1}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

export default CryptoCard;
