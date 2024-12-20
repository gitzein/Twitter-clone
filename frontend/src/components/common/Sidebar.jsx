import XSvg from "../svgs/X";

import {
  FaBell,
  FaBookmark,
  FaRegBell,
  FaRegBookmark,
  FaRegUser,
  FaUser,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BsHouseDoor, BsHouseDoorFill } from "react-icons/bs";
import LogoutComfirmationModal from "./LogoutComfirmationModal";
import SearchModal from "./SearchModal";

const Sidebar = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  let location = useLocation();

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

  return (
    <div className="hidden md:block lg:flex-[2_2_0] w-18 max-w-52  border-r border-neutral-700">
      <div className="sticky top-0 left-0 h-screen flex flex-col w-20 lg:w-full">
        <Link to="/" className="flex justify-center lg:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex flex-col gap-6 lg:gap-3 mt-4 justify-center">
          <li className="flex justify-center lg:justify-start">
            <Link
              to="/"
              className="flex gap-3 justify-center items-center hover:bg-stone-900 transition-all rounded-full duration-500 py-2 px-2 lg:pl-2 lg:pr-4 max-w-fit cursor-pointer"
            >
              {location.pathname === "/" ? (
                <BsHouseDoorFill className="w-7 h-7" />
              ) : (
                <BsHouseDoor className="w-7 h-7" />
              )}

              <span className="text-lg hidden lg:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center lg:justify-start items-center">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500 py-2 px-2 lg:pl-2 lg:pr-4 max-w-fit cursor-pointer"
            >
              {location.pathname === "/notifications" ? (
                <FaBell className={"w-7 h-7 "} />
              ) : (
                <FaRegBell className={"w-7 h-7 "} />
              )}

              <span className=" text-lg hidden lg:block">Notifications</span>
              {unreadNotif && unreadNotif.length !== 0 && (
                <span className="text-sm ml-1 text-center hidden lg:block px-2 rounded-full bg-primary text-white">
                  {unreadNotif.length}
                </span>
              )}
            </Link>
          </li>

          <li className="flex justify-center lg:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500 py-2 px-2 lg:pl-2 lg:pr-4  max-w-fit cursor-pointer"
            >
              {location.pathname === `/profile/${authUser?.username}` ? (
                <FaUser className="w-7 h-7" />
              ) : (
                <FaRegUser className="w-7 h-7" />
              )}

              <span className="text-lg hidden lg:block">Profile</span>
            </Link>
          </li>

          <li className="flex justify-center lg:justify-start">
            <Link
              to={`/bookmarks`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500 py-2 px-2 lg:pl-2 lg:pr-4  max-w-fit cursor-pointer"
            >
              {location.pathname === "/bookmarks" ? (
                <FaBookmark className="w-7 h-7" />
              ) : (
                <FaRegBookmark className="w-7 h-7" />
              )}

              <span className="text-lg hidden lg:block">Bookmarks</span>
            </Link>
          </li>
          <li className="flex justify-center lg:hidden items-center">
            <div className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500lg:pl-2 lg:pr-4  max-w-fit cursor-pointer">
              <SearchModal type={"sidebar"} />
            </div>
          </li>
        </ul>
        {authUser && (
          <div className="mt-auto mb-10 flex gap-2 flex-col items-center lg:flex-row  justify-center transition-all duration-300 lg:hover:bg-[#181818] py-2 px-4 rounded-full">
            <Link
              to={`/profile/${authUser.username}`}
              className="flex  gap-1 pl-1 pr-2.5 items-center w-full justify-center transition-all duration-500 rounded-full hover:bg-primary hover:text-white"
            >
              <div className="avatar hidden lg:inline-flex">
                <div className="w-8 rounded-full">
                  <img
                    src={authUser?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm ">
                <div className="hidden lg:block max-w-24">
                  <p className="text-white font-bold truncate">
                    {authUser?.fullName}
                  </p>
                  <p className="text-slate-500 truncate">
                    @{authUser?.username}
                  </p>
                </div>
              </div>
            </Link>
            <LogoutComfirmationModal type={"sidebar"} />
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
