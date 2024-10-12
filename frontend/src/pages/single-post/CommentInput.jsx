import React, { useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmojiPicker from "../../components/common/EmojiPicker";

function CommentInput({ postComment, isCommenting, authUser, inputRef }) {
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (commentLimitReached) return;
    if (isCommenting) return;
    if (comment.trim() === "") {
      setCommentError(true);
      setComment("");
      return;
    }
    postComment(comment);
    setComment("");
  };

  if (commentError) {
    setTimeout(() => {
      setCommentError(false);
    }, 1500);
  }

  const commentLength = comment.split("").length;
  const almostReachingCommentLimit =
    commentLength >= 270 && commentLength <= 280;
  const commentLimitReached = commentLength > 280;

  return (
    <form
      className="flex items-start gap-2 p-4 border-b border-gray-600"
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
        <textarea
          ref={inputRef}
          className={
            "textarea w-full rounded text-lg p-0 resize-none focus:outline-none transition-all duration-300 " +
            (commentError
              ? "border border-red-500"
              : "border border-transparent")
          }
          placeholder={
            commentError ? "Can't be empty comment" : "Add a comment..."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-between items-center">
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
              disabled={commentLimitReached}
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
