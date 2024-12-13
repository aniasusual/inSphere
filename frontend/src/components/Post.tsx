"use client";
import { CarouselDefault } from "@components/Carousels/carouselDefault";
import { Avatar } from "./ui/avatar";
import { IconHeart } from '@tabler/icons-react';
import { IconHeartFilled } from '@tabler/icons-react';
import { IconMessage2 } from '@tabler/icons-react';

export function Post() {
    return (
        <div className="max-w-xl antialiased pt-4 relative">
            {dummyContent.map((item, index) => (
                <div key={`content-${index}`} className="mb-10">

                    <div className="text-sm text-left">
                        {item?.image && (
                            <CarouselDefault />
                        )}
                        <div className="flex flex-row justify-between items-center text-left">
                            <div className="flex flex-row justify-center items-center w-fit text-left">
                                <Avatar
                                    name="Sage Adebayo"
                                    src="https://bit.ly/sage-adebayo"
                                    shape="rounded"
                                    size="lg"
                                />
                                <p className="text-xl p-5">
                                    {item.name}
                                    <div className="text-sm text-red-500">following</div>
                                </p>
                            </div>

                            <div className="flex flex-row justify-between items-center">
                                <IconMessage2 stroke={1.25} size={32} className="hover: cursor-pointer ml-4" />
                                <IconHeartFilled size={32} className="text-xl text-red-500 hover:cursor-pointer ml-7" />
                            </div>

                        </div>
                        {item.description}
                    </div>
                    <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mt-4 dark:bg-white dark:text-black">
                        {item.badge}
                    </h2>
                </div>

            ))}
        </div>
    );
}

const dummyContent = [
    {
        name: "John Doe",
        description: (
            <>
                <p>
                    Sit duis est minim proident non nisi velit non consectetur. Esse
                    adipisicing laboris consectetur enim ipsum reprehenderit eu deserunt
                    Lorem ut aliqua anim do. Duis cupidatat qui irure cupidatat incididunt
                    incididunt enim magna id est qui sunt fugiat. Laboris do duis pariatur
                </p>
            </>
        ),
        badge: "React",
        image:
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
];
