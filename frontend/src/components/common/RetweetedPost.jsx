import React from "react";
import Post from "./Post";
import { Link } from "react-router-dom";
import { BiRepost } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useDeletePost } from "../../hooks/useDeletePost";
import { useQuery } from "@tanstack/react-query";

function RetweetedPost({ post, feedType }) {
  const postOwner = post.user;

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyPost = post.user._id === authUser?._id;

  const { deletePost, isDeleting } = useDeletePost(post._id, feedType);

  return (
    <>
      <div className="flex justify-between gap-2 mx-4 text-sm font-bold items-start p-1">
        <Link
          to={`/profile/${postOwner.username}`}
          className="flex flex-1 gap-1 items-center"
        >
          <span
            to={`/profile/${postOwner.username}`}
            className="text-gray-500 text-xl"
          >
            <BiRepost />
          </span>
          <span to={`/profile/${postOwner.username}`} className="text-gray-500">
            {postOwner.username}
          </span>
          <span to={`/profile/${postOwner.username}`} className="text-gray-500">
            reposted
          </span>
        </Link>
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
        <div className="w-full p-4 border-b border-gray-700  mb-4">
          <p className="text-center border border-gray-700 py-6 mb-2">
            This post no longer exist
          </p>
        </div>
      ) : (
        <Post post={post.postReference} feedType={feedType} />
      )}
    </>
  );
}

export default RetweetedPost;
