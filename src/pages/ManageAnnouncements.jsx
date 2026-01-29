import React, { useEffect, useState } from "react";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  pinAnnouncement,
  deleteAnnouncement
} from "../api/announcements.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

export default function ManageAnnouncements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    visibility: "public",
    allowedStatuses: []
  });
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("");
  const STATUS_LABELS = {
    r1_pending: "一轮待定",
    r1_passed: "一轮通过",
    r2_pending: "二轮待定",
    r2_passed: "二轮通过",
    rejected: "已拒绝",
    offer: "已录取"
  };
  const STATUSES = Object.keys(STATUS_LABELS);
  const visibilityLabel = (item) => {
    if (item.visibility === "interviewer") return "仅面试官可见";
    if (item.visibility === "all") return "仅登录用户可见";
    if (item.visibility === "status") return "指定面试状态可见";
    return "所有人可见";
  };

  const load = () => {
    listAnnouncements()
      .then((data) => setItems(data.items || []))
      .catch(() => setStatus("公告加载失败。"));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
      } else {
        await createAnnouncement(form);
      }
      setForm({ title: "", content: "", visibility: "public", allowedStatuses: [] });
      setEditingId("");
      load();
    } catch (error) {
      setStatus(error.message || (editingId ? "更新公告失败。" : "创建公告失败。"));
    }
  };

  const onEdit = (item) => {
    setForm({
      title: item.title || "",
      content: item.content || "",
      visibility: item.visibility || "public",
      allowedStatuses: item.allowedStatuses || []
    });
    setEditingId(item.id);
    setStatus("正在编辑公告，发布后将覆盖原内容。");
  };

  const onPin = async (id, pinned) => {
    setStatus("");
    try {
      await pinAnnouncement(id, pinned);
      load();
    } catch (error) {
      setStatus(error.message || "置顶设置失败。");
    }
  };

  const onDelete = async (id) => {
    setStatus("");
    try {
      await deleteAnnouncement(id);
      load();
    } catch (error) {
      setStatus(error.message || "删除公告失败。");
    }
  };

  return (
    <section>
      <h2>公告管理</h2>
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
          内容（支持 Markdown）
          <textarea
            rows={5}
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            required
          />
        </label>
        <label>
          可见范围
          <select
            value={form.visibility}
            onChange={(event) =>
              setForm({
                ...form,
                visibility: event.target.value,
                allowedStatuses: event.target.value === "status" ? form.allowedStatuses : []
              })
            }
          >
            <option value="public">所有人可见</option>
            <option value="all">仅登录用户可见</option>
            <option value="interviewer">仅面试官可见</option>
            <option value="status">指定面试状态的面试者可见</option>
          </select>
        </label>
        {form.visibility === "status" && (
          <fieldset>
            <legend>可见面试状态</legend>
            <div className="tags">
              {STATUSES.map((item) => (
                <label key={item} className="tag">
                  <input
                    type="checkbox"
                    checked={form.allowedStatuses.includes(item)}
                    onChange={() =>
                      setForm((prev) => {
                        const current = prev.allowedStatuses || [];
                        const next = current.includes(item)
                          ? current.filter((value) => value !== item)
                          : [...current, item];
                        return { ...prev, allowedStatuses: next };
                      })
                    }
                  />
                  {STATUS_LABELS[item]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div style={{ marginTop: "12px" }}>
          <button type="submit">{editingId ? "发布修改" : "发布"}</button>
        </div>
      </form>

      <div className="grid single">
        {items.map((item) => (
          <article key={item.id} className={`card ${item.pinned ? "pinned" : ""}`}>
            <h3>{item.title}</h3>
            <div className="meta">
              {visibilityLabel(item)} · 发布人 {item.authorNickname || "未知"} · {new Date(item.updatedAt).toLocaleString()}
            </div>
            <MarkdownRenderer content={item.content} />
            <div className="row">
              <button type="button" onClick={() => onPin(item.id, !item.pinned)}>
                {item.pinned ? "取消置顶" : "置顶"}
              </button>
              <button type="button" onClick={() => onEdit(item)}>
                编辑
              </button>
              <button type="button" onClick={() => onDelete(item.id)}>
                删除
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
