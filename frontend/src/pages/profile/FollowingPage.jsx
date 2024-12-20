import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useFollow } from "../../hooks/useFollow";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function FollowingPage({ followType }) {
  const [followInfo, setFollowInfo] = useState(`${followType}`);
  const { username } = useParams();

  const { data: user } = useQuery({ queryKey: ["userProfile", username] });

  const {
    data: following,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userFollow", username, followInfo],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/${followInfo}/${username}`);
        const data = await res.json();
        if (res.status === 400) {
          throw new Error(data.message);
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }

        return data;
      } catch (error) {
        throw error;
      }
    },
    retry: false,
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { follow, isPending } = useFollow();

  /* useEffect(() => {
    refetch();
  }, [followInfo, username, refetch]); */

  return (
    <div className="flex-[4_4_0] justify-center">
      <div className="sticky top-0 bg-[rgb(0,0,0,0.6)] backdrop-blur-md z-40">
        <div className="flex gap-4 px-4 py-1 items-center">
          <Link to={-1} className="p-3 rounded-full hover:bg-neutral-900">
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <Link to={`/profile/${user.username}`}>
            <div className="flex flex-col items-start ">
              <span className="font-bold text-xl">{user.fullName}</span>
              <span className="text-neutral-500 text-xs">@{user.username}</span>
            </div>
          </Link>
        </div>
        <div className="flex w-full border-b border-neutral-700">
          <div
            className={
              "flex justify-center flex-1 p-4 hover:bg-[rgb(78,78,78,0.4)] transition duration-300 relative cursor-pointer " +
              (followInfo !== "following" && "text-slate-500")
            }
            onClick={() => setFollowInfo("following")}
          >
            Following
            {followInfo === "following" && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
            )}
          </div>
          <div
            className={
              "flex justify-center flex-1 p-4 hover:bg-[rgb(78,78,78,0.4)] transition duration-300 relative cursor-pointer " +
              (followInfo !== "followers" && "text-slate-500")
            }
            onClick={() => setFollowInfo("followers")}
          >
            Followers
            {followInfo === "followers" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary" />
            )}
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="w-full flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {following?.length === 0 && (
        <div className="text-center mt-4">
          Not {followInfo === "following" ? "following" : "followed by"} anyone
        </div>
      )}
      {following &&
        following.map((user) => (
          <Link to={`/profile/${user.username}`} key={user._id}>
            <div className="flex min-h-20 items-center justify-between gap-2 p-4 border-b border-neutral-700 transition duration-300 hover:bg-secondary">
              <div className="flex flex-1 items-center gap-2">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={user.profileImg || "/avatar-placeholder.png"} />
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <div className="font-bold">{user.fullName}</div>
                  <div className="text-slate-500 text-sm">@{user.username}</div>
                </div>
              </div>
              <div>
                {user._id !== authUser._id && (
                  <button
                    className={
                      "btn " +
                      (authUser.following.includes(user._id)
                        ? "btn-outline rounded-full btn-sm"
                        : "bg-white text-black hover:bg-black hover:text-white hover:border-white rounded-full btn-sm")
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                  >
                    {isPending ? (
                      <LoadingSpinner size="xs" />
                    ) : authUser.following.includes(user._id) ? (
                      "Unfollow"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}

export default FollowingPage;
