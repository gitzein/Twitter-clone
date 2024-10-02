import React from "react";
import Posts from "../../components/common/Posts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function BookmarksPage() {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen ">
      <div className="flex gap-10 px-4 py-2 items-center border-b border-gray-700">
        <Link to={-1}>
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col">
          <span className="text-lg font-bold">Bookmarks</span>
          <p className="text-sm text-gray-500">@{authUser.username}</p>
        </div>
      </div>
      <Posts feedType="save" />
    </div>
  );
}

export default BookmarksPage;
