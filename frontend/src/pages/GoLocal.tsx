// import { Post } from "@components/Post";
import { SegmentedControl } from "@components/ui/segmented-control";
import { IconListDetails } from "@tabler/icons-react";
import { useState } from "react";

export function Golocal() {

    const [value, setValue] = useState("List")

    const handleValueChange = async (e) => {
        setValue(e.value);
        console.log(value)
    }


    return (
        <div>
            <div className="fixed top-25 left-1/2 transform -translate-x-1/2 z-50 text-white max-w-xl w-full flex flex-col justify-center items-center gap-2 rounded-lg text-sm md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-2 sm:p-2">
                {value === "List" ? (
                    <div className="flex flex-row gap-2">
                        <IconListDetails stroke={1.5} size={25} className="sm:size-35" />
                        <span className="text-xs md:text-sm lg:text-md text-center sm:text-left">Custom built feed based on the communities, channels, and people you follow</span>
                    </div>

                ) : (
                    <div className="flex flex-row gap-2">
                        <IconListDetails stroke={1.5} size={25} className="sm:size-35" />
                        <span className="text-xs md:text-sm lg:text-md text-center sm:text-left">Custom built feed based on the communities, channels, and people you follow</span>
                    </div>
                )}
                <SegmentedControl value={value} items={["List", "Map"]} onValueChange={(e) => handleValueChange(e)} />
            </div>

        </div>
    )
}