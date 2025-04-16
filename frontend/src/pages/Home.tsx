import { Post } from "@components/Post";
import StoriesComponent from "@components/Stories";
// import MyFeedJams from "@components/ui/Jams/MyFeed";
import { IconListDetails } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSocket } from "socket";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "store";

function Home() {
  const { socket } = useSocket();

  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("connected to socket");
      });
    }
  }, [socket]);

  useEffect(() => {
    const fetchMyFeedPosts = async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/post/my-feed`,
        { withCredentials: true }
      );

      if (data.success) {
        setPosts(data.data.posts);
      }

      console.log(data.data);
    };

    const fetchRandomPosts = async () => {};

    if (isAuthenticated) {
      fetchMyFeedPosts();
    } else {
      fetchRandomPosts();
    }
  }, [isAuthenticated]);

  return (
    <div className="flex justify-center w-full">
      <div className="max-w-xl">
        <StoriesComponent />
        {/* <StoriesComponent initialStories={myStories} /> */}

        <div className="text-white max-w-xl flex flex-row justify-center items-center gap-2 rounded-lg text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-4">
          <IconListDetails stroke={1.5} size={35} />
          <span>
            Custom built feed based on the communities, channels and people you
            follow{" "}
          </span>
        </div>
        <div className="flex justify-center flex-col items-center">
          {posts.length != 0 ? (
            <Post posts={posts} />
          ) : (
            <span>no posts to display</span>
          )}
        </div>
      </div>
      {/* <div>
                ads
            </div> */}
    </div>
  );
}

export default Home;
