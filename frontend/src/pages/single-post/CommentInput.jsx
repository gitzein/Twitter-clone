import React, { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmojiPicker from "../../components/common/EmojiPicker";
import AutoHeightTextarea from "../../components/common/AutoHeightTextarea";

function CommentInput({ postComment, isCommenting, authUser, inputRef }) {
  const [comment, setComment] = useState("");

  const handlePostComment = (e) => {
    e.preventDefault();
    if (commentLimitReached) return;
    if (isCommenting) return;
    if (comment.trim() === "") {
      setComment("");
      return;
    }
    postComment(comment);
    setComment("");
  };

  const commentLength = comment.split("").length;
  const almostReachingCommentLimit =
    commentLength >= 270 && commentLength <= 280;
  const commentLimitReached = commentLength > 280;

  useEffect(() => {
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }, [comment]);

  return (
    <form
      className="flex items-start gap-2 px-4 py-2 border-b border-neutral-600"
      onSubmit={handlePostComment}
      name="comment-input-form"
    >
      <div className="flex flex-col">
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-4">
        <AutoHeightTextarea
          inputRef={inputRef}
          text={comment}
          textSetter={setComment}
          placeholder={"Add a comment..."}
        />
        <div
          className={
            "flex justify-between items-center pt-2 " +
            (commentLength > 0
              ? "border-t border-t-gray-700"
              : "border-t border-transparent")
          }
        >
          <EmojiPicker
            setter={setComment}
            posClass={"dropdown-right dropdown-bottom"}
          />
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
              disabled={commentLimitReached || comment.trim() === ""}
              className="btn btn-primary rounded-full btn-sm text-white px-4"
            >
              {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default CommentInput;
