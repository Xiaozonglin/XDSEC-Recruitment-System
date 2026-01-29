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
    <section>
      <h2>候选人列表</h2>
      {status && <p className="hint">{status}</p>}
      <form className="row form-card" onSubmit={onSearch}>
        <input
          placeholder="按邮箱或昵称搜索"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" className="nowrap">搜索</button>
      </form>
      <div className="grid single">
        {users.map((user) => (
          <article key={user.id} className="card">
            <div className="row">
              <img
                className="avatar"
                src={gravatarUrl(user.email, 72)}
                alt={user.nickname || "avatar"}
              />
              <div>
                <h3>{user.nickname || user.email}</h3>
                <p className="meta">{user.signature || "暂无个性签名"}</p>
              </div>
            </div>
            <p>面试状态：{STATUS_LABELS[user.status || "r1_pending"]}</p>
            <p>方向：{(user.application?.directions || user.directions || []).join(", ") || "暂无"}</p>
            <p>通过方向：{(user.passedDirections || []).join(", ") || "暂无"}</p>
            <Link to={`${user.id}`}>查看详情</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
