import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      // Placeholder request: send reset email
      await new Promise((res) => setTimeout(res, 700));
      setMessage("If an account exists, a reset link has been sent.");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 800);
    } catch (err) {
      setMessage("Failed to send reset link");
    }
    setSubmitting(false);
  };

  return (
    <AuthLayout subtitle="Reset your password" title="Forgot password">
      <form onSubmit={handleSubmit}>
        <div className="auth-row">
          <label className="auth-label">Email address</label>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className="auth-button" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send reset link"}</button>
      </form>
      {message && (
        <p style={{ marginTop: 12, color: "#374151" }}>{message}</p>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;


