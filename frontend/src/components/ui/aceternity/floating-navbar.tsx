"use client";
import { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@lib/utils";
import { Link } from "react-router-dom";

import { IconHome } from "@tabler/icons-react";
import logo from "@assets/hyperlocalNobg.png"
import { LuRadar } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { Avatar } from "@material-tailwind/react";




export const FloatingNav = ({
    // navItems
    className,
}: {
    // navItems: {
    //     name: string;
    //     link: string;
    //     icon?: JSX.Element;
    // }[];
    className?: string;
}) => {
    const { scrollYProgress } = useScroll();

    const [visible, setVisible] = useState(false);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            let direction = current! - scrollYProgress.getPrevious()!;

            if (scrollYProgress.get() < 0.05) {
                setVisible(false);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    const navItems = [
        {
            name: "My feed",
            link: "/",
            icon: <IconHome size={27} />,
        },
        {
            name: "Go Local",
            link: "/go-local",
            icon: (
                <LuRadar size={27} />
            ),
        },
        {
            name: "Search",
            link: "/search",
            icon: <CiSearch size={27} />,
        },
    ];


    const { isAuthenticated, user } = useSelector((state: RootState) => state.user);




    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit  fixed bottom-1 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-20 pr-2 pl-8 py-2  items-center justify-center space-x-4",
                    {
                        "pointer-events-none": !visible, // Add pointer-events: none when hidden
                    },
                    className
                )}
            >
                <a href="/" className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold">
                    <img src={logo} alt="hyperlocal" className=" max-w-8" />
                </a>

                {navItems.map((navItem: any, idx: number) => (
                    <Link
                        key={`link=${idx}`}
                        to={navItem.link}
                        className={cn(
                            "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500"
                        )}
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block text-sm">{navItem.name}</span>
                    </Link>
                ))}
                {isAuthenticated ? (
                    <div className="">
                        <Avatar src="https://docs.material-tailwind.com/img/face-2.jpg" alt="avatar" />
                    </div>
                ) : (

                    <div>
                        <button className="border font-medium sm: text-xs relative border-black dark:border-white/[0.2] text-black dark:text-white px-2 py-2 rounded-full !mx-2">
                            <Link to={"/login"}><span>Login</span></Link>
                            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
                        </button>
                        <button className="border font-medium sm: text-xs relative border-black dark:border-white/[0.2] text-black dark:text-white px-2 py-2 rounded-full !mx-0">
                            <Link to={"/register"}><span>Register</span></Link>
                            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
                        </button>
                    </div>
                )}

            </motion.div>
        </AnimatePresence>
    );
};
