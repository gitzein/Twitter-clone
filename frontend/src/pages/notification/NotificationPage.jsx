import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaCommentDots } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { formatPostDate } from "../../utils/date";
import { BiRepost } from "react-icons/bi";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notification/");
        const data = await res.json();
        if (!res.ok) throw new Error("Something went wrong");
        return data;
      } catch (error) {
        throw error;
      }
    },
  });

  const { mutate: deleteAllNotifications, isPending: isDeleting } = useMutation(
    {
      mutationFn: async () => {
        try {
          const res = await fetch("/api/notification", {
            method: "DELETE",
          });
          const data = res.json();
          if (!res.ok) throw new Error("Something went wrong");
          return data;
        } catch (error) {
          throw error;
        }
      },
      onSuccess: () => {
        toast.success("All notifications deleted");
        queryClient.invalidateQueries({ queryKey: ["notification"] });
      },
      onError: (error) => toast.error(error.message),
    }
  );

  const deleteNotifications = () => {
    deleteAllNotifications();
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["unreadNotif"] });
  }, []);

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {(isLoading || isDeleting) && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications</div>
        )}
        {notifications?.map((notification) => (
          <div
            className={
              "border-b border-gray-700 " +
              (notification.read == "false" && "bg-gray-800")
            }
            key={notification._id}
          >
            <Link
              className="w-full flex justify-between hover:bg-secondary"
              to={
                notification.type === "follow"
                  ? `/profile/${notification.ref}`
                  : `/post/${notification.ref}`
              }
            >
              <div className="flex items-center gap-2 p-4">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                {notification.type === "likeComment" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                {notification.type === "comment" && (
                  <FaCommentDots className="w-7 h-7 text-sky-500" />
                )}
                {notification.type === "retweet" && (
                  <BiRepost className="w-7 h-7 text-green-500" />
                )}
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/profile/${notification.from.username}`);
                  }}
                >
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">
                      @{notification.from.username}
                    </span>{" "}
                    {notification.type === "follow" && "followed you"}
                    {notification.type === "like" && "liked your post"}
                    {notification.type === "likeComment" &&
                      "liked your comment"}
                    {notification.type === "comment" &&
                      "commented on your post"}
                    {notification.type === "retweet" && "retweeted your post"}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-base p-2">
                {formatPostDate(notification.createdAt)}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
