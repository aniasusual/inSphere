import { ExpandableCard } from "@components/ui/aceternity/ExpandableCard";
import { SearchBox } from "@components/ui/aceternity/SearchBox";
import { Component, ReactNode, useEffect, useState } from "react";
import { HStack } from "@chakra-ui/react";
import { Button } from "@components/ui/button";
import { RiArrowRightLine } from "react-icons/ri";
import axios from "axios";
import { toaster } from "@components/ui/toaster";
import CryptoCard from "@components/UserCard";
import BentoGrid from "@components/Grid";

// interface SearchResult {
//   _id: string;
//   id: string; // For Jam type
//   username?: string;
//   firstName?: string;
//   email?: string;
//   avatar?: { url: string };
//   title?: string;
//   description: string;
//   creator?: {
//     _id: string;
//     username: string;
//   };
//   mediaFiles?: { url: string }[];
//   displayImage?: { url: string };
//   name?: string;
// }

export function Search() {
  const [listView, setListView] = useState(false);
  const [searchCategory, setSearchCategory] = useState("jam");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchText(e.target.value);
  };

  // Array of search categories
  const categories = [
    { id: "jam", label: "Jams" },
    { id: "user", label: "Users" },
    { id: "post", label: "Posts" },
  ];

  class ErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
  > {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return (
          <p className="text-center text-red-600">
            Something went wrong. Please try again.
          </p>
        );
      }
      return this.props.children;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const limit = 10;
        const page = 1;
        const baseUrl = `${import.meta.env.VITE_API_BACKEND_URL
          }/api/v1/${searchCategory}/getSearchData`;
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          ...(searchText && { q: searchText }),
        });

        const { data } = await axios.get(`${baseUrl}?${params.toString()}`, {
          withCredentials: true,
        });

        setSearchResults(data.data || []); // Ensure fallback to empty array if data.data is undefined
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toaster.create({
          title: `Couldn't load ${searchCategory}s`,
          type: "error",
        });
        setSearchResults([]); // Reset results on error
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const debounceTimeout = setTimeout(() => {
      fetchData();
    }, 300);

    // Cleanup timeout on unmount or when dependencies change
    return () => clearTimeout(debounceTimeout);
  }, [searchCategory, searchText]);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <SearchBox
        setSearchText={setSearchText}
        handleSearchChange={handleSearchChange}
      />
      <ErrorBoundary>
        <div className="flex justify-center gap-2 items-center p-4">
          <HStack>
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSearchCategory(category.id)}
                className={`text-sm p-4 outline-none ${category.id === searchCategory ? "bg-red-700 text-white" : ""
                  }`}
              >
                {category.label}
              </Button>
            ))}
          </HStack>

          {searchCategory === "jam" && (
            <HStack>
              <Button
                variant="outline"
                onClick={() => setListView(!listView)}
                className="text-sm p-4 outline-none"
              >
                {listView ? "List" : "Grid"} <RiArrowRightLine />
              </Button>
            </HStack>
          )}
        </div>

        <div className="w-full lg:w-[42%] md:w-[70%] mt-10">
          {searchCategory === "jam" && (
            <div>
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
              ) : (
                <>
                  <span>showing {searchResults.length} results</span>
                  {searchResults.length > 0 ? (
                    <ExpandableCard
                      listView={listView}
                      jams={searchResults}
                    />
                  ) : (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                      No jams found. Try a different search term!
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {searchCategory === "user" && (
            <div className="w-full gap-2 flex flex-col justify-center items-center">
              <span>showing {searchResults.length} results</span>
              {searchResults.length != 0 &&
                searchResults.map((item: any) => {
                  return <CryptoCard key={item._id} user={item} />;
                })}
            </div>
          )}

          {searchCategory === "post" && (
            <div className="w-full">
              <span>showing {searchResults.length} results</span>
              {searchResults.length > 0 ? (
                <BentoGrid
                  posts={searchResults.map((result: any) => ({
                    _id: result._id,
                    title: result.title || "",
                    description: result.description || "",
                    mediaFiles:
                      result.mediaFiles?.map((file: any) => ({
                        _id: Math.random().toString(36).substr(2, 9),
                        url: file.url || "",
                        type: "image",
                      })) || [],
                    creator: result.creator || { _id: "", username: "" },
                    likes: [],
                    savedBy: [],
                    hashtags: [],
                    createdAt: new Date().toISOString(),
                  }))}
                />
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                  No posts found. Try a different search term!
                </p>
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
