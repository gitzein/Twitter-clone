import React from "react";
import { longStringChecker } from "../../utils/longStringChecker";
import LoadingSpinner from "./LoadingSpinner";
import { FaRegHeart } from "react-icons/fa";

function OptimisticComment({ textVar, userData }) {
  return (
    <>
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={userData.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1">
          <span className="font-bold">{userData.fullName}</span>

          <div className="flex items-center gap-1 text-gray-700 text-sm">
            <span>@{userData.username}</span>
            <span>·</span>
            <span>Just now</span>
          </div>

          <span className="flex justify-end flex-1">
            <LoadingSpinner size="sm" />
          </span>
        </div>
        <div className="flex flex-1">
          <div className="text-sm flex flex-1 py-2">
            <span className={"" + (longStringChecker(textVar) && "break-all")}>
              {textVar}
            </span>
          </div>
          <div className="flex gap-1 items-center group cursor-pointer">
            <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500" />

            <span
              className={`text-sm text-slate-500 group-hover:text-pink-500 `}
            >
              0
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default OptimisticComment;
