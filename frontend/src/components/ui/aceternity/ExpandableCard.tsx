"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@hooks/use-outside-click";

// Define the shape of a Jam object
interface Jam {
    _id: string;
    name: string;
    creator: { username: string };
    displayImage: { url: string };
    description: string;
}

// Define the shape of a Card object
interface Card {
    title: string;
    description: string;
    src: string;
    ctaText: string;
    ctaLink: string;
    content: () => JSX.Element;
}

// Props interface
interface ExpandableCardProps {
    listView: boolean;
    jams: Jam[] | null; // Allow null to handle loading states
}

export function ExpandableCard({ listView, jams }: ExpandableCardProps) {
    const [active, setActive] = useState<Card | null>(null);
    const id = useId();
    const ref = useRef<HTMLDivElement>(null);

    console.log("jams in expandable: ", jams);

    // Guard against invalid jams prop
    const cards: Card[] = jams?.map((jam) => ({
        description: `Creator: ${jam.creator.username}`,
        title: jam.name,
        src: jam.displayImage.url,
        ctaText: "Join",
        ctaLink: `/join/jam/${jam._id}`,
        content: () => <p>{jam.description}</p>,
    })) || [];

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null);
            }
        }

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "auto"; // Reset on unmount
        };
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    // Enhanced animation variants
    const cardAnimations = {
        hidden: {
            scale: 0.8,
            opacity: 0,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
            }
        },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
            }
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: 0.2
            }
        }
    };

    // Handle navigation to join link
    const handleJoinClick = (e: React.MouseEvent, link: string) => {
        e.stopPropagation(); // Prevent card expansion when clicking the button
        window.location.href = link; // Navigate in the same tab
    };

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm h-full w-full z-10"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active && (
                    <div className="fixed inset-0 grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.title}-${id}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex absolute top-4 right-4 lg:top-8 lg:right-8 items-center justify-center bg-white/90 dark:bg-gray-800 rounded-full h-10 w-10 shadow-lg hover:scale-110 transition-transform z-[101]"
                            onClick={() => setActive(null)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 text-gray-800 dark:text-gray-200"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M18 6l-12 12" />
                                <path d="M6 6l12 12" />
                            </svg>
                        </motion.button>

                        <motion.div
                            layoutId={`card-${active.title}-${id}`}
                            ref={ref}
                            variants={cardAnimations}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-[550px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
                        >
                            <motion.div layoutId={`image-${active.title}-${id}`} className="relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/50"></div>
                                <img
                                    width={200}
                                    height={200}
                                    src={active.src}
                                    alt={active.title}
                                    className="w-full h-80 lg:h-96 object-cover object-center"
                                />
                            </motion.div>

                            <div>
                                <div className="flex justify-between items-start p-6">
                                    <div>
                                        <motion.h3
                                            layoutId={`title-${active.title}-${id}`}
                                            className="font-bold text-lg md:text-xl text-gray-800 dark:text-gray-100"
                                        >
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.description}-${id}`}
                                            className="text-gray-600 dark:text-gray-400 text-base mt-1"
                                        >
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ delay: 0.1 }}
                                        onClick={(e) => handleJoinClick(e, active.ctaLink)}
                                        className="px-5 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        {active.ctaText}
                                    </motion.button>
                                </div>

                                <div className="pt-2 relative px-6 pb-6">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-gray-700 dark:text-gray-300 text-sm md:text-base h-40 md:h-fit max-h-60 pb-10 flex flex-col items-start gap-4 overflow-auto [mask:linear-gradient(to_bottom,white_85%,transparent_100%)] dark:[mask:linear-gradient(to_bottom,#1f2937_85%,transparent_100%)] [scrollbar-width:thin] [scrollbar-color:#e5e7eb_transparent] dark:[scrollbar-color:#374151_transparent]"
                                    >
                                        {active.content()}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="w-full flex justify-center items-center py-4">
                {listView ? (
                    <ul
                        className="max-w-6xl mx-auto w-full grid gap-4 place-items-center"
                        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
                    >
                        {cards.map((card) => (
                            <motion.div
                                layoutId={`card-${card.title}-${id}`}
                                key={`${card.title}-${id}`}
                                onClick={() => setActive(card)}
                                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                                className="group p-0 flex flex-col bg-white dark:bg-gray-900 rounded-2xl cursor-pointer overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
                                style={{ maxWidth: "280px", width: "100%" }}
                            >
                                <div className="flex gap-4 flex-col w-full justify-center items-center">
                                    <motion.div layoutId={`image-${card.title}-${id}`} className="w-full relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                                        <img
                                            width={100}
                                            height={100}
                                            src={card.src}
                                            alt={card.title}
                                            className="h-64 w-full object-cover object-center"
                                        />
                                    </motion.div>

                                    <div className="flex justify-center items-center flex-col p-4 pt-2 w-full">
                                        <motion.h3
                                            layoutId={`title-${card.title}-${id}`}
                                            className="font-bold text-gray-800 dark:text-gray-100 text-center text-lg line-clamp-1"
                                        >
                                            {card.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${card.description}-${id}`}
                                            className="text-gray-600 dark:text-gray-400 text-center text-sm mt-1 line-clamp-1"
                                        >
                                            {card.description}
                                        </motion.p>

                                        <div className="mt-3 w-full flex justify-center items-center">
                                            <button
                                                onClick={(e) => handleJoinClick(e, card.ctaLink)}
                                                className="px-4 py-2 text-sm rounded-full font-medium bg-green-500 hover:bg-green-600 text-white transition-colors duration-300"
                                            >
                                                {card.ctaText}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </ul>
                ) : (
                    <ul className="max-w-3xl mx-auto w-full space-y-3">
                        {cards.map((card) => (
                            <motion.div
                                layoutId={`card-${card.title}-${id}`}
                                key={`${card.title}-${id}`}
                                onClick={() => setActive(card)}
                                whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400 } }}
                                className="p-3 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-800"
                            >
                                <div className="flex gap-4 flex-col md:flex-row items-center md:items-start">
                                    <motion.div layoutId={`image-${card.title}-${id}`} className="relative">
                                        <img
                                            width={100}
                                            height={100}
                                            src={card.src}
                                            alt={card.title}
                                            className="h-36 w-36 md:h-16 md:w-16 rounded-lg object-cover object-center shadow-sm"
                                        />
                                    </motion.div>

                                    <div className="flex flex-col justify-center md:justify-start">
                                        <motion.h3
                                            layoutId={`title-${card.title}-${id}`}
                                            className="font-bold text-gray-800 dark:text-gray-100 text-center md:text-left line-clamp-1"
                                        >
                                            {card.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${card.description}-${id}`}
                                            className="text-gray-600 dark:text-gray-400 text-center md:text-left text-sm mt-1"
                                        >
                                            {card.description}
                                        </motion.p>
                                    </div>
                                </div>

                                <motion.button
                                    layoutId={`button-${card.title}-${id}`}
                                    onClick={(e) => handleJoinClick(e, card.ctaLink)}
                                    className="px-4 py-2 text-sm rounded-full font-medium bg-gray-100 dark:bg-gray-800 hover:bg-green-500 hover:text-white dark:hover:bg-green-600 text-gray-800 dark:text-gray-200 mt-4 md:mt-0 transition-colors duration-300"
                                >
                                    {card.ctaText}
                                </motion.button>
                            </motion.div>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

export const CloseIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gray-800 dark:text-gray-200"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </svg>
    );
};