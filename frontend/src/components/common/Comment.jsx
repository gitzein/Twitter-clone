import React from "react";
import { formatPostDate } from "../../utils/date";
import { FaTrash, FaWrench } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BsThreeDots } from "react-icons/bs";
import EditPostModal from "./EditPostModal";

function Comment({ comment, feedType, postId }) {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyComment = authUser._id === comment.from._id;

  const isDeleting = false;

  const handleDeleteComment = () => {};

  return (
    <>
      <Link to={`/profile/${comment.from.username}`}>
        <div className="avatar">
          <div className="w-8 rounded-full">
            <img src={comment.from.profileImg || "/avatar-placeholder.png"} />
          </div>
        </div>
      </Link>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1">
          <Link to={`/profile/${comment.from.username}`}>
            <span className="font-bold">{comment.from.fullName}</span>
          </Link>

          <div className="flex items-center gap-1 text-gray-700 text-sm">
            <Link to={`/profile/${comment.from.username}`}>
              <span>@{comment.from.username}</span>
            </Link>
            <span>·</span>
            <span>{formatPostDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span>Edited</span>
                  <FaWrench className="text-xs" />
                </span>
              </>
            )}
          </div>
          {isMyComment && (
            <span className="flex justify-end flex-1">
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button">
                    <BsThreeDots />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] p-0 menu shadow bg-base-100 rounded-box w-fit"
                  >
                    <li className="w-full">
                      <a>
                        <EditPostModal
                          id={comment._id}
                          text={comment.text}
                          feedType={feedType}
                          editType={"comment"}
                          postId={postId}
                        />
                      </a>
                    </li>
                    <li>
                      <a>
                        <div
                          onClick={handleDeleteComment}
                          className="flex items-center gap-2 cursor-pointer hover:text-red-500"
                        >
                          <FaTrash />
                          <p className=" text-nowrap">Delete post</p>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </span>
          )}
        </div>

        <div className="text-sm">{comment.text}</div>
      </div>
    </>
  );
}

export default Comment;
