import { SegmentedControl } from "@components/ui/segmented-control";
import { IconListDetails } from "@tabler/icons-react";
import { useState } from "react";
import { IconMap } from "@tabler/icons-react";
import { Slider } from "@components/ui/slider"
import { RadioCard } from "@components/RadioCard";



export function Golocal() {
    const [value, setValue] = useState("List"); // For SegmentedControl
    const initialValue = [50];

    const [sliderValue, setSliderValue] = useState(initialValue); // For Slider

    const handleValueChange = async (e) => {
        setValue(e.value);
        console.log(value);
    };


    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-7">

                <div className="w-fit flex flex-row justify-center items-center gap-2 text-white rounded-lg text-md md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-2">
                    <IconMap stroke={1.2} size={30} className="sm:size-35" />
                    <span className="text-md text-center sm:text-left">Set Radius to explore users, channels, communities or posts in given radius</span>
                </div>

                <div className="flex flex-col justify-center items-center gap-2">
                    <div className="flex flex-col justify-center items-center gap-2">
                        <Slider defaultValue={[0]} max='4' step='0.1' variant='outline' size="md" label="" colorPalette="red" width="250px" value={sliderValue} onValueChange={(e) => setSliderValue(e.value)} />
                        <span className="w-80 text-lg md:text-md text-gray-700">
                            Radius (Kilometers): {sliderValue}
                        </span>
                    </div>
                    <div>
                        <RadioCard />
                    </div>

                </div>

                <div className="w-fit border-2 border-rose-600 gap-2 text-white rounded-lg text-sm md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-1">
                    <SegmentedControl
                        value={value}
                        items={["List", "Map"]}
                        orientation='vertical'
                        onValueChange={(e) => handleValueChange(e)}
                    />
                </div>
            </div>
        </div>
    );
}
