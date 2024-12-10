import { Post } from "@components/Post";
function Home() {
    return (
        <div className="flex justify-center w-full">
            <div className="!w-full border-2 border-rose-200">
                loda
                <Post />
                <Post />
                <Post />
            </div>
            {/* <div>
                ads
            </div> */}
        </div>
    )
}

export default Home;