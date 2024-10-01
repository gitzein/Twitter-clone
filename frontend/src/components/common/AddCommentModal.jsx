import React, { useEffect, useRef, useState } from "react";
import { formatPostDate } from "../../utils/date";
import { usePostComment } from "../../hooks/usePostComment";
import { useQuery } from "@tanstack/react-query";
import { FaRegComment, FaWrench } from "react-icons/fa";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

function AddCommentModal({ post, feedType }) {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [comment, setComment] = useState("");
  const postId = post._id;
  const postOwner = post.user;

  const commentInputRef = useRef();

  const formattedPostDate = formatPostDate(post.createdAt);

  const { postComment, isCommenting } = usePostComment(postId, feedType);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    postComment(comment);
    setComment("");
  };

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
        className="modal border-none outline-none"
      >
        <div className="modal-box rounded border border-gray-600 max-h-[85vh]">
          <div className="flex gap-2 text-lg items-start py-4 max-h-[60vh] max-w-[80vh] overflow-y-auto">
            <Link
              to={`/profile/${postOwner.username}`}
              className="outline-none"
            >
              <div className="avatar">
                <div className="w-12 rounded-full overflow-hidden">
                  <img
                    src={postOwner.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
            </Link>
            <div className="flex flex-col flex-1">
              <div className="flex gap-1 items-center">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/profile/${postOwner.username}`}
                    className="font-bold"
                  >
                    {postOwner.fullName}
                  </Link>
                  <span className="text-gray-700 flex items-center gap-1 text-sm">
                    <Link to={`/profile/${postOwner.username}`}>
                      @{postOwner.username}
                    </Link>
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
              <Link to={`/post/${post._id}`}>
                <div className="flex flex-col gap-3 overflow-hidden">
                  <span>{post.text}</span>
                  {post.img && (
                    <img
                      src={post.img}
                      className="h-80 object-contain rounded-lg border border-gray-700"
                      alt=""
                    />
                  )}
                </div>
              </Link>
            </div>
          </div>

          <form
            className="flex gap-2 items-center py-2"
            onSubmit={handlePostComment}
          >
            <Link to={`/profile/${authUser.username}`}>
              <div className="avatar">
                <div className="w-8 rounded-full overflow-hidden">
                  <img src={authUser.profileImg || "/avatar-placeholder.png"} />
                </div>
              </div>
            </Link>
            <textarea
              ref={commentInputRef}
              className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white px-4">
              {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
}

export default AddCommentModal;
