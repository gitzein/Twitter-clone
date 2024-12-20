import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFollow } from "../../hooks/useFollow";
import { formatMemberSinceDate } from "../../utils/date";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PostSkeleton from "../../components/skeletons/PostSkeleton";

const ProfilePage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [isImgSizeAllowed, setIsImgSizeAllowed] = useState(true);
  const [feedType, setFeedType] = useState("user");
  const { username } = useParams();

  const queryClient = useQueryClient();

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const {
    data: user,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (res.status === 400) {
          throw new Error(data.message || "Something went wrong");
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

  const { mutate: updateProfileImg, isPending: isUpdating } = useMutation({
    mutationFn: async ({ coverImg, profileImg }) => {
      try {
        const res = await fetch("/api/users/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImg, profileImg }),
        });

        const data = await res.json();
        if (res.status === 400 || res.status === 409) {
          throw new Error(data.message);
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
      setCoverImg(null);
      setProfileImg(null);
      toast.success("Updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const { follow, isPending } = useFollow();

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];

    const size = file?.size;
    if (file && size / 1024 > 5000) {
      setIsImgSizeAllowed(false);
      toast.error("file size must not be greater than to 5MB");
    }
    if (file && size / 1024 <= 5000) {
      setIsImgSizeAllowed(true);
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isMyProfile = authUser._id === user?._id;
  const isFollowed = authUser.following.includes(user?._id);

  const handleUpdate = () => {
    updateProfileImg({ coverImg, profileImg });
  };

  return (
    <>
      <div className="flex-[4_4_0]">
        {/* HEADER */}
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}
        <div className="flex flex-col">
          {!isLoading && !isRefetching && user && (
            <>
              <div className="flex gap-10 px-4 py-1 items-center  sticky top-0 bg-[rgb(0,0,0,0.6)] backdrop-blur-md z-40">
                <Link to={-1}>
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.fullName}</p>
                  <span className="text-sm text-gray-500">
                    {user.postTotal} posts
                  </span>
                </div>
              </div>
              {/* COVER IMG */}
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={
                        profileImg ||
                        user?.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                    {isMyProfile && (
                      <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                        <MdEdit
                          className="w-4 h-4 text-white"
                          onClick={() => profileImgRef.current.click()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end px-4 mt-5">
                {isMyProfile && !coverImg && !profileImg && (
                  <EditProfileModal authUser={authUser} />
                )}
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={() => follow(user?._id)}
                  >
                    {isPending
                      ? "Loading..."
                      : isFollowed
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}
                {(coverImg || profileImg) && (
                  <div className="flex gap-2">
                    <button
                      disabled={isUpdating}
                      className="btn btn-outline rounded-full btn-sm px-4"
                      onClick={() => {
                        setProfileImg(null);
                        setCoverImg(null);
                        queryClient.invalidateQueries({
                          queryKey: ["userProfile"],
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!isImgSizeAllowed || isUpdating}
                      className="btn btn-primary rounded-full btn-sm text-white px-4"
                      onClick={handleUpdate}
                    >
                      {isUpdating ? <LoadingSpinner size="xs" /> : "Update"}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{user?.fullName}</span>
                  <span className="text-sm text-slate-500">
                    @{user?.username}
                  </span>
                  <span className="text-sm my-1">{user?.bio}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user?.link && (
                    <div className="flex gap-1 items-center ">
                      <>
                        <FaLink className="w-3 h-3 text-slate-500" />
                        <a
                          href={user.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {user.link}
                        </a>
                      </>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      {formatMemberSinceDate(user?.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/following/${user.username}`}>
                    <div className="flex gap-1 items-center">
                      <span className="font-bold text-xs">
                        {user?.following.length}
                      </span>
                      <span className="text-slate-500 text-xs">Following</span>
                    </div>
                  </Link>
                  <Link to={`/followers/${user.username}`}>
                    <div className="flex gap-1 items-center">
                      <span className="font-bold text-xs">
                        {user?.followers.length}
                      </span>
                      <span className="text-slate-500 text-xs">Followers</span>
                    </div>
                  </Link>
                </div>
              </div>
              <div className="flex w-full border-b border-neutral-700 mt-4">
                <div
                  className={
                    "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer " +
                    (feedType !== "user" && "text-slate-500")
                  }
                  onClick={() => setFeedType("user")}
                >
                  Posts
                  {feedType === "user" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <div
                  className={
                    "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer " +
                    (feedType !== "likes" && "text-slate-500")
                  }
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </>
          )}
          <div className=" mb-4 w-full"></div>
          {(isLoading || isRefetching) && (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
          {!isLoading && !isRefetching && user && (
            <Posts feedType={feedType} username={username} userId={user?._id} />
          )}
        </div>
      </div>
    </>
  );
};
export default ProfilePage;
