import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import * as authApi from "../api/auth.js";
import { updateProfile, deleteMe } from "../api/users.js";

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: "",
    nickname: "",
    signature: "",
    emailCode: ""
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (user) {
      setProfile({
        email: user.email || "",
        nickname: user.nickname || "",
        signature: user.signature || "",
        emailCode: ""
      });
    }
  }, [user]);

  const sendCode = async () => {
    setSending(true);
    setStatus("正在发送验证码...");
    try {
      await authApi.requestEmailCode({ email: profile.email, purpose: "profile" });
      setCooldown(60);
      setStatus("验证码已发送。");
    } catch (error) {
      setStatus(error.message || "验证码发送失败。");
    } finally {
      setSending(false);
    }
  };
  const onSaveProfile = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await updateProfile(profile);
      await refresh();
      setStatus("个人资料已更新。");
    } catch (error) {
      setStatus(error.message || "更新个人资料失败。");
    }
  };

  const onChangePassword = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await authApi.changePassword(passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setStatus("密码已更新。");
    } catch (error) {
      setStatus(error.message || "修改密码失败。");
    }
  };

  const onDeleteAccount = async () => {
    setStatus("");
    if (!window.confirm("确定删除账号吗？此操作不可恢复。")) {
      return;
    }
    try {
      await deleteMe();
      await logout();
      navigate("/register");
    } catch (error) {
      setStatus(error.message || "删除账号失败。");
    }
  };

  return (
    <section className="form-card">
      <h1>个人资料</h1>
      {status && <p className="hint">{status}</p>}
      <form onSubmit={onSaveProfile}>
        <label>
          邮箱
          <input
            type="email"
            value={profile.email}
            onChange={(event) => setProfile({ ...profile, email: event.target.value })}
            required
          />
        </label>
        <div className="row">
          <label>
            邮箱验证码
            <input
              value={profile.emailCode}
              onChange={(event) => setProfile({ ...profile, emailCode: event.target.value })}
              required
            />
          </label>
          <button
            type="button"
            onClick={sendCode}
            disabled={!profile.email || sending || cooldown > 0}
          >
            {cooldown > 0 ? `重新发送(${cooldown}s)` : "发送验证码"}
          </button>
        </div>
        <label>
          昵称
          <input
            value={profile.nickname}
            onChange={(event) => setProfile({ ...profile, nickname: event.target.value })}
            required
          />
        </label>
        <label>
          个性签名
          <input
            value={profile.signature}
            onChange={(event) => setProfile({ ...profile, signature: event.target.value })}
          />
        </label>
        <button type="submit">保存资料</button>
      </form>

      <div className="divider" />

      <form onSubmit={onChangePassword}>
        <h2>修改密码</h2>
        <label>
          旧密码
          <input
            type="password"
            value={passwordForm.oldPassword}
            onChange={(event) => setPasswordForm({ ...passwordForm, oldPassword: event.target.value })}
            required
          />
        </label>
        <label>
          新密码
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
            required
          />
        </label>
        <button type="submit">更新密码</button>
      </form>

      <div className="divider" />

      <div>
        <h2>注销账号</h2>
        <p className="meta">此操作将删除你的账号与所有数据，无法恢复。</p>
        <button type="button" onClick={onDeleteAccount}>删除我的账号</button>
      </div>
    </section>
  );
}
