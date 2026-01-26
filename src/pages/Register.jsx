import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    password: "",
    email: "",
    nickname: "",
    signature: ""
  });
  const [status, setStatus] = useState({ loading: false, message: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: "" });
    try {
      await authApi.register(form);
      await refresh();
      navigate("/login");
    } catch (error) {
      setStatus({ loading: false, message: error.message || "Registration failed." });
    }
  };

  return (
    <section className="form-card">
      <h1>Register</h1>
      {status.message && <p className="hint">{status.message}</p>}
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label>
          Nickname
          <input
            value={form.nickname}
            onChange={(event) => setForm({ ...form, nickname: event.target.value })}
            required
          />
        </label>
        <label>
          Signature
          <input
            value={form.signature}
            onChange={(event) => setForm({ ...form, signature: event.target.value })}
            required
          />
        </label>
        <button type="submit" disabled={status.loading}>Register</button>
      </form>
      <div className="form-footer">
        <Link to="/login">Already have an account?</Link>
      </div>
    </section>
  );
}
