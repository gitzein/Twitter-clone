import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { data: unreadNotif } = useQuery({
    queryKey: ["unreadNotif"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notification/unread");
        const data = await res.json();
        if (!res.ok) throw new Error("Something went wrong");
        return data;
      } catch (error) {
        throw error;
      }
    },
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error("Something went wrong");
        }
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 justify-center items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-2 md:pl-2 md:pr-4 max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-between items-center">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-2 md:pl-2 md:pr-4  max-w-fit cursor-pointer"
            >
              <IoNotifications
                className={
                  "w-6 h-6 " + (unreadNotif?.length !== 0 && "fill-primary")
                }
              />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
            {unreadNotif && unreadNotif.length !== 0 && (
              <span className="text-base text-center hidden md:block px-2 mx-auto rounded-full bg-primary text-white">
                {unreadNotif.length}
              </span>
            )}
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-2 md:pl-2 md:pr-4  max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <div className="mt-auto mb-10 flex gap-2 flex-col items-center md:flex-row  justify-center transition-all duration-300 md:hover:bg-[#181818] py-2 px-4 rounded-full">
            <Link
              to={`/profile/${authUser.username}`}
              className="flex  gap-1 pl-1 pr-2.5 items-center w-full justify-center transition-all duration-300 rounded-full hover:bg-primary hover:text-white"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full">
                  <img
                    src={authUser?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm ">
                <div className="hidden md:block max-w-24">
                  <p className="text-white font-bold truncate">
                    {authUser?.fullName}
                  </p>
                  <p className="text-slate-500 truncate">
                    @{authUser?.username}
                  </p>
                </div>
              </div>
            </Link>
            <div className="flex justify-center items-center p-2 rounded-full transition-all duration-300 hover:bg-primary">
              <BiLogOut
                className="text-2xl cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
