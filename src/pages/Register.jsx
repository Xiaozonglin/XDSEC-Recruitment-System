import React, { useEffect, useState } from "react";
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
    signature: "",
    emailCode: ""
  });
  const [status, setStatus] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    setSending(true);
    setStatus({ message: "正在发送验证码..." });
    try {
      await authApi.requestEmailCode({ email: form.email, purpose: "register" });
      setCooldown(60);
      setStatus({ message: "验证码已发送，请查看邮箱。" });
    } catch (error) {
      setStatus({ message: error.message || "验证码发送失败。" });
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ message: "" });
    try {
      await authApi.register(form);
      await refresh();
      navigate("/login");
    } catch (error) {
      setStatus({ message: error.message || "注册失败。" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-card">
      <div className="stack-tight">
        <h1>注册</h1>
        <p className="page-subtitle">创建账号后即可填写申请与查看任务。</p>
        <div className="divider" />
      </div>
      {status.message && <p className="hint">{status.message}</p>}
      <form onSubmit={onSubmit} className="stack">
        <label>
          邮箱
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <div className="row code-row">
          <label>
            邮箱验证码
            <input
              value={form.emailCode}
              onChange={(event) => setForm({ ...form, emailCode: event.target.value })}
              autoComplete="one-time-code"
              required
            />
          </label>
          <button
            type="button"
            onClick={sendCode}
            disabled={!form.email || sending || cooldown > 0}
          >
            {cooldown > 0 ? `重新发送(${cooldown}s)` : "发送验证码"}
          </button>
        </div>
        <label>
          密码
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label>
          昵称
          <input
            value={form.nickname}
            onChange={(event) => setForm({ ...form, nickname: event.target.value })}
            required
          />
        </label>
        <label>
          个性签名
          <input
            value={form.signature}
            onChange={(event) => setForm({ ...form, signature: event.target.value })}
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={submitting}>注册</button>
        </div>
      </form>
      <div className="form-footer gap-top-md">
        <Link to="/login">已有账号？去登录</Link>
      </div>
    </section>
  );
}
