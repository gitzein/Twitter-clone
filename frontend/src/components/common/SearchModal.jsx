import React, { useRef, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import Search from "./Search";
import useOutsideClick from "../../hooks/useOutsideClick";
import { useQuery } from "@tanstack/react-query";
import { useFollow } from "../../hooks/useFollow";
import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";

function SearchModal({ type }) {
  const [searchParam, setSearchParam] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const searchBarRef = useRef();

  useOutsideClick(searchBarRef, () => setFocusSearch(false));

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

  return (
    <div>
      <button
        className="cursor-pointer hover:text-sky-500 py-2 px-2 flex justify-center items-center"
        onClick={() =>
          document.getElementById(`search_modal_${type}`).showModal()
        }
      >
        <FaMagnifyingGlass className={"w-6 h-6 "} />
      </button>
      <dialog id={`search_modal_${type}`} className="modal cursor-default">
        <div className="modal-box w-[90vw] min-h-[25vh] self-start mt-[5vh] pt-2 pb-16 flex flex-col rounded-2xl overflow-visible shadow-md shadow-neutral-500 bg-[rgb(0,0,0,0.8)] ">
          <Search
            searchRef={searchBarRef}
            searchParam={searchParam}
            setSearchParam={setSearchParam}
            focusSearch={focusSearch}
            setFocusSearch={setFocusSearch}
          />
          {isLoading && (
            <div className="py-3 my-2 border flex flex-col border-neutral-700 rounded-xl min-w-80 bg-black">
              <p className="font-bold text-lg pb-2 px-3">Who to follow</p>
              <div className="flex flex-col">
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </div>
            </div>
          )}
          {suggestedUsers?.length !== 0 && !isLoading && (
            <div className="pt-3 my-2 border flex flex-col border-neutral-700 rounded-2xl w-full bg-black overflow-hidden">
              <p className="font-bold text-lg pb-2 px-3">Who to follow</p>
              <div className="flex flex-col">
                {suggestedUsers.map((user) => (
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center justify-between p-3 hover:bg-neutral-950"
                    key={user._id}
                    onClick={() =>
                      document.getElementById(`search_modal_${type}`).close()
                    }
                  >
                    <div className="flex gap-2 items-center">
                      <div className="w-8 rounded-full overflow-hidden  aspect-square">
                        <img
                          src={user.profileImg || "/avatar-placeholder.png"}
                          className="w-full h-full object-cover"
                        />
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
              {suggestedUsers.length > 2 && (
                <Link
                  to={"connect"}
                  className="w-full hover:bg-neutral-950 px-3"
                  onClick={() =>
                    document.getElementById(`search_modal_${type}`).close()
                  }
                >
                  <div className="text-primary pt-3 pb-4">Show more</div>
                </Link>
              )}
            </div>
          )}
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-sky-200 opacity-20"
          name="close-comment-modal"
        >
          <button
            className="outline-none"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(`search_modal_${type}`).close();
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </div>
  );
}

export default SearchModal;
