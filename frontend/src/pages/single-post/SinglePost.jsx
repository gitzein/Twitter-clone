import { useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EditPostModal from "../../components/common/EditPostModal";
import {
  FaArrowLeft,
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
  FaWrench,
} from "react-icons/fa";
import { formatPostDate } from "../../utils/date";
import PostSkeleton from "../../components/skeletons/PostSkeleton";
import { useLikePost } from "../../hooks/useLikePost";
import { usePostComment } from "../../hooks/usePostComment";
import { useDeletePost } from "../../hooks/useDeletePost";
import { BiRepost } from "react-icons/bi";
import Comment from "./Comment";
import { useRetweet } from "../../hooks/useRetweet";
import DeleteComfirmationModal from "../../components/common/DeleteComfirmationModal";
import { longStringChecker } from "../../utils/longStringChecker";
import OptimisticComment from "./OptimisticComment";
import { useSavePost } from "../../hooks/useSavePost";
import CommentInput from "./CommentInput";

function SinglePost() {
  const { id: postId } = useParams();
  const commentInputRef = useRef();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/posts/post/${postId}`);
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
  });
  const postOwner = post?.user;
  const formattedDate = formatPostDate(post?.createdAt);
  const isMyPost = post?.user._id === authUser._id;
  const isPostRetweeted = post?.retweets?.includes(authUser?._id);
  let isLiked = post?.likes.includes(authUser._id);
  let isPostSaved = authUser?.savedPosts.includes(postId);
  const likesLength = post?.likes.length;

  const { deletePost, isDeleting } = useDeletePost(postId, "post");

  const handleDeletePost = () => {
    deletePost();
  };

  const { postComment, isCommenting, variables } = usePostComment(
    postId,
    "post"
  );

  const { likePost, likingPending } = useLikePost(postId, "post", postId);

  const handleLikePost = () => {
    if (likingPending) return;
    likePost(postId);
  };

  if (likingPending) {
    if (!isLiked) {
      likesLength + 1;
    } else {
      likesLength - 1;
    }

    isLiked = !isLiked;
  }

  const { retweet, isRetweeting } = useRetweet(postId, "post");

  const handleRetweet = () => {
    if (isRetweeting) return;
    retweet();
  };

  const { savePost, isSavingPost } = useSavePost();

  const handleSavePost = (e) => {
    e.preventDefault();
    if (isSavingPost) return;
    savePost(postId);
  };

  if (isSavingPost) {
    isPostSaved = !isPostSaved;
  }

  return (
    <div className="flex-[4_4_0]  border-r border-gray-700 ">
      <div className="flex gap-10 px-4 py-2 items-center">
        <Link to={-1}>
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col">
          <p className="font-bold text-lg">Post</p>
        </div>
      </div>
      <div className=" mb-4 w-full"></div>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
        </div>
      )}
      {isError && (
        <div className="w-full flex justify-center">
          <p>{error.message}</p>
        </div>
      )}
      {!isLoading && !isError && post && (
        <>
          <div className="flex gap-4 items-start p-4 border-b border-gray-700">
            <Link to={`/profile/${postOwner.username}`}>
              <div className="avatar">
                <div className="w-12 rounded-full overflow-hidden">
                  <img
                    src={postOwner.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
            </Link>
            <div className="flex flex-col flex-1">
              <div className="flex gap-2 items-center">
                <Link
                  to={`/profile/${postOwner.username}`}
                  className="font-bold"
                >
                  {postOwner.fullName}
                </Link>
                <span className="text-gray-700 flex gap-1 text-sm">
                  <Link to={`/profile/${postOwner.username}`}>
                    @{postOwner.username}
                  </Link>
                  <span>·</span>
                  <span>{formattedDate}</span>
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
                {isMyPost && (
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
                                id={postId}
                                text={post.text}
                                feedType="post"
                                editType={"post"}
                              />
                            </a>
                          </li>
                          <li>
                            <a>
                              <DeleteComfirmationModal
                                id={postId}
                                type={"post"}
                                func={handleDeletePost}
                              />
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 overflow-hidden">
                <span
                  className={"" + (longStringChecker(post.text) && "break-all")}
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
              <div className="flex justify-between mt-3">
                <div className="flex gap-4 items-center w-2/3 justify-between">
                  <div
                    onClick={() => commentInputRef.current.focus()}
                    className="flex gap-1 items-center cursor-pointer group"
                  >
                    <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                    <span className="text-sm text-slate-500 group-hover:text-sky-400">
                      {post.comments.length}
                    </span>
                  </div>

                  <div
                    onClick={handleRetweet}
                    className="flex gap-1 items-center group cursor-pointer"
                  >
                    {isPostRetweeted ? (
                      <BiRepost className="w-6 h-6   text-green-500 group-hover:text-slate-500" />
                    ) : (
                      <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                    )}
                    <span
                      className={`text-sm  ${
                        isPostRetweeted
                          ? "text-green-500 group-hover:text-slate-500"
                          : "text-slate-500 group-hover:text-green-500"
                      }`}
                    >
                      {post.retweets?.length || 0}
                    </span>
                  </div>
                  <div
                    className="flex gap-1 items-center group cursor-pointer"
                    onClick={handleLikePost}
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
                <div className="flex w-1/3 justify-end gap-2 items-center">
                  <div onClick={(e) => handleSavePost(e)}>
                    {isPostSaved ? (
                      <FaBookmark className="w-4 h-4 text-sky-500 cursor-pointer" />
                    ) : (
                      <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mb-[30vh]">
            <CommentInput
              postComment={postComment}
              isCommenting={isCommenting}
              authUser={authUser}
              inputRef={commentInputRef}
            />
            {post.comments.length !== 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex gap-2 pt-2 pb-4 px-4 items-center border-b border-gray-600"
                >
                  <Comment
                    comment={comment}
                    feedType={"post"}
                    postId={postId}
                  />
                </div>
              ))
            ) : (
              <p
                className={
                  "text-sm text-slate-500 text-center p-5 " +
                  (isLoading && "hidden")
                }
              >
                No comments yet
              </p>
            )}
            {isCommenting && (
              <div className="flex gap-2 pt-2 pb-4 px-4 opacity-50 items-center border-b border-gray-600 showAnimation">
                <OptimisticComment textVar={variables} userData={authUser} />
              </div>
            )}
            <div className="min-h-[50vh]"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default SinglePost;
