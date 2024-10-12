import React, { useEffect, useRef, useState } from "react";
import { formatPostDate } from "../../utils/date";
import { usePostComment } from "../../hooks/usePostComment";
import { useQuery } from "@tanstack/react-query";
import { FaRegComment, FaWrench } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { longStringChecker } from "../../utils/longStringChecker";
import EmojiPicker from "./EmojiPicker";
import AutoHeightTextarea from "./AutoHeightTextarea";

function AddCommentModal({ post, feedType }) {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [comment, setComment] = useState("");
  const postId = post._id;
  const postOwner = post.user;

  const commentInputRef = useRef();
  const navigate = useNavigate();

  const formattedPostDate = formatPostDate(post.createdAt);

  const commentLength = comment.split("").length;
  const almostReachingCommentLimit =
    commentLength >= 270 && commentLength <= 280;
  const commentLimitReached = commentLength > 280;

  const { postComment, isCommenting } = usePostComment(postId, feedType);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    if (commentLimitReached) return;
    postComment(comment);
    setComment("");
  };

  useEffect(() => {
    commentInputRef.current.style.height = "auto";
    commentInputRef.current.style.height =
      commentInputRef.current.scrollHeight + "px";
  }, [comment]);

  return (
    <>
      <div
        className="flex gap-1 items-center cursor-pointer group"
        onClick={() => {
          document.getElementById("comments_modal_" + postId).showModal();
          commentInputRef.current.focus();
        }}
      >
        <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
        <span className="text-sm text-slate-500 group-hover:text-sky-400">
          {post.comments.length}
        </span>
      </div>
      {/* We're using Modal Component from DaisyUI */}
      <dialog
        id={`comments_modal_${postId}`}
        className="modal overflow-y-auto border-none outline-none"
      >
        <div className="modal-box overflow-y-visible  min-h-fit self-start mt-[5vh] px-4 py-2 rounded-2xl border flex flex-col justify-between border-gray-700 ">
          <div className="flex pt-2 pb-4 font-bold">
            <button
              onClick={() => {
                document.getElementById("comments_modal_" + postId).close();
              }}
              className="px-2"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex gap-2 text-lg items-start py-4 max-h-[45vh] overflow-y-auto">
              <div className="outline-none">
                <div
                  className="avatar cursor-pointer"
                  onClick={() => navigate(`/profile/${postOwner.username}`)}
                >
                  <div className="w-8 rounded-full overflow-hidden">
                    <img
                      src={postOwner.profileImg || "/avatar-placeholder.png"}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex gap-1 items-center">
                  <div className="flex items-center gap-1">
                    <span
                      className="font-bold cursor-pointer"
                      onClick={() => navigate(`/profile/${postOwner.username}`)}
                    >
                      {postOwner.fullName}
                    </span>
                    <span className="text-gray-700 flex items-center gap-1 text-sm">
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(`/profile/${postOwner.username}`)
                        }
                      >
                        @{postOwner.username}
                      </span>
                      <span>·</span>
                      <span>{formattedPostDate}</span>
                      {post.isEdited && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span>Edited</span>
                            <FaWrench className="text-xs" />
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col gap-3 overflow-hidden px-2 cursor-pointer">
                    <span
                      className={
                        "" + (longStringChecker(post.text) && "break-all")
                      }
                    >
                      {post.text}
                    </span>
                    {post.img && (
                      <img
                        src={post.img}
                        className="h-80 object-contain rounded-lg border border-gray-700"
                        alt=""
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form
              className="flex gap-2 items-start py-2"
              onSubmit={handlePostComment}
              name="comment-modal-form"
            >
              <div
                onClick={() => navigate(`/profile/${authUser.username}`)}
                className="cursor-pointer"
              >
                <div className="avatar">
                  <div className="w-8 rounded-full overflow-hidden">
                    <img
                      src={authUser.profileImg || "/avatar-placeholder.png"}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-1">
                <AutoHeightTextarea
                  inputRef={commentInputRef}
                  text={comment}
                  textSetter={setComment}
                  placeholder={"Add a comment..."}
                />
              </div>
            </form>
          </div>

          <div
            className={
              "flex justify-between pt-2 items-center " +
              (commentLength > 0
                ? "border-t border-t-gray-700"
                : "border-t border-transparent")
            }
          >
            <div className="flex flex-1 items-center">
              <EmojiPicker setter={setComment} posClass={"dropdown-right"} />
            </div>
            <div className="flex gap-2 items-center">
              {commentLength > 0 && (
                <div
                  className={
                    "opacity-70 text-sm transition-all duration-300 " +
                    (almostReachingCommentLimit
                      ? "text-yellow-500"
                      : commentLimitReached
                      ? "text-red-500 font-bold"
                      : "text-gray-500")
                  }
                >
                  {commentLimitReached
                    ? `-${commentLength - 280}`
                    : `${commentLength}/280`}
                </div>
              )}
              <button
                disabled={commentLimitReached}
                className="btn btn-primary rounded-full btn-sm text-base text-white px-4"
                onClick={(e) => handlePostComment(e)}
              >
                {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
              </button>
            </div>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-sky-200 opacity-20  min-h-[150vh]"
          name="close-comment-modal"
        >
          <button
            className="outline-none"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("comments_modal_" + postId).close();
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}

export default AddCommentModal;
