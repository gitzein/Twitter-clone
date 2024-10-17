import React, { useEffect } from "react";
import { useSearch } from "../../hooks/useSearch";
import useDebounce from "../../hooks/useDebounce";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaUser } from "react-icons/fa6";

function SearchList({ searchParam }) {
  const debouncedValue = useDebounce(searchParam, 1000);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { searchResult, isSearching, isSearchError, searchError, refetch } =
    useSearch(debouncedValue);

  useEffect(() => {
    refetch();
  }, [debouncedValue]);

  return (
    <div className="min-h-[12vh] bg-black rounded-lg max-w-full max-h-[60vh] overflow-y-auto">
      {!searchResult && searchParam !== "" && <p>No result</p>}
      {debouncedValue === "" && !isSearching && (
        <p className="pt-4 text-center text-gray-600">
          Try searching for people
        </p>
      )}
      {isSearching && (
        <div className="w-full pt-4 flex justify-center">
          <LoadingSpinner size="sm" color={"primary"} />
        </div>
      )}
      {searchResult && searchResult.length !== -1 && !isSearching && (
        <ul className="flex flex-col ">
          {searchResult.map((result) => {
            return (
              <li key={result._id}>
                <Link to={`/profile/${result.username}`}>
                  <div className="flex items-center justify-center gap-2 px-2 py-4 w-full hover:bg-neutral-950">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img
                          src={result.profileImg || "/avatar-placeholder.png"}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 items-start text-sm overflow-x-hidden">
                      <span className="font-bold truncate w-[80%]">
                        @{result.username}
                      </span>
                      <span className="text-gray-500  truncate w-[80%]">
                        {result.fullName}
                      </span>
                      {authUser?.following.includes(result._id) && (
                        <span className="text-gray-500 flex gap-1 items-center">
                          <FaUser className={"w-[0.625rem] h-[0.625rem] "} />
                          Following
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SearchList;
