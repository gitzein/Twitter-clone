import React from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { longStringChecker } from "../../utils/longStringChecker";
import { LineBreaker } from "../../utils/lineBreaker";

function OptimisticNewPost({ authUser, text, img }) {
  return (
    <div className="flex gap-2 items-start border-b border-neutral-700 px-4 pb-4 mb-4 transition-all duration-300 hover:bg-neutral-950">
      <div className="avatar cursor-wait">
        <div className="w-8 rounded-full overflow-hidden">
          <img src={authUser.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex gap-1 items-center">
          <div className="font-bold cursor-wait hover:underline">
            {authUser.fullName}
          </div>
          <span className="text-gray-700 flex items-center gap-1 text-sm">
            <div>@{authUser.username}</div>
            <span>·</span>
            <span>Just now</span>
          </span>
          <span className="flex justify-end flex-1">
            <LoadingSpinner size="sm" />
          </span>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <span className={"" + (longStringChecker(text) && "break-all")}>
            <LineBreaker string={text} />
          </span>
          {img && (
            <img
              src={img}
              className="h-80 object-contain rounded-lg border border-neutral-700"
              alt=""
            />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div className="flex gap-1 items-center group cursor-wait">
              <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                0
              </span>
            </div>
            <div className="flex gap-1 items-center group cursor-wait">
              <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
              <span className={"text-slate-500 group-hover:text-green-500"}>
                0
              </span>
            </div>
            <div className="flex gap-1 items-center group cursor-wait">
              <FaRegHeart className="w-4 h-4 cursor-wait text-slate-500 group-hover:text-pink-500" />

              <span
                className={"text-sm text-slate-500 group-hover:text-pink-500"}
              >
                0
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <div>
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-wait" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptimisticNewPost;
