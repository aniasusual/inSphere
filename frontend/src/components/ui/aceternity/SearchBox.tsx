"use client";

import { PlaceholdersAndVanishInput } from "@components/ui/aceternity/placeholders-and-vanish-input";

export function SearchBox() {
    const placeholders = [
        "What's the first rule of Fight Club?",
        "Who is Tyler Durden?",
        "Where is Andrew Laeddis Hiding?",
        "Write a Javascript method to reverse a string",
        "How to assemble your own PC?",
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submitted");
    };
    return (
        <div className="h-[15rem] flex flex-col justify-center  items-center px-4 z-2">
            <h2 className="mb-5 sm:mb-10 text-lg text-center sm:text-3xl dark:text-white text-black">
                Search channels, users or hashtags
            </h2>
            <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
            />
        </div>
    );
}
