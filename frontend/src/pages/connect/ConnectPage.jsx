import { useQuery } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";
import { useFollow } from "../../hooks/useFollow";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import RightPanelSkeleton from "../../components/skeletons/RightPanelSkeleton";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function ConnectPage() {
  const {
    data: users,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["connect"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/connect");
        const data = await res.json();
        if (!res.ok) throw new Error("Something went wrong");
        return data;
      } catch (error) {
        throw error;
      }
    },
  });

  const { follow, isPending: isFollowing } = useFollow();

  return (
    <div className="flex-[4_4_0]">
      <div className="flex gap-10 px-4 py-2 items-center sticky top-0 bg-[rgb(0,0,0,0.6)] backdrop-blur-md z-40">
        <Link to={-1} className="p-3 rounded-full hover:bg-neutral-900">
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col">
          <p className="font-bold text-lg">Connect</p>
        </div>
      </div>
      {isFetching && (
        <div className="flex flex-col w-full">
          <RightPanelSkeleton />
          <RightPanelSkeleton />
          <RightPanelSkeleton />
          <RightPanelSkeleton />
        </div>
      )}
      {users && users.length !== 0 && !isFetching && (
        <div className="flex flex-col w-full">
          {users.map((user) => (
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center justify-between p-3 hover:bg-neutral-950"
              key={user._id}
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
                  {isFollowing ? <LoadingSpinner size="sm" /> : "Follow"}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConnectPage;
