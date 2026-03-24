import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import "./MainLayout.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="layout-body">
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div className={`sidebar-wrapper ${sidebarOpen ? "show-sidebar" : ""}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;