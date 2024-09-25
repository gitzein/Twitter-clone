import React from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Sidebar />
      <Outlet />
      <RightPanel />
    </>
  );
}

export default Layout;
