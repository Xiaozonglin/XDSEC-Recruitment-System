import React, { useEffect, useState } from "react";
import { listUsers, updateRole, updatePassedDirections, deleteUser } from "../api/users.js";
import { gravatarUrl } from "../utils/gravatar.js";
import { updateApplicationStatus } from "../api/applications.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

const STATUSES = [
  "r1_pending",
  "r1_passed",
  "r2_pending",
  "r2_passed",
  "rejected",
  "offer"
];
const STATUS_LABELS = {
  r1_pending: "一轮待定",
  r1_passed: "一轮通过",
  r2_pending: "二轮待定",
  r2_passed: "二轮通过",
  rejected: "已拒绝",
  offer: "已录取"
};
const DIRECTIONS = ["Web", "Pwn", "Reverse", "Crypto", "Misc", "Dev", "Art"];

export default function CandidateList() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [passedInputs, setPassedInputs] = useState({});

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

  const promote = async (userId) => {
    setStatus("");
    try {
      await updateRole(userId, "interviewer");
      load();
    } catch (error) {
      setStatus(error.message || "设置面试官失败。");
    }
  };

  const removeUser = async (userId) => {
    setStatus("");
    if (!window.confirm("确定删除该面试者吗？此操作不可恢复。")) {
      return;
    }
    try {
      await deleteUser(userId);
      load();
    } catch (error) {
      setStatus(error.message || "删除用户失败。");
    }
  };

  const updateStatus = async (userId, nextStatus) => {
    setStatus("");
    try {
      await updateApplicationStatus(userId, nextStatus);
      load();
    } catch (error) {
      setStatus(error.message || "更新面试状态失败。");
    }
  };

  const updatePassed = async (userId) => {
    setStatus("");
    const directions = passedInputs[userId] || [];
    if (!window.confirm("一旦提交，无法修改。确认提交通过方向吗？")) {
      return;
    }
    try {
      await updatePassedDirections(userId, directions);
      setPassedInputs((prev) => ({ ...prev, [userId]: [] }));
      load();
    } catch (error) {
      setStatus(error.message || "更新通过方向失败。");
    }
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
      <div className="grid two">
        {users.map((user) => (
          <article key={user.id} className="card">
            <header className="row candidate-header">
              <div className="row candidate-main">
                <img
                  className="avatar candidate-avatar"
                  src={gravatarUrl(user.email, 72)}
                  alt={user.nickname || "avatar"}
                />
                <div>
                  <h3>{user.nickname || user.email}</h3>
                  <p className="meta">
                    {user.email} · {STATUS_LABELS[user.status || "r1_pending"]}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => promote(user.id)}>设为面试官</button>
              <button type="button" onClick={() => removeUser(user.id)}>删除用户</button>
            </header>
            {user.application && (
              <div className="panel">
                <p><strong>姓名：</strong> {user.application.realName}</p>
                <p><strong>手机号：</strong> {user.application.phone}</p>
                <p><strong>性别：</strong> {user.application.gender === "male" ? "男" : "女"}</p>
                <p><strong>院系：</strong> {user.application.department}</p>
                <p><strong>专业：</strong> {user.application.major}</p>
                <p><strong>学号：</strong> {user.application.studentId}</p>
                <p><strong>方向：</strong> {(user.application.directions || []).join(", ")}</p>
                <MarkdownRenderer content={user.application.resume || ""} />
              </div>
            )}
            <div className="panel">
              <p><strong>已通过方向：</strong> {(user.passedDirections || []).join(", ") || "暂无"}</p>
              {user.passedDirectionsBy && user.passedDirectionsBy.length > 0 && (
                <p className="meta">更新人：{user.passedDirectionsBy.join(", ")}</p>
              )}
              <fieldset>
                <legend>设置通过方向</legend>
                <div className="tags">
                  {DIRECTIONS.map((direction) => (
                    <label key={direction} className="tag">
                      <input
                        type="checkbox"
                        checked={(passedInputs[user.id] || []).includes(direction)}
                        onChange={() =>
                          setPassedInputs((prev) => {
                            const current = prev[user.id] || [];
                            const next = current.includes(direction)
                              ? current.filter((item) => item !== direction)
                              : [...current, direction];
                            return { ...prev, [user.id]: next };
                          })
                        }
                      />
                      {direction}
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => updatePassed(user.id)}>
                  提交通过方向
                </button>
              </fieldset>
            </div>
            <div className="row">
              <select
                value={user.status || "r1_pending"}
                onChange={(event) => updateStatus(user.id, event.target.value)}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>{STATUS_LABELS[item]}</option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
