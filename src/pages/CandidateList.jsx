import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listUsers } from "../api/users.js";
import { gravatarUrl } from "../utils/gravatar.js";

const STATUS_LABELS = {
  r1_pending: "一轮待定",
  r1_passed: "一轮通过",
  r2_pending: "二轮待定",
  r2_passed: "二轮通过",
  rejected: "已拒绝",
  offer: "已录取"
};

export default function CandidateList() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v2";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const exportUrl = apiBase.startsWith("http")
    ? `${apiBase}/export/applications`
    : `http://${host}:8080${apiBase}/export/applications`;

  const load = () => {
    listUsers({ q: query, role: "interviewee" })
      .then((data) => setUsers(data.items || []))
      .catch(() => setStatus("候选人加载失败。"));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const onSearch = (event) => {
    event.preventDefault();
    load();
  };

  return (
    <section className="page">
      <div className="page-header">
        <div className="stack-tight">
          <h1 className="page-title">候选人列表</h1>
          <p className="page-subtitle">搜索、查看候选人状态与方向进度。</p>
        </div>
        <div className="page-actions">
          <a href={exportUrl} className="link-button export-link" target="_blank" rel="noreferrer">
            导出候选人表格
          </a>
        </div>
      </div>
      {status && <p className="hint">{status}</p>}
      <form className="form-card wide form-inline" onSubmit={onSearch}>
        <label>
          <input
            placeholder="按邮箱或昵称搜索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button type="submit" className="nowrap">搜索</button>
      </form>
      <div className="grid two">
        {users.map((user) => (
          <article key={user.id} className="card">
            <div className="stack-tight">
              <h3 className="card-title">{user.nickname || user.email}</h3>
              <div className="row card-identity">
                <img
                  className="avatar"
                  src={gravatarUrl(user.email, 72)}
                  alt={user.nickname || "avatar"}
                />
                <div className="inline-meta stack-tight">
                  <span>{user.signature || "暂无个性签名"}</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <p>面试状态：{STATUS_LABELS[user.status || "r1_pending"]}</p>
              <p>方向：{(user.application?.directions || user.directions || []).join(", ") || "暂无"}</p>
              <p>通过方向：{(user.passedDirections || []).join(", ") || "暂无"}</p>
              <Link to={`${user.id}`} className="action-link">查看详情</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
