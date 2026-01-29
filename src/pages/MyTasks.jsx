import React, { useEffect, useState } from "react";
import { listTasks, submitTaskReport } from "../api/tasks.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [report, setReport] = useState({});
  const [status, setStatus] = useState("");

  const loadTasks = () => {
    listTasks({ scope: "mine" })
      .then((data) => setTasks(data.items || []))
      .catch(() => setStatus("任务加载失败。"));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const submitReport = async (taskId) => {
    setStatus("");
    try {
      await submitTaskReport(taskId, { report: report[taskId] || "" });
      setStatus("报告已提交。");
      loadTasks();
    } catch (error) {
      setStatus(error.message || "提交报告失败。");
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div className="stack-tight">
          <h1 className="page-title">我的任务</h1>
          <p className="page-subtitle">查看任务说明并提交最新报告。</p>
        </div>
      </div>
      {status && <p className="hint">{status}</p>}
      <div className="grid single">
        {tasks.map((task) => (
          <article key={task.id} className="card">
            <div className="card-header">
              <div className="stack-tight">
                <h2>{task.title}</h2>
                <div className="inline-meta">
                  <span>分配人 {task.assignedBy}</span>
                  <span>{new Date(task.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <MarkdownRenderer content={task.description} />
              <label className="full">
                报告（支持 Markdown）
                <textarea
                  rows={5}
                  value={report[task.id] || task.report || ""}
                  onChange={(event) =>
                    setReport((prev) => ({ ...prev, [task.id]: event.target.value }))
                  }
                />
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => submitReport(task.id)}>提交报告</button>
              </div>
              {task.report && (
                <div className="stack-tight">
                  <div className="divider" />
                  <h3>最新提交</h3>
                  <MarkdownRenderer content={task.report} />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {!tasks.length && <p className="meta">暂无任务。</p>}
    </section>
  );
}
