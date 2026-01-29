import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function InterviewerDashboard() {
  return (
    <section>
      <h1>面试官控制台</h1>
      <div className="subnav">
        <Link to="announcements">公告</Link>
        <Link to="candidates">候选人</Link>
        <Link to="tasks">任务</Link>
      </div>
      <Outlet />
    </section>
  );
}
