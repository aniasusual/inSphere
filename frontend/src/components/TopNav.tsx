import { Drawer } from "./Drawer";
import logo from "@assets/hyperlocalNobg.png"
import { checkLocationPermission } from "@lib/utils";

import { IconMoon, IconBrightnessDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
// import { Toaster, toaster } from "@components/ui/toaster"



export function TopNav() {

    const [darkMode, setdarkmode] = useState(() => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; s
    });

    // Toggle the 'dark' class on the root HTML element
    useEffect(() => {
        const root = document.documentElement; // `html` element
        if (darkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        checkLocationPermission();
    }, [])

    return (
        <nav className="flex justify-between items-center w-full px-4 py-2 mx-auto bg-white dark:bg-black rounded-md lg:px-8">
            {/* <div className="container flex flex-wrap items-center text-slate-800"> */}
            {/* <Toaster /> */}
            <a href="/" className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold">
                <img src={logo} alt="hyperlocal" className=" max-w-14" />
            </a>

            <div className="flex flex-row justify-center items-center">

                {/* <Switch className="mr-5">Location</Switch> */}
                <button className="text-sm font-small relative dark:border-white/[0.2] text-black dark:text-white px-2 py-2 mx-8 rounded-full">
                    <span>{darkMode ? (<IconBrightnessDown onClick={() => setdarkmode(false)} />) : (<IconMoon onClick={() => setdarkmode(true)} />)}</span>
                    <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
                </button>
            </div>
            <Drawer />
            {/* </div> */}
        </nav>
    )
}