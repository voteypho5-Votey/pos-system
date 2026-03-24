import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "./Header.css";

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={onMenuClick}>
          ☰
        </button>
        <h3>MASTERIT POS</h3>
      </div>

      <div className="header-right">
        <span>{user?.name || "User"}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Header;