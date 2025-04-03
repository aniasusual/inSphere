"use client";

import { PlaceholdersAndVanishInput } from "@components/ui/aceternity/placeholders-and-vanish-input";

export function SearchBox({ setSearchText, handleSearchChange }: any) {
  const placeholders = [
    "Search users by username",
    "Search posts by hashtags",
    "Search jams by titles",
  ];

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchText(e.target.value);
  // };
  // const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  // };
  return (
    <div className="h-[15rem] flex flex-col justify-center  items-center px-4 z-2">
      <h2 className="mb-5 sm:mb-10 text-lg text-center sm:text-3xl dark:text-white text-black">
        Search jams, users or posts
      </h2>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleSearchChange}
      // onSubmit={handleSubmit}
      />
    </div>
  );
}
