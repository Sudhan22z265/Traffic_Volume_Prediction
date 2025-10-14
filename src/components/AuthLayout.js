import React from "react";
import "../styles/auth.css";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <main className="auth-main">
        <h2 className="auth-app-heading">Traffic Volume App</h2>
        <div className="auth-card">
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          <h1 className="auth-title">{title}</h1>
          <div className="auth-form-wrap">
            {children}
          </div>
          {footer}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;


