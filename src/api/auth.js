import { request, setToken, clearToken } from "./client.js";
import { sha256Hex } from "../utils/crypto.js";

export function register(payload) {
  return sha256Hex(payload.password).then((hashed) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...payload, password: hashed })
    }).then((data) => {
      if (data?.data?.token) {
        setToken(data.data.token);
      }
      return data;
    })
  );
}

export function login(payload) {
  return sha256Hex(payload.password).then((hashed) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ ...payload, password: hashed })
    }).then((data) => {
      if (data?.data?.token) {
        setToken(data.data.token);
      }
      return data;
    })
  );
}

export function logout() {
  clearToken();
  return Promise.resolve({ ok: true });
}

export function changePassword(payload) {
  return Promise.all([sha256Hex(payload.old_password), sha256Hex(payload.new_password)]).then(
    ([oldHashed, newHashed]) =>
      request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ old_password: oldHashed, new_password: newHashed })
      })
  );
}

export function me() {
  return request("/auth/me");
}
