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
      <div className="flex-[4_4_0] flex-col border-r border-neutral-700 min-h-screen mr-auto">
        {showSearch && (
          <div className=" px-2 sticky top-0 bg-[rgb(0,0,0,0.6)] backdrop-blur-md fadeInAnimation lg:hidden z-50">
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
