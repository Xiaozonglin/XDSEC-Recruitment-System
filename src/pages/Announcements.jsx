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
    <section>
      <h1>公告</h1>
      {error && <p className="error">{error}</p>}
      <div className="grid single">
        {items.map((item) => (
          <article key={item.id} className={`card ${item.pinned ? "pinned" : ""}`}>
            <h2>{item.title}</h2>
            <div className="meta">
              {visibilityLabel(item)} · 发布人 {item.authorNickname || "未知"} · {new Date(item.createdAt).toLocaleString()}
            </div>
            <MarkdownRenderer content={item.content} />
          </article>
        ))}
      </div>
      {!items.length && !error && <p>暂无公告。</p>}
    </section>
  );
}
