import { request } from "./client.js";

export function listComments(intervieweeId) {
  return request(`/comments/${intervieweeId}`).then((data) => ({
    ...data,
    items: (data?.data?.items || []).map((comment) => ({
      ...comment,
      id: comment.uuid || comment.id,
      intervieweeId: comment.interviewee_id || comment.intervieweeId,
      interviewerId: comment.interviewer_id || comment.interviewerId,
      interviewerName: comment.interviewer_name || comment.interviewerName,
      createdAt: comment.created_at || comment.createdAt
    }))
  }));
}

export function createComment(payload) {
  return request("/comments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateComment(commentId, payload) {
  return request(`/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteComment(commentId) {
  return request(`/comments/${commentId}`, { method: "DELETE" });
}
