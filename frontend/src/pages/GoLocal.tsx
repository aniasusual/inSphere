import { SegmentedControl } from "@components/ui/segmented-control";
import { IconMap } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Slider } from "@components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import BentoGrid from "@components/Grid";
import CryptoCard from "@components/UserCard";
import { ExpandableCard } from "@components/ui/aceternity/ExpandableCard";

import axios from "axios";

export function Golocal() {
  const [value, setValue] = useState("List"); // For SegmentedControl
  const initialValue = [0.5];
  const [listView] = useState(false);

  const [sliderValue, setSliderValue] = useState(initialValue); // For Slider

  const [selectedCategory, setSelectedCategory] = useState("users"); // For Select dropdown
  const [loading, setLoading] = useState(false);

  const [fetchedData, setFetchedData] = useState({
    users: [],
    posts: [],
    jams: [],
    // stories: [],
  });

  const handleValueChange = async (e: any) => {
    setValue(e.value);
  };

  const handleCategoryChange = (e: any) => {
    setSelectedCategory(e);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const coordinates = localStorage.getItem("userCoordinates");
        if (!coordinates) return;

        const parsedData = JSON.parse(coordinates);

        const config = {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        };

        const { data } = await axios.post(
          `${
            import.meta.env.VITE_API_BACKEND_URL
          }/api/v1/user/find-user-around`,
          {
            longitude: parsedData.longitude,
            latitude: parsedData.latitude,
            maxDistance: Number(sliderValue),
          },
          config
        );

        setFetchedData({
          ...fetchedData,
          users: data.users,
        });
        // Handle the data here
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      setLoading(true);

      try {
        const coordinates = localStorage.getItem("userCoordinates");
        if (!coordinates) return;

        const parsedData = JSON.parse(coordinates);

        const config = {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        };

        const { data } = await axios.post(
          `${
            import.meta.env.VITE_API_BACKEND_URL
          }/api/v1/post/find-post-around`,
          {
            longitude: parsedData.longitude,
            latitude: parsedData.latitude,
            maxDistance: Number(sliderValue),
          },
          config
        );

        console.log("data for posts: ", data);

        setFetchedData({
          ...fetchedData,
          posts: data.data.posts,
        });
        // Handle the data here
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchJams = async () => {
      setLoading(true);

      try {
        const coordinates = localStorage.getItem("userCoordinates");
        if (!coordinates) return;

        const parsedData = JSON.parse(coordinates);

        const config = {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        };

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/jam/find-jams-around`,
          {
            longitude: parsedData.longitude,
            latitude: parsedData.latitude,
            maxDistance: Number(sliderValue),
          },
          config
        );

        console.log("jams: ", data.jams);

        setFetchedData({
          ...fetchedData,
          jams: data.jams,
        });

        console.log("fetchedDdata.jams: ", fetchedData.jams);
        // Handle the data here
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory === "users") {
      fetchUsers();
    } else if (selectedCategory === "posts") {
      fetchPosts();
    } else if (selectedCategory === "jams") {
      fetchJams();
    }
  }, [sliderValue, selectedCategory]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative flex flex-col justify-center items-center gap-7">
        <div className="w-fit flex flex-row justify-center items-center gap-2 text-white rounded-lg text-md md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-4">
          <IconMap stroke={1.2} size={30} className="sm:size-35" />
          <span className="text-md text-center sm:text-left">
            Set Radius to explore users, channels, communities or posts in given
            radius
          </span>
        </div>

        <div className="flex flex-col justify-center items-center gap-10 lg:flex-row">
          <div>
            <Slider
              defaultValue={[0]}
              max={1}
              step={0.1}
              variant="outline"
              size="md"
              label=""
              colorPalette="red"
              width="250px"
              value={sliderValue}
              onValueChange={(e) => setSliderValue(e.value)}
            />
            <span className="w-80 text-md md:text-md text-white-700">
              Radius: {sliderValue} Kilometer
            </span>
          </div>
          <div>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={
                    selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel></SelectLabel> */}
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="posts">Posts</SelectItem>
                  <SelectItem value="jams">Jams</SelectItem>
                  {/* <SelectItem value="stories">Stories</SelectItem> */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="fixed left-1/2 bottom-10 w-fit gap-2 text-white rounded-lg text-sm md:text-md text-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/200 p-1 transform -translate-x-1/2 z-10">
          <SegmentedControl
            value={value}
            items={["List", "Map"]}
            orientation="vertical"
            onValueChange={(e) => handleValueChange(e)}
          />
        </div>
      </div>
      <div className="w-full lg:w-[42%] md:w-[70%] mt-10">
        {selectedCategory === "users" && (
          <div className="w-full gap-2 flex flex-col justify-center items-center">
            <span>showing {fetchedData.users.length} results</span>
            {fetchedData.users.length != 0 &&
              fetchedData.users.map((item) => {
                return <CryptoCard user={item} />;
              })}
          </div>
        )}
        {/* {selectedCategory === "jams" && (
          <div className="w-full">
            <div className="flex justify-end p-4">
              <HStack>
                <Button
                  colorPalette="red"
                  variant="outline"
                  onClick={() => setlistView(!listView)}
                  className="text-sm p-4 outline-none"
                >
                  {listView ? "List" : "Grid"} <RiArrowRightLine />
                </Button>
              </HStack>
            </div>
            <ExpandableCard listView={listView} />
          </div>
        )} */}
        {selectedCategory === "jams" && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <>
                <span>showing {fetchedData.jams.length} results</span>
                {fetchedData.jams.length > 0 ? (
                  <ExpandableCard listView={listView} jams={fetchedData.jams} />
                ) : (
                  <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                    No jams found. Try a different search term!
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {selectedCategory === "posts" && (
          <div className="w-full">
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <>
                <span>showing {fetchedData.posts.length} results</span>
                {fetchedData.posts.length > 0 ? (
                  <BentoGrid posts={fetchedData.posts} />
                ) : (
                  <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                    No posts found. Try a different search term!
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
