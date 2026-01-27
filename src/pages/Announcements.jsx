import React, { useEffect, useState } from "react";
import { listAnnouncements } from "../api/announcements.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listAnnouncements()
      .then((data) => setItems(data.items || []))
      .catch(() => setError("公告加载失败。"));
  }, []);

  return (
    <section>
      <h1>公告</h1>
      {error && <p className="error">{error}</p>}
      {items.map((item) => (
        <article key={item.id} className={`card ${item.pinned ? "pinned" : ""}`}>
          <h2>{item.title}</h2>
          <div className="meta">发布人 {item.authorNickname || "未知"} · {new Date(item.createdAt).toLocaleString()}</div>
          <MarkdownRenderer content={item.content} />
        </article>
      ))}
      {!items.length && !error && <p>暂无公告。</p>}
    </section>
  );
}
