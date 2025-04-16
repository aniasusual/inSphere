import { Drawer } from "./Drawer";
import logo from "@assets/hyperlocalNobg.png";

import { IconMoon, IconBrightnessDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
// import { Toaster, toaster } from "@components/ui/toaster"
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/shadcn/badge";

export function TopNav() {
  const [darkMode, setdarkmode] = useState(() => {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
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

  // useEffect(() => {
  //     checkLocationPermission();
  // }, [])

  return (
    <nav className="flex justify-between items-center w-full px-4 py-2 mx-auto bg-white dark:bg-black rounded-md lg:px-8">
      {/* <div className="container flex flex-wrap items-center text-slate-800"> */}
      {/* <Toaster /> */}
      <a
        href="/"
        className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold"
      >
        <img src={logo} alt="hyperlocal" className=" max-w-14" />
      </a>

      <div className="flex flex-row justify-center items-center gap-5">
        {/* <Switch className="mr-5">Location</Switch> */}
        <button className="relative text-sm font-small text-black dark:text-white p-1 rounded-full">
          <Badge className="absolute top-0 right-0 h-5 min-w-[10px] bg-red-600 dark:bg-red-600 text-black dark:bg-white translate-x-2/3 -translate-y-2/3 shadow-md">
            3
          </Badge>
          <Link to={"/chat"}>
            <MessageCircle size={26} />
          </Link>
        </button>
        <div>
          <Drawer />
        </div>

        <button className="text-sm font-small relative dark:border-white/[0.2] text-black dark:text-white p-2 m-2 rounded-full">
          <span>
            {darkMode ? (
              <IconBrightnessDown onClick={() => setdarkmode(false)} />
            ) : (
              <IconMoon onClick={() => setdarkmode(true)} />
            )}
          </span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
        </button>
      </div>
      {/* </div> */}
    </nav>
  );
}
