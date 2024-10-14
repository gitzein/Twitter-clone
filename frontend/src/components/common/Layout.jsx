import React, { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { Outlet } from "react-router-dom";
import Search from "./Search";
import useOutsideClick from "../../hooks/useOutsideClick";

function Layout() {
  const [searchParam, setSearchParam] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchBarRef = useRef();

  useOutsideClick(searchBarRef, () => setFocusSearch(false));

  return (
    <>
      <Sidebar setShowBar={setShowSearch} showSearch={showSearch} />
      <div className="flex-[4_4_0] flex-col">
        {showSearch && (
          <div className=" border-r border-gray-700 px-2 bg-black z-50 sticky top-0 fadeInAnimation lg:hidden">
            <Search
              searchRef={searchBarRef}
              searchParam={searchParam}
              setSearchParam={setSearchParam}
              focusSearch={focusSearch}
              setFocusSearch={setFocusSearch}
            />
          </div>
        )}
        <Outlet />
      </div>
      <RightPanel />
    </>
  );
}

export default Layout;
