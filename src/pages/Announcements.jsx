import React, { useEffect, useState } from "react";
import { listAnnouncements } from "../api/announcements.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const visibilityLabel = (item) => {
    if (item.visibility === "interviewer") return "仅面试官可见";
    if (item.visibility === "all") return "仅登录用户可见";
    if (item.visibility === "status") return "指定面试状态可见";
    return "所有人可见";
  };

  useEffect(() => {
    listAnnouncements()
      .then((data) => setItems(data.items || []))
      .catch(() => setError("公告加载失败。"));
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div className="stack-tight">
          <h1 className="page-title">公告</h1>
          <p className="page-subtitle">最新通知、面试安排与重要提醒。</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid single">
        {items.map((item) => (
          <article key={item.id} className={`card ${item.pinned ? "pinned" : ""}`}>
            <div className="card-header">
              <h2>{item.title}</h2>
              {item.pinned && <span className="pill">置顶</span>}
            </div>
            <div className="inline-meta">
              <span>{visibilityLabel(item)}</span>
              <span>{item.authorNickname || "未知"}</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div className="card-body">
              <MarkdownRenderer content={item.content} />
            </div>
          </article>
        ))}
      </div>
      {!items.length && !error && <p className="meta">暂无公告。</p>}
    </section>
  );
}
