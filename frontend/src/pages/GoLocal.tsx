import { SegmentedControl } from "@components/ui/segmented-control";
import { IconListDetails } from "@tabler/icons-react";
import { useState } from "react";
import { IconMap } from "@tabler/icons-react";
import { Slider } from "@components/ui/slider"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select"
import BentoGrid from "@components/Grid";
import CryptoCard from "@components/UserCard";
import { ExpandableCard } from "@components/ui/aceternity/ExpandableCard";

import { HStack } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { RiArrowRightLine } from "react-icons/ri"




export function Golocal() {
    const [value, setValue] = useState("List"); // For SegmentedControl
    const initialValue = [50];

    const [sliderValue, setSliderValue] = useState(initialValue); // For Slider

    const [selectedCategory, setSelectedCategory] = useState("users"); // For Select dropdown
    const [listView, setlistView] = useState(false) //for expandable card list/grid view


    const handleValueChange = async (e) => {
        setValue(e.value);
        console.log(value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e); // Updates selected category
    };


    return (
        <div className="flex flex-col justify-center items-center">
            <div className="relative flex flex-col justify-center items-center gap-7">

                <div className="w-fit flex flex-row justify-center items-center gap-2 text-white rounded-lg text-md md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-4">
                    <IconMap stroke={1.2} size={30} className="sm:size-35" />
                    <span className="text-md text-center sm:text-left">Set Radius to explore users, channels, communities or posts in given radius</span>
                </div>

                <div className="flex flex-col justify-center items-center gap-10 lg:flex-row">
                    <div>
                        <Slider defaultValue={[0]} max='4' step='0.1' variant='outline' size="md" label="" colorPalette="red" width="250px" value={sliderValue} onValueChange={(e) => setSliderValue(e.value)} />
                        <span className="w-80 text-md md:text-md text-white-700">
                            Radius: {sliderValue} Kilometers
                        </span>
                    </div>
                    <div>
                        <Select onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Explore" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {/* <SelectLabel></SelectLabel> */}
                                    <SelectItem value="users">Users</SelectItem>
                                    <SelectItem value="posts">Posts</SelectItem>
                                    <SelectItem value="channels">Channels</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="fixed left-1/2 bottom-10 w-fit gap-2 text-white rounded-lg text-sm md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-1 transform -translate-x-1/2 z-10">
                    <SegmentedControl
                        value={value}
                        items={["List", "Map"]}
                        orientation='vertical'
                        onValueChange={(e) => handleValueChange(e)}
                    />
                </div>
            </div>
            <div className="w-full lg:w-[42%] md:w-[70%] mt-10">
                {selectedCategory === "users" && (
                    <div className="w-full gap-2 flex flex-col justify-center items-center">
                        <CryptoCard />
                        <CryptoCard />
                        <CryptoCard />
                        <CryptoCard />
                    </div>
                )}
                {selectedCategory === "channels" && (
                    <div className="w-full">
                        <div className="flex justify-end p-4">
                            <HStack>
                                <Button colorPalette="red" variant="outline" onClick={() => setlistView(!listView)} className="text-sm p-4 outline-none">
                                    {listView ? "List" : "Grid"} <RiArrowRightLine />
                                </Button>
                            </HStack>
                        </div>
                        <ExpandableCard listView={listView} />
                    </div>
                )}
                {selectedCategory === "posts" && (
                    <div className="w-full">
                        <BentoGrid />
                    </div>
                )}
            </div>

        </div>
    );
}
