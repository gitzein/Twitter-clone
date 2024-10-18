import React from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { Outlet } from "react-router-dom";

import Footer from "./Footer";

function Layout() {
  return (
    <>
      <Sidebar />
      <div className="flex-[4_4_0] flex-col border-r border-neutral-700 min-h-screen md:mr-auto">
        <Outlet />
      </div>
      <Footer />
      <RightPanel />
    </>
  );
}

export default Layout;
