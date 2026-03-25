import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBoxOpen,
  FaLayerGroup,
  FaChartBar,
  FaCashRegister,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";
import "./Sidebar.css";

function Sidebar() {
  const [openPosMenu, setOpenPosMenu] = useState(true);
  const [openReportMenu, setOpenReportMenu] = useState(true);
  const { user } = useAuthStore();

  return (
    <aside className="sidebar">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "menu-item active" : "menu-item"
        }
      >
        <FaHome className="menu-icon" />
        <span>ផ្ទាំងដើម</span>
      </NavLink>

      {user?.role === "admin" && (
        <>
          <NavLink
            to="/category"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaLayerGroup className="menu-icon" />
            <span>ប្រភេទទំនិញ</span>
          </NavLink>

          <NavLink
            to="/product"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaBoxOpen className="menu-icon" />
            <span>ទំនិញ</span>
          </NavLink>
        </>
      )}

      <div
        className="menu-dropdown"
        onClick={() => setOpenPosMenu(!openPosMenu)}
      >
        <div className="menu-dropdown-left">
          <FaCashRegister className="menu-icon" />
          <span>POS ការលក់</span>
        </div>
        {openPosMenu ? <FaChevronDown /> : <FaChevronRight />}
      </div>

      {openPosMenu && (
        <div className="submenu">
          <NavLink
            to="/sale"
            className={({ isActive }) =>
              isActive ? "submenu-item active-submenu" : "submenu-item"
            }
          >
            បញ្ជីការលក់
          </NavLink>

          <NavLink
            to="/pos"
            className={({ isActive }) =>
              isActive ? "submenu-item active-submenu" : "submenu-item"
            }
          >
            POS
          </NavLink>
        </div>
      )}

      {user?.role === "admin" && (
        <>
          <div
            className="menu-dropdown"
            onClick={() => setOpenReportMenu(!openReportMenu)}
          >
            <div className="menu-dropdown-left">
              <FaChartBar className="menu-icon" />
              <span>របាយការណ៍</span>
            </div>
            {openReportMenu ? <FaChevronDown /> : <FaChevronRight />}
          </div>

          {openReportMenu && (
            <div className="submenu">
              <NavLink
                to="/income-report"
                className={({ isActive }) =>
                  isActive ? "submenu-item active-submenu" : "submenu-item"
                }
              >
                របាយការណ៍ចំណូល
              </NavLink>

              <NavLink
                to="/stock-report"
                className={({ isActive }) =>
                  isActive ? "submenu-item active-submenu" : "submenu-item"
                }
              >
                របាយការណ៍ស្តុក
              </NavLink>

              <NavLink
                to="/report"
                className={({ isActive }) =>
                  isActive ? "submenu-item active-submenu" : "submenu-item"
                }
              >
                Report
              </NavLink>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

export default Sidebar;