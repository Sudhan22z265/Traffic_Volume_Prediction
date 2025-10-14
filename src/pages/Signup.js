import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      // Placeholder signup request
      await new Promise((res) => setTimeout(res, 700));
      setMessage("Account created successfully");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setMessage("Signup failed");
    }
    setSubmitting(false);
  };

  return (
    <AuthLayout
      subtitle="Create your account"
      title="Sign up"
      footer={
        <div className="auth-footer">
          Already have an account? <Link className="auth-link" to="/login">Sign in</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="auth-row">
          <label className="auth-label">Name</label>
          <input className="auth-input" type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="auth-row">
          <label className="auth-label">Email address</label>
          <input className="auth-input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="auth-row">
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="auth-row">
          <label className="auth-label">Confirm password</label>
          <input className="auth-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
        </div>
        <button className="auth-button" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create account"}</button>
      </form>
      {message && (
        <p style={{ marginTop: 12, color: "#374151" }}>{message}</p>
      )}
    </AuthLayout>
  );
}

export default Signup;


