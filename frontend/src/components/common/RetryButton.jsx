import React from "react";
import { MdOutlineRefresh } from "react-icons/md";

function RetryButton({ onClickHandler }) {
  return (
    <button
      className="px-2 py-1 rounded-full bg-primary text-base w-fit hover:bg-sky-400"
      onClick={onClickHandler}
    >
      <span className="flex gap-1 text-center text-slate-200 items-center">
        Retry
        <MdOutlineRefresh />
      </span>
    </button>
  );
}

export default RetryButton;
