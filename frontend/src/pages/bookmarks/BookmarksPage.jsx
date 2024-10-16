import React from "react";
import Posts from "../../components/common/Posts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function BookmarksPage() {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="flex-[4_4_0]">
      <div className="flex gap-10 px-4 py-2 items-center border-b border-neutral-700 sticky top-0 bg-[rgb(0,0,0,0.6)] backdrop-blur-md">
        <Link to={-1} className="p-3 rounded-full hover:bg-neutral-900">
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col">
          <span className="font-bold text-xl">Bookmarks</span>
          <span className="text-neutral-500 text-xs">@{authUser.username}</span>
        </div>
      </div>
      <div className=" mb-4 w-full"></div>
      <Posts feedType="save" />
    </div>
  );
}

export default BookmarksPage;
