import { request } from "./client.js";

export function listUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/users/${query ? `?${query}` : ""}`).then((data) => {
    const items = data?.data?.items || [];
    return {
      ...data,
      items: items.map((user) => normalizeUser(user))
    };
  });
}

function parseJsonField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.startsWith("[")) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function normalizeUser(user) {
  const application = user.application
    ? {
        realName: user.application.real_name || user.application.realName,
        phone: user.application.phone,
        gender: user.application.gender,
        department: user.application.department,
        major: user.application.major,
        studentId: user.application.student_id || user.application.studentId,
        directions: parseJsonField(user.application.directions),
        resume: user.application.resume
      }
    : null;
  const comments = Array.isArray(user.comments)
    ? user.comments.map((comment) => ({
        ...comment,
        id: comment.uuid || comment.id,
        intervieweeId: comment.interviewee_id || comment.intervieweeId,
        interviewerId: comment.interviewer_id || comment.interviewerId,
        interviewerName: comment.interviewer_name || comment.interviewerName,
        createdAt: comment.created_at || comment.createdAt
      }))
    : [];
  const task = user.task
    ? {
        ...user.task,
        id: user.task.uuid || user.task.id,
        createdAt: user.task.created_at || user.task.createdAt,
        updatedAt: user.task.updated_at || user.task.updatedAt
      }
    : null;

  return {
    ...user,
    id: user.uuid || user.id,
    email: user.email,
    application,
    passedDirections: parseJsonField(user.passed_directions || user.passedDirections),
    passedDirectionsBy: parseJsonField(user.passed_directions_by || user.passedDirectionsBy),
    comments,
    task
  };
}

export function getUser(userId) {
  return request(`/users/${userId}`).then((data) => {
    const user = data?.data?.user || data?.user || data;
    return normalizeUser(user);
  });
}

export function updateProfile(payload) {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function updateRole(userId, role) {
  return request(`/users/${userId}/role`, {
    method: "POST",
    body: JSON.stringify({ role })
  });
}

export function updatePassedDirections(userId, directions) {
  return request(`/users/${userId}/passed-directions`, {
    method: "POST",
    body: JSON.stringify({ directions })
  });
}

export function deleteUser(userId) {
  return request(`/users/${userId}`, { method: "DELETE" });
}

export function deleteMe(payload) {
  return request("/users/me", {
    method: "DELETE",
    body: payload ? JSON.stringify(payload) : undefined
  });
}
