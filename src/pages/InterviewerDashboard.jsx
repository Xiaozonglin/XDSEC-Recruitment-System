import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function InterviewerDashboard() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v2";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const exportUrl = apiBase.startsWith("http")
    ? `${apiBase}/export/applications`
    : `http://${host}:8080${apiBase}/export/applications`;
  return (
    <section className="page">
      <Outlet />
    </section>
  );
}
