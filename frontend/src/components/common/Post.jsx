import { FaBookmark } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaRegBookmark } from "react-icons/fa6";
import { FaWrench } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import EditPostModal from "./EditPostModal";
import { useLikePost } from "../../hooks/useLikePost";
import { useDeletePost } from "../../hooks/useDeletePost";
import AddCommentModal from "./AddCommentModal";
import { useSavePost } from "../../hooks/useSavePost";
import { useRetweet } from "../../hooks/useRetweet";
import { Link, useNavigate } from "react-router-dom";
import DeleteComfirmationModal from "./DeleteComfirmationModal";
import { longStringChecker } from "../../utils/longStringChecker";

const Post = ({ post, feedType }) => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const postOwner = post.user;
  const postId = post._id;
  const navigate = useNavigate();

  const isMyPost = post.user._id === authUser?._id;

  const isPostRetweeted = post.retweets?.includes(authUser?._id);

  const formattedPostDate = formatPostDate(post.createdAt);

  const likesLength = post.likes.length;

  let isLiked = post.likes.includes(authUser._id);
  let isPostSaved = authUser?.savedPosts.includes(post._id);

  const { deletePost, isDeleting } = useDeletePost(postId, feedType);

  const handleDeletePost = () => {
    deletePost();
  };

  const { likePost, likingPending } = useLikePost(postId, "posts", feedType);

  const handleLikePost = (e) => {
    e.preventDefault();
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

  const { savePost, isSavingPost } = useSavePost();

  if (isSavingPost) {
    isPostSaved = !isPostSaved;
  }

  const handleSavePost = (e) => {
    e.preventDefault();
    if (isSavingPost) return;
    savePost(postId);
  };

  const { retweet, isRetweeting } = useRetweet(postId, feedType);

  const handleRetweet = (e) => {
    e.preventDefault();
    if (isRetweeting) return;
    retweet();
  };

  const navigateToProfile = (e) => {
    e.preventDefault();
    navigate(`/profile/${postOwner.username}`);
  };

  return (
    <>
      <Link className=" cursor-default" to={`/post/${post._id}`}>
        <div className="flex gap-2 items-start border-b border-gray-700 px-4 pb-4 mb-4 transition-all duration-300 hover:bg-neutral-950">
          <div
            className="avatar cursor-pointer"
            onClick={(e) => navigateToProfile(e)}
          >
            <div className="w-8 rounded-full overflow-hidden">
              <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
            </div>
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex gap-1 items-center">
              <div
                className="font-bold cursor-pointer hover:underline"
                onClick={(e) => navigateToProfile(e)}
              >
                {postOwner.fullName}
              </div>
              <span className="text-gray-700 flex items-center gap-1 text-sm">
                <div>@{postOwner.username}</div>
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
                    <div
                      className="dropdown dropdown-end"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div tabIndex={0} role="button">
                        <BsThreeDots />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] p-0 menu shadow bg-base-100 rounded-box w-fit"
                      >
                        <li className="w-full">
                          <div>
                            <EditPostModal
                              id={postId}
                              text={post.text}
                              feedType={feedType}
                              editType={"post"}
                            />
                          </div>
                        </li>
                        <li>
                          <div>
                            <DeleteComfirmationModal
                              id={postId}
                              type={"post"}
                              func={handleDeletePost}
                            />
                          </div>
                        </li>
                      </ul>
                    </div>
                  )}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full">
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
                <div onClick={(e) => e.preventDefault()}>
                  <AddCommentModal post={post} feedType={feedType} />
                </div>
                <div
                  onClick={(e) => handleRetweet(e)}
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
                  onClick={(e) => handleLikePost(e)}
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
      </Link>
    </>
  );
};
export default Post;
