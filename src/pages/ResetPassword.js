import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      // Placeholder: perform password reset
      await new Promise((res) => setTimeout(res, 800));
      setMessage("Password reset successfully");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setMessage("Failed to reset password");
    }
    setSubmitting(false);
  };

  return (
    <AuthLayout subtitle={email ? `Resetting for ${email}` : "Set your new password"} title="Reset password">
      <form onSubmit={handleSubmit}>
        <div className="auth-row">
          <label className="auth-label">New password</label>
          <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="auth-row">
          <label className="auth-label">Confirm password</label>
          <input className="auth-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <button className="auth-button" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save new password"}</button>
      </form>
      {message && (
        <p style={{ marginTop: 12, color: "#374151" }}>{message}</p>
      )}
    </AuthLayout>
  );
}

export default ResetPassword;


