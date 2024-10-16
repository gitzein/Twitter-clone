import React from "react";
import SearchBar from "./SearchBar";
import SearchList from "./SearchList";

function Search({
  searchRef,
  searchParam,
  setSearchParam,
  focusSearch,
  setFocusSearch,
}) {
  return (
    <div
      ref={searchRef}
      onFocus={() => setFocusSearch(true)}
      className="sticky top-0 py-2 bg-black"
    >
      <div className="flex flex-col min-w-80">
        <div className="relative">
          <SearchBar
            searchParam={searchParam}
            setSearchParam={setSearchParam}
            focusSearch={focusSearch}
            setFocus={setFocusSearch}
          />
        </div>
        <div className="absolute z-20 top-14 w-full shadow-md shadow-neutral-500 rounded-lg">
          {focusSearch && <SearchList searchParam={searchParam} />}
        </div>
      </div>
    </div>
  );
}

export default Search;
