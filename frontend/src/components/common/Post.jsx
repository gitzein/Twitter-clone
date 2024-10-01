import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FaWrench } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import EditPostModal from "./EditPostModal";
import { useLikePost } from "../../hooks/useLikePost";
import { usePostComment } from "../../hooks/usePostComment";
import { useDeletePost } from "../../hooks/useDeletePost";
import AddCommentModal from "./AddCommentModal";

const Post = ({ post, feedType }) => {
  const [comment, setComment] = useState("");
  const postOwner = post.user;
  const postId = post._id;
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const isLiked = post.likes.includes(authUser._id);

  const isMyPost = post.user._id === authUser._id;

  const formattedPostDate = formatPostDate(post.createdAt);

  const { deletePost, isDeleting } = useDeletePost(postId, feedType);

  const handleDeletePost = () => {
    deletePost();
  };

  const { postComment, isCommenting } = usePostComment(postId, feedType);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    postComment(comment);
    setComment("");
  };

  const { likePost, likingPending } = useLikePost(postId, "posts", feedType);

  const handleLikePost = () => {
    if (likingPending) return;
    likePost(postId);
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <Link to={`/profile/${postOwner.username}`}>
          <div className="avatar">
            <div className="w-8 rounded-full overflow-hidden">
              <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
            </div>
          </div>
        </Link>
        <div className="flex flex-col flex-1">
          <div className="flex gap-1 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
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
                            feedType={feedType}
                            editType={"post"}
                          />
                        </a>
                      </li>
                      <li>
                        <a>
                          <div
                            onClick={handleDeletePost}
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
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <AddCommentModal post={post} feedType={feedType} />
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
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
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
