"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface CarouselProps {
  images: string[];
}

export function CarouselDefault({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Variants for slide animations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
      },
    }),
  };

  return (
    <div
      className="relative overflow-hidden w-full h-96 bg-transparent" // Changed to bg-transparent
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main carousel container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-full h-full"
          >
            <motion.img
              src={images[currentIndex]}
              alt={`Slide ${currentIndex}`}
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />

            {/* Image overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="absolute top-8 left-8 bg-white/20 backdrop-blur-md p-3 rounded-full"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <motion.span
                  className="text-white font-bold text-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  {currentIndex + 1}/{images.length}
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <motion.div
        className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {images.map((_, index) => (
          <motion.button
            key={`dot-${index}`}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => handleDotClick(index)}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            animate={
              currentIndex === index
                ? {
                    scale: [1, 1.2, 1],
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }
                : {}
            }
          />
        ))}
      </motion.div>

      {/* Arrow Controls */}
      <motion.div
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : -20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={handlePrev}
          className="bg-black/30 backdrop-blur-md text-white p-2 rounded-full"
          whileHover={{
            scale: 1.2,
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <IconChevronLeft size={24} />
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : 20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={handleNext}
          className="bg-black/30 backdrop-blur-md text-white p-2 rounded-full"
          whileHover={{
            scale: 1.2,
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <IconChevronRight size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
}
