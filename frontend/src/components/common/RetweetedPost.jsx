import React from "react";
import Post from "./Post";
import { BiRepost } from "react-icons/bi";
import { useDeletePost } from "../../hooks/useDeletePost";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DeleteComfirmationModal from "./DeleteComfirmationModal";

function RetweetedPost({ post, feedType }) {
  const postOwner = post.user;

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyPost = post.user._id === authUser?._id;

  const { deletePost, isDeleting } = useDeletePost(post._id, feedType);

  return (
    <div className={"hover:bg-neutral-950" + (isDeleting && "opacity-50")}>
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
        {isMyPost && !post.postReference && (
          <div>
            <DeleteComfirmationModal
              func={deletePost}
              id={post._id}
              type={"post"}
            />
          </div>
        )}
      </div>
      {!post.postReference ? (
        <div className="w-full p-4 border-b border-neutral-700  mb-4">
          <p className="text-center border border-neutral-700 py-3 mb-2">
            This post is no longer available
          </p>
        </div>
      ) : (
        <Post post={post.postReference} feedType={feedType} />
      )}
    </div>
  );
}

export default RetweetedPost;
