import { Post } from "@components/Post";
import { IconListDetails } from '@tabler/icons-react';
function Home() {
    return (
        <div className="flex justify-center w-full">
            <div className="">
                <div className="text-white max-w-xl flex flex-row justify-center items-center gap-2 rounded-lg text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-4">
                    <IconListDetails stroke={1.5} size={35} />
                    <span>Custom built feed based on the communities, channels and people you follow </span>
                </div>
                <div className="flex justify-center flex-col items-center">
                    <Post />
                    <Post />
                    <Post />
                </div>
            </div>
            {/* <div>
                ads
            </div> */}
        </div>
    )
}

export default Home;