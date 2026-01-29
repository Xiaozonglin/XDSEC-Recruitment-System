import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function InterviewerDashboard() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v2";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const exportUrl = apiBase.startsWith("http")
    ? `${apiBase}/export/applications`
    : `http://${host}:8080${apiBase}/export/applications`;
  return (
    <section>
      <h1>面试官控制台</h1>
      <div className="subnav">
        <Link to="announcements">公告</Link>
        <Link to="candidates">候选人</Link>
        <Link to="tasks">任务</Link>
        <a href={exportUrl} target="_blank" rel="noreferrer">
          导出候选人
        </a>
      </div>
      <Outlet />
    </section>
  );
}
