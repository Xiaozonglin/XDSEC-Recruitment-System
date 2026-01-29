import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const THEME_KEY = "xdsec_theme";
const ACCENT_KEY = "xdsec_accent";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => window.localStorage.getItem(THEME_KEY) || "system");
  const [accent, setAccent] = useState(() => window.localStorage.getItem(ACCENT_KEY) || "default");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (accent === "default") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", accent);
    }
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-left">
          <Link to="/">XDSEC 招新</Link>
          <Link to="/announcements">公告</Link>
          {user && <Link to="/profile">个人资料</Link>}
          {user && <Link to="/directory">成员目录</Link>}
          {user?.role === "interviewee" && <Link to="/application">填写申请</Link>}
          {user?.role === "interviewee" && <Link to="/tasks">我的任务</Link>}
          {user?.role === "interviewer" && <Link to="/interviewer">面试官控制台</Link>}
        </div>
        <div className="nav-right">
          <label className="theme-select">
            <select value={accent} onChange={(event) => setAccent(event.target.value)}>
              <option value="default">浅薰衣草</option>
              <option value="mist">海盐烟蓝</option>
              <option value="sage">浅鼠尾草</option>
              <option value="peach">柔光杏橙</option>
            </select>
          </label>
          <label className="theme-select">
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              <option value="system">跟随系统</option>
              <option value="light">浅色模式</option>
              <option value="dark">深色模式</option>
            </select>
          </label>
          {user ? (
            <>
              <span className="role">
                <span className="role-label">
                  {user.role === "interviewer" ? "面试官" : "面试者"}
                </span>
                {user?.nickname && (
                  <>
                    <span className="role-sep"> | </span>
                    <span
                      className={
                        /[\u4e00-\u9fff]/.test(user.nickname)
                          ? "role-nickname serif"
                          : "role-nickname sans"
                      }
                    >
                      {user.nickname}
                    </span>
                  </>
                )}
              </span>
              <button type="button" onClick={logout} className="link-button">退出登录</button>
            </>
          ) : (
            <>
              <Link to="/login">登录</Link>
              <Link to="/register">注册</Link>
            </>
          )}
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>XDSEC © 2026</span>
          <span className="footer-sep">|</span>
          <a
            href="https://github.com/CopperKoi/XDSEC-Recruitment-System"
            target="_blank"
            rel="noreferrer"
          >
            前端仓库
          </a>
          <span className="footer-sep">|</span>
          <a
            href="https://github.com/Xiaozonglin/xdsec-join-2026"
            target="_blank"
            rel="noreferrer"
          >
            后端仓库
          </a>
        </div>
      </footer>
    </div>
  );
}
