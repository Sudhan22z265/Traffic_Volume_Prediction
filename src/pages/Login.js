import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const staticEmail = "tvp@gmail.com";
    const staticPassword = "tvp";
    await new Promise((res) => setTimeout(res, 600));
    if (form.email === staticEmail && form.password === staticPassword) {
      // Store in localStorage for persistent auth
      localStorage.setItem("tvp_auth", JSON.stringify({ email: staticEmail, authenticated: true }));
      login(form.email);
  navigate("/", { replace: true });
    } else {
      setMessage("Invalid email or password");
    }
    setSubmitting(false);
  };

  return (
    <AuthLayout
      subtitle="Please enter your details"
      title="Welcome back"
      footer={
        <div className="auth-footer">
          Don’t have an account? <Link className="auth-link" to="/signup">Sign up</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="auth-row">
          <label className="auth-label">Email address</label>
          <input className="auth-input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="auth-row">
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="auth-actions" style={{ justifyContent: "flex-end" }}>
          <Link className="auth-link" to="/forgot-password">Forgot password</Link>
        </div>
        <button className="auth-button" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
      </form>
      {message && (
        <p style={{ marginTop: 12, color: "#374151" }}>{message}</p>
      )}
    </AuthLayout>
  );
}

export default Login;


