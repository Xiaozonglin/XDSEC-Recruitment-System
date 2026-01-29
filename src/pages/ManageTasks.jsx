import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listTasks, createTask, updateTask, deleteTask } from "../api/tasks.js";
import { listUsers, getUser } from "../api/users.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

export default function ManageTasks() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", targetUserId: "" });
  const [status, setStatus] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [editingId, setEditingId] = useState("");

  const load = () => {
    listTasks({ scope: "all" })
      .then((data) => setItems(data.items || []))
      .catch(() => setStatus("任务加载失败。"));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetUserId = params.get("targetUserId");
    if (targetUserId) {
      setForm((prev) => ({ ...prev, targetUserId }));
      setSelectedUserName("");
      getUser(targetUserId)
        .then((user) => setSelectedUserName(user.nickname || user.email || user.id))
        .catch(() => {});
    }
  }, [location.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      listUsers({ role: "interviewee", q: userQuery })
        .then((data) => setUserOptions(data.items || []))
        .catch(() => setStatus("用户搜索失败。"));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [userQuery]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    if (!form.targetUserId) {
      setStatus("请选择目标用户。");
      return;
    }
    try {
      if (editingId) {
        await updateTask(editingId, form);
      } else {
        await createTask(form);
      }
      setForm({ title: "", description: "", targetUserId: "" });
      setSelectedUserName("");
      setEditingId("");
      load();
    } catch (error) {
      setStatus(error.message || (editingId ? "任务更新失败。" : "任务创建失败。"));
    }
  };

  const onEdit = (task) => {
    setForm({
      title: task.title || "",
      description: task.description || "",
      targetUserId: task.targetUserId || ""
    });
    setSelectedUserName(task.targetUserName || task.targetUserId || "");
    setEditingId(task.id);
    setStatus("正在编辑任务，发布后将覆盖原内容。");
  };

  const onDelete = async (taskId) => {
    setStatus("");
    try {
      await deleteTask(taskId);
      load();
    } catch (error) {
      setStatus(error.message || "任务删除失败。");
    }
  };

  return (
    <section>
      <h2>任务管理</h2>
      {status && <p className="hint">{status}</p>}
      <form className="form-card" onSubmit={onSubmit} style={{ marginBottom: "16px" }}>
        <label>
          标题
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </label>
        <label>
          搜索用户（昵称 / 邮箱）
          <input
            value={userQuery}
            onChange={(event) => setUserQuery(event.target.value)}
            placeholder="输入关键词进行搜索"
            autoComplete="off"
          />
        </label>
        {userQuery && userOptions.length > 0 && (
          <div className="search-list">
            {userOptions.map((user) => (
              <button
                key={user.id}
                type="button"
                className="search-option"
                onClick={() => {
                  setForm({ ...form, targetUserId: user.id });
                  setSelectedUserName(user.nickname || user.email || user.id);
                  setUserQuery("");
                  setUserOptions([]);
                }}
              >
                {(user.nickname || "未填写昵称") + " · " + (user.email || "未填写邮箱")}
              </button>
            ))}
          </div>
        )}
        <label>
          目标用户
          <input
            value={selectedUserName}
            placeholder="请通过搜索选择用户"
            readOnly
            className="readonly-field"
          />
        </label>
        <label>
          描述（支持 Markdown）
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
        </label>
        <button type="submit">{editingId ? "发布修改" : "布置任务"}</button>
      </form>

        <div className="grid single">
        {items.map((task) => (
          <article key={task.id} className="card">
            <h3>{task.title}</h3>
            <div className="meta">
              目标 {task.targetUserName || task.targetUserId} · {new Date(task.updatedAt).toLocaleString()}
            </div>
            <MarkdownRenderer content={task.description} />
            {task.report && (
              <>
                <h4>最新报告</h4>
                <MarkdownRenderer content={task.report} />
              </>
            )}
            <div className="row">
              <button type="button" onClick={() => onEdit(task)}>编辑</button>
              <button type="button" onClick={() => onDelete(task.id)}>删除</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
