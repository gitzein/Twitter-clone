import React from "react";
import Post from "./Post";
import { BiRepost } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useDeletePost } from "../../hooks/useDeletePost";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

function RetweetedPost({ post, feedType, pageIndex, postIndex }) {
  const postOwner = post.user;

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyPost = post.user._id === authUser?._id;

  const { deletePost, isDeleting } = useDeletePost(post._id, feedType);

  return (
    <div className="hover:bg-neutral-950">
      <div className="flex justify-between gap-2 mx-4 text-sm font-bold items-start p-1">
        <div className="flex flex-1 gap-1 items-center">
          <span className="text-gray-500 text-xl">
            <BiRepost />
          </span>
          <Link to={`/profile/${postOwner.username}`}>
            <span className="text-gray-500">{postOwner.username}</span>
          </Link>
          <span className="text-gray-500">reposted</span>
        </div>
        {isMyPost && !post && (
          <div>
            <button
              onClick={() => deletePost()}
              className="cursor-pointer hover:text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      {!post.postReference ? (
        <div className="w-full p-4 border-b border-neutral-700  mb-4">
          <p className="text-center border border-neutral-700 py-6 mb-2">
            This post no longer exist
          </p>
        </div>
      ) : (
        <Post post={post.postReference} feedType={feedType} />
      )}
    </div>
  );
}

export default RetweetedPost;
