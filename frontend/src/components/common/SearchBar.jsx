import React, { useRef } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

function SearchBar({ searchParam, setSearchParam, focusSearch, setFocus }) {
  const searchinputRef = useRef();

  return (
    <div
      className={
        "flex items-center gap-4 w-full rounded-full text-gray-300 pl-5 pr-2 text-base " +
        (focusSearch
          ? "bg-transparent border border-primary opacity-100"
          : "border border-transparent bg-gray-700 opacity-50")
      }
    >
      <FaMagnifyingGlass className={"" + (focusSearch && "text-primary")} />
      <div className="flex items-center w-full">
        <input
          ref={searchinputRef}
          onChange={(e) => setSearchParam(e.target.value)}
          value={searchParam}
          type="text"
          placeholder="Search"
          className={
            " flex flex-1 bg-transparent py-2 " +
            (focusSearch
              ? "outline-none text-neutral-200 placeholder:text-gray-700"
              : "placeholder:text-gray-300")
          }
        />
        {searchParam !== "" && (
          <button
            onClick={() => {
              setFocus(true);
              setSearchParam("");
              searchinputRef.current.focus();
            }}
            className="text-xs text-black bg-primary rounded-full py-[0.2rem] px-[0.375rem] inline-block text-center font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
