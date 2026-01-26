import md5 from "blueimp-md5";

export function gravatarUrl(email, size = 96) {
  const normalized = (email || "").trim().toLowerCase();
  const hash = md5(normalized);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
