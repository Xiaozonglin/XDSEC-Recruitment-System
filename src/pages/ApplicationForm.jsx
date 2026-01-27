import React, { useEffect, useState } from "react";
import { submitApplication, getMyApplication, deleteMyApplication } from "../api/applications.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

const DIRECTIONS = ["Web", "Pwn", "Reverse", "Crypto", "Misc", "Dev", "Art"];

export default function ApplicationForm() {
  const [form, setForm] = useState({
    realName: "",
    phone: "",
    gender: "",
    department: "",
    major: "",
    studentId: "",
    directions: [],
    resume: ""
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    getMyApplication()
      .then((data) => {
        if (data.application) {
          setForm({ ...data.application });
        }
      })
      .catch(() => {});
  }, []);

  const toggleDirection = (value) => {
    setForm((prev) => {
      const next = prev.directions.includes(value)
        ? prev.directions.filter((item) => item !== value)
        : [...prev.directions, value];
      return { ...prev, directions: next };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await submitApplication(form);
      setStatus("申请已提交。");
    } catch (error) {
      setStatus(error.message || "提交失败。");
    }
  };

  const onDelete = async () => {
    setStatus("");
    if (!window.confirm("确定删除申请吗？此操作不可恢复。")) {
      return;
    }
    try {
      await deleteMyApplication();
      setForm({
        realName: "",
        phone: "",
        gender: "",
        department: "",
        major: "",
        studentId: "",
        directions: [],
        resume: ""
      });
      setStatus("申请已删除。");
    } catch (error) {
      setStatus(error.message || "删除失败。");
    }
  };

  return (
    <section>
      <h1>面试申请</h1>
      {status && <p className="hint">{status}</p>}
      <form className="grid" onSubmit={onSubmit}>
        <label>
          姓名
          <input
            value={form.realName}
            onChange={(event) => setForm({ ...form, realName: event.target.value })}
            required
          />
        </label>
        <label>
          手机号
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
          />
        </label>
        <fieldset>
          <legend>性别</legend>
          <div className="row">
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={form.gender === "male"}
                onChange={(event) => setForm({ ...form, gender: event.target.value })}
                required
              />
              男
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={form.gender === "female"}
                onChange={(event) => setForm({ ...form, gender: event.target.value })}
                required
              />
              女
            </label>
          </div>
        </fieldset>
        <label>
          院系
          <input
            value={form.department}
            onChange={(event) => setForm({ ...form, department: event.target.value })}
            required
          />
        </label>
        <label>
          专业
          <input
            value={form.major}
            onChange={(event) => setForm({ ...form, major: event.target.value })}
            required
          />
        </label>
        <label>
          学号
          <input
            value={form.studentId}
            onChange={(event) => setForm({ ...form, studentId: event.target.value })}
            required
          />
        </label>
        <fieldset>
          <legend>面试方向（可多选）</legend>
          <div className="tags">
            {DIRECTIONS.map((direction) => (
              <label key={direction} className="tag">
                <input
                  type="checkbox"
                  checked={form.directions.includes(direction)}
                  onChange={() => toggleDirection(direction)}
                />
                {direction}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="full">
          简历（支持 Markdown，可选）
          <textarea
            rows={6}
            value={form.resume || ""}
            onChange={(event) => setForm({ ...form, resume: event.target.value })}
          />
        </label>
        <button type="submit">提交申请</button>
        <button type="button" onClick={onDelete}>删除我的申请</button>
      </form>
      <div className="divider" />
      <h2>简历预览</h2>
      <MarkdownRenderer content={form.resume} />
    </section>
  );
}
