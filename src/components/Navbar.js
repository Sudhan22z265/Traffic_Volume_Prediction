import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const hideOnAuthPages = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);
  if (hideOnAuthPages) return null;

  const navStyle = {
    padding: "0.7rem 2rem",
    borderBottom: "1px solid #e5e5e5",
    background: "#f4f8fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  };
  const leftStyle = { display: "flex", alignItems: "center", gap: 18 };
  const rightStyle = { display: "flex", alignItems: "center", gap: 14 };
  const linkStyle = {
    color: "#1976d2",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 17,
    padding: "6px 14px",
    borderRadius: 5,
    transition: "background 0.2s",
    marginRight: 0,
    position: "relative"
  };
  const linkHoverStyle = {
    background: "#e3eafc"
  };
  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 700,
    fontSize: 20,
    color: "#2d3e50",
    textDecoration: "none"
  };
  const buttonStyle = {
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    padding: "7px 18px",
    fontWeight: 500,
    fontSize: 16,
    cursor: "pointer",
    marginLeft: 8,
    transition: "background 0.2s"
  };

  // Simple hover effect for links
  const [hovered, setHovered] = React.useState("");

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link to="/" style={logoStyle}>
          <img src="https://img.icons8.com/color/32/traffic-jam.png" alt="Logo" style={{ verticalAlign: "middle" }} />
          TrafficPredict
        </Link>
        {isAuthenticated && (
          <Link
            to="/"
            style={{ ...linkStyle, ...(hovered === "home" ? linkHoverStyle : {}) }}
            onMouseEnter={() => setHovered("home")}
            onMouseLeave={() => setHovered("")}
          >Home</Link>
        )}
        {isAuthenticated && (
          <Link
            to="/predict"
            style={{ ...linkStyle, ...(hovered === "predict" ? linkHoverStyle : {}) }}
            onMouseEnter={() => setHovered("predict")}
            onMouseLeave={() => setHovered("")}
          >Predict</Link>
        )}
      </div>
      <div style={rightStyle}>
        {!isAuthenticated && (
          <Link
            to="/login"
            style={{ ...linkStyle, ...(hovered === "login" ? linkHoverStyle : {}) }}
            onMouseEnter={() => setHovered("login")}
            onMouseLeave={() => setHovered("")}
          >Login</Link>
        )}
        {!isAuthenticated && (
          <Link
            to="/signup"
            style={{ ...linkStyle, ...(hovered === "signup" ? linkHoverStyle : {}) }}
            onMouseEnter={() => setHovered("signup")}
            onMouseLeave={() => setHovered("")}
          >Sign Up</Link>
        )}
        {isAuthenticated && (
          <button
            onClick={logout}
            style={buttonStyle}
            onMouseEnter={e => (e.target.style.background = "#b71c1c")}
            onMouseLeave={e => (e.target.style.background = "#d32f2f")}
          >Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;


