import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { gravatarUrl } from "../utils/gravatar.js";
import { listUsers, updateRole, updatePassedDirections, deleteUser, getUser } from "../api/users.js";
import { updateApplicationStatus } from "../api/applications.js";
import { createComment, deleteComment, listComments, updateComment } from "../api/comments.js";
import { listTasks } from "../api/tasks.js";
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

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("");
  const [passedInputs, setPassedInputs] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const displayDirections = useMemo(() => {
    if (!user) return [];
    return user.application?.directions || user.directions || [];
  }, [user]);

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const load = async () => {
    try {
      const [detail, commentData, taskData] = await Promise.all([
        getUser(id),
        listComments(id),
        listTasks({ scope: "all" })
      ]);
      setUser(detail);
      setComments(commentData.items || []);
      const allTasks = taskData.items || [];
      setTasks(allTasks.filter((task) => task.targetUserId === id));
      setPassedInputs(detail.passedDirections || []);
    } catch (error) {
      setStatus(error.message || "候选人详情加载失败。");
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const promote = async () => {
    setStatus("");
    if (!window.confirm("确定将该用户设为面试官吗？此操作不可恢复。")) {
      return;
    }
    try {
      await updateRole(id, "interviewer");
      await load();
    } catch (error) {
      setStatus(error.message || "设置面试官失败。");
    }
  };

  const removeUser = async () => {
    setStatus("");
    if (!window.confirm("确定删除该面试者吗？此操作不可恢复。")) {
      return;
    }
    try {
      await deleteUser(id);
      navigate("/interviewer/candidates");
    } catch (error) {
      setStatus(error.message || "删除用户失败。");
    }
  };

  const updateStatus = async (nextStatus) => {
    setStatus("");
    try {
      await updateApplicationStatus(id, nextStatus);
      await load();
    } catch (error) {
      setStatus(error.message || "更新面试状态失败。");
    }
  };

  const updatePassed = async () => {
    setStatus("");
    if (!window.confirm("一旦提交，无法修改。确认提交通过方向吗？")) {
      return;
    }
    try {
      await updatePassedDirections(id, passedInputs);
      await load();
    } catch (error) {
      setStatus(error.message || "更新通过方向失败。");
    }
  };

  const submitComment = async () => {
    const content = commentInput.trim();
    if (!content) {
      setStatus("评论内容不能为空。");
      return;
    }
    try {
      await createComment({ intervieweeId: id, content });
      setCommentInput("");
      await load();
    } catch (error) {
      setStatus(error.message || "提交评论失败。");
    }
  };

  const canManageComment = (comment) =>
    currentUser?.role === "interviewer" && currentUser?.id === comment.interviewerId;

  const onEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content || "");
  };

  const onSaveComment = async () => {
    if (!editingCommentId) return;
    const content = editingContent.trim();
    if (!content) {
      setStatus("评论内容不能为空。");
      return;
    }
    try {
      await updateComment(editingCommentId, { content });
      setEditingCommentId("");
      setEditingContent("");
      await load();
    } catch (error) {
      setStatus(error.message || "更新评论失败。");
    }
  };

  const onDeleteComment = async (commentId) => {
    if (!window.confirm("确定删除该评论吗？此操作不可恢复。")) {
      return;
    }
    try {
      await deleteComment(commentId);
      await load();
    } catch (error) {
      setStatus(error.message || "删除评论失败。");
    }
  };

  if (!user) {
    return (
      <section>
        <p className="hint">正在加载候选人详情...</p>
        <Link to="/interviewer/candidates">返回候选人列表</Link>
      </section>
    );
  }

  return (
    <section>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2>候选人详情</h2>
      </div>
      {status && <p className="hint">{status}</p>}

      <div className="grid single">
        <article className="card">
          <div>
            <h3 style={{ textAlign: "left" }}>{user.nickname || user.email}</h3>
            <div className="row">
              <img
                className="avatar"
                src={gravatarUrl(user.email, 72)}
                alt={user.nickname || "avatar"}
              />
              <div>
                <p className="meta">{user.email}</p>
                <p className="meta">{user.signature || "暂无个性签名"}</p>
              </div>
            </div>
          </div>
          <p>面试状态：{STATUS_LABELS[user.status || "r1_pending"]}</p>
          <p>方向：{displayDirections.join(", ") || "暂无"}</p>
          <p>通过方向：{(user.passedDirections || []).join(", ") || "暂无"}</p>
          <div className="row">
            <select
              value={user.status || "r1_pending"}
              onChange={(event) => updateStatus(event.target.value)}
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>{STATUS_LABELS[item]}</option>
              ))}
            </select>
              {user.role === "interviewee" && (
              <button type="button" className="nowrap" onClick={promote}>设为面试官</button>
            )}
            <button type="button" className="nowrap" onClick={removeUser}>删除用户</button>
          </div>
        </article>

        <article className="card">
          <h3>设置通过方向</h3>
          {user.passedDirectionsBy && user.passedDirectionsBy.length > 0 && (
            <p className="meta">更新人：{user.passedDirectionsBy.join(", ")}</p>
          )}
          <div className="tags">
            {DIRECTIONS.map((direction) => (
              <label key={direction} className="tag">
                <input
                  type="checkbox"
                  checked={passedInputs.includes(direction)}
                  onChange={() =>
                    setPassedInputs((prev) => {
                      const current = prev || [];
                      const next = current.includes(direction)
                        ? current.filter((item) => item !== direction)
                        : [...current, direction];
                      return next;
                    })
                  }
                />
                {direction}
              </label>
            ))}
          </div>
          <div style={{ marginTop: "12px" }}>
            <button type="button" onClick={updatePassed}>提交通过方向</button>
          </div>
        </article>

        <article className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3>任务完成信息</h3>
            <button type="button" className="link-button" onClick={() => setShowTasks((prev) => !prev)}>
              {showTasks ? "收起" : "展开"}
            </button>
          </div>
          {showTasks && (
            <>
              <Link to={`/interviewer/tasks?targetUserId=${id}`} className="link-button">去布置任务</Link>
              {tasks.length === 0 ? (
                <p className="meta">暂无任务。</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="panel">
                    <h4>{task.title}</h4>
                    <p className="meta">更新时间 {formatDate(task.updatedAt || task.createdAt)}</p>
                    <MarkdownRenderer content={task.description || ""} />
                    {task.report && (
                      <>
                        <p className="meta">任务报告</p>
                        <MarkdownRenderer content={task.report} />
                      </>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </article>

        {user.application && (
          <article className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>简历与报名信息</h3>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowApplication((prev) => !prev)}
              >
                {showApplication ? "收起" : "展开"}
              </button>
            </div>
            {showApplication && (
              <>
                <p><strong>姓名：</strong> {user.application.realName}</p>
                <p><strong>手机号：</strong> {user.application.phone}</p>
                <p><strong>性别：</strong> {user.application.gender === "male" ? "男" : "女"}</p>
                <p><strong>院系：</strong> {user.application.department}</p>
                <p><strong>专业：</strong> {user.application.major}</p>
                <p><strong>学号：</strong> {user.application.studentId}</p>
                <p><strong>方向：</strong> {(user.application.directions || []).join(", ")}</p>
                <MarkdownRenderer content={user.application.resume || ""} />
              </>
            )}
          </article>
        )}

        <article className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3>评论</h3>
            <button type="button" className="link-button" onClick={() => setShowComments((prev) => !prev)}>
              {showComments ? "收起" : "展开"}
            </button>
          </div>
          {showComments && (
            <>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={comment.id}>
                    <div className="panel">
                      {editingCommentId === comment.id ? (
                        <>
                          <textarea
                            rows={3}
                            value={editingContent}
                            onChange={(event) => setEditingContent(event.target.value)}
                          />
                          <div className="row">
                            <button type="button" onClick={onSaveComment}>保存修改</button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId("");
                                setEditingContent("");
                              }}
                            >
                              取消
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <MarkdownRenderer content={comment.content || ""} />
                          <p className="meta">
                            {comment.interviewerName || "面试官"} · {formatDate(comment.updatedAt || comment.createdAt)}
                          </p>
                          {canManageComment(comment) && (
                            <div className="row">
                              <button type="button" onClick={() => onEditComment(comment)}>编辑</button>
                              <button type="button" onClick={() => onDeleteComment(comment.id)}>删除</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {index < comments.length - 1 && <div className="divider" />}
                  </div>
                ))
              ) : (
                <p className="meta">暂无评论</p>
              )}
            <div className="divider" />
            <textarea
              rows={3}
              placeholder="写下评价或备注"
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              style={{ marginTop: "12px", marginBottom: "12px" }}
            />
            <button type="button" onClick={submitComment}>提交评论</button>
          </>
        )}
      </article>
      </div>
    </section>
  );
}
