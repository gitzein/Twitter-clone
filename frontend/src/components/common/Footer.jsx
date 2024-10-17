import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBell,
  FaBookmark,
  FaRegBell,
  FaRegBookmark,
  FaRegUser,
  FaUser,
} from "react-icons/fa";
import { BsHouseDoor, BsHouseDoorFill } from "react-icons/bs";
import LogoutComfirmationModal from "./LogoutComfirmationModal";
import { useQuery } from "@tanstack/react-query";
import SearchModal from "./SearchModal";

function Footer() {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  let location = useLocation();
  return (
    <div className="flex min-w-full py-2 z-50 md:hidden fixed bottom-0 bg-black border-t border-neutral-700">
      <ul className="flex justify-between w-full px-6">
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
          </Link>
        </li>
        <li className="flex justify-center lg:hidden items-center">
          <div className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500  lg:pl-2 lg:pr-4  max-w-fit cursor-pointer">
            <SearchModal type={"footer"} />
          </div>
        </li>
        <li className="flex justify-center lg:hidden items-center">
          <div className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-500  lg:pl-2 lg:pr-4  max-w-fit cursor-pointer">
            <LogoutComfirmationModal type={"footer"} />
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Footer;
