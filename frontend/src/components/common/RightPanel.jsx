import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useFollow } from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";
import SearchBar from "./SearchBar";
import { useRef, useState } from "react";
import SearchList from "./SearchList";
import { useQuery } from "@tanstack/react-query";
import useOutsideClick from "../../hooks/useOutsideClick";
import Search from "./Search";

const RightPanel = () => {
  const [searchParam, setSearchParam] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);

  const searchRef = useRef();

  useOutsideClick(searchRef, () => setFocusSearch(false));

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested");
        const data = await res.json();
        if (!res.ok) throw new Error("Something went wrong");
        return data;
      } catch (error) {
        throw error;
      }
    },
  });

  const { follow, isPending } = useFollow();

  if (suggestedUsers?.length === 0) return <div className="lg:w-64 w-0"></div>;

  return (
    <>
      <div className="w-[5vw] md:w-[15vw] lg:hidden"></div>
      <div className="hidden lg:block mx-2">
        <Search
          searchRef={searchRef}
          searchParam={searchParam}
          setSearchParam={setSearchParam}
          focusSearch={focusSearch}
          setFocusSearch={setFocusSearch}
        />
        <div className="bg-transparent py-3 my-2 border flex flex-col border-gray-700 rounded-xl min-w-72">
          <p className="font-bold text-lg pb-2 px-3">Who to follow</p>
          <div className="flex flex-col">
            {/* item */}
            {isLoading && (
              <>
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </>
            )}
            {!isLoading &&
              suggestedUsers?.map((user) => (
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center justify-between p-3 hover:bg-neutral-950"
                  key={user._id}
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-8 rounded-full overflow-hidden">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold tracking-tight truncate w-28">
                        {user.fullName}
                      </span>
                      <span className="text-sm text-slate-500">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        follow(user._id);
                      }}
                    >
                      {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                    </button>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default RightPanel;
