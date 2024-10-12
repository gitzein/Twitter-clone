import React from "react";
import { formatPostDate } from "../../utils/date";
import { FaHeart, FaRegHeart, FaTrash, FaWrench } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BsThreeDots } from "react-icons/bs";
import EditPostModal from "../../components/common/EditPostModal";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DeleteComfirmationModal from "../../components/common/DeleteComfirmationModal";
import { longStringChecker } from "../../utils/longStringChecker";

function Comment({ comment, feedType, postId }) {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyComment = authUser._id === comment.from._id;

  const queryClient = useQueryClient();

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${comment._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (res.status === 400 || res.status === 401) {
          throw new Error(data.message || "Something went wrong");
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }

        return data;
      } catch (error) {
        throw error;
      }
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  const handleDeleteComment = () => {
    deleteComment();
  };

  const { mutate: likeComment, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/like/${comment._id}`, {
          method: "POST",
        });
        const data = await res.json();

        if (res.status === 400 || res.status === 401) {
          throw new Error(data.message || "Something went wrong");
        } else if (!res.ok) {
          throw new Error("Something went wrong");
        }

        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (newCommentLikes) => {
      queryClient.setQueryData(["post", postId], (oldData) => {
        const newCommentsArr = oldData.comments.map((oldComment) => {
          if (oldComment._id === comment._id) {
            return { ...oldComment, likes: newCommentLikes };
          }
          return oldComment;
        });

        return { ...oldData, comments: newCommentsArr };
      });
    },
  });

  let isLiked = comment.likes.includes(authUser._id);
  let likesLength = comment.likes.length;

  if (isLiking) {
    if (!isLiked) {
      likesLength++;
    } else {
      likesLength--;
    }

    isLiked = !isLiked;
  }

  const handleLikeComment = () => {
    if (isLiking) return;
    likeComment();
  };

  return (
    <div className="flex gap-2 pt-2 pb-4 px-4 items-start border-b border-gray-600">
      <Link to={`/profile/${comment.from.username}`}>
        <div className="avatar">
          <div className="w-8 rounded-full">
            <img src={comment.from.profileImg || "/avatar-placeholder.png"} />
          </div>
        </div>
      </Link>
      <div className={"flex flex-col flex-1 " + (isDeleting && "opacity-50")}>
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
                        <DeleteComfirmationModal
                          id={comment._id}
                          type={"comment"}
                          func={handleDeleteComment}
                        />
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-1">
          <div className="text-sm flex flex-1 py-2">
            <span
              className={"" + (longStringChecker(comment.text) && "break-all")}
            >
              {comment.text.split(/(?:\r\n|\r|\n)/g).map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {arr.length - 1 === i ? null : <br />}
                </span>
              ))}
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <div
              className="flex gap-1 flex-col group cursor-pointer items-center"
              onClick={handleLikeComment}
            >
              {!isLiked ? (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
              ) : (
                <FaHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
              )}

              <span
                className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : ""
                }`}
              >
                {likesLength}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Comment;
