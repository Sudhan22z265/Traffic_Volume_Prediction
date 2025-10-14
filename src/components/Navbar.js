import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const hideOnAuthPages = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);
  if (hideOnAuthPages) return null;
  const linkStyle = { marginRight: 12 };
  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #e5e5e5" }}>
      {isAuthenticated && <Link to="/" style={linkStyle}>Home</Link>}
      {isAuthenticated && <Link to="/predict" style={linkStyle}>Predict</Link>}
      {!isAuthenticated && <Link to="/login" style={linkStyle}>Login</Link>}
      {!isAuthenticated && <Link to="/signup" style={linkStyle}>Sign Up</Link>}
      {isAuthenticated && (
        <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
      )}
    </nav>
  );
}

export default Navbar;


