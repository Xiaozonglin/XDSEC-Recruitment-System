import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "登录失败");
    }
  };

  return (
    <section className="form-card">
      <div className="stack-tight">
        <h1>登录</h1>
        <p className="page-subtitle">欢迎回来，继续你的面试流程。</p>
        <div className="divider" />
      </div>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit} className="stack">
        <label>
          账号（邮箱或昵称）
          <input
            value={form.id}
            onChange={(event) => setForm({ ...form, id: event.target.value })}
            autoComplete="username"
            required
          />
        </label>
        <label>
          密码
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            autoComplete="current-password"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit">登录</button>
        </div>
      </form>
      <div className="form-footer gap-top-md">
        <Link to="/forgot-password">忘记密码？去重置</Link>
        <Link to="/register" className="align-right">注册账号</Link>
      </div>
    </section>
  );
}
