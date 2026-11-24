// src/components/cp/cpApi.js — Channel Partner Onboarding API helpers (/api/cp-onboarding)
const API = import.meta.env.VITE_BACKEND_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const cpApi = async (path, { method = "GET", body, public: isPublic = false } = {}) => {
  let res;
  try {
    res = await fetch(`${API}/api/cp-onboarding${path}`, { method, headers: { ...(isPublic ? {} : auth()), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch { throw new Error("Couldn't reach the server — check the connection and try again."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(data.error || `Server error ${res.status}`); err.errors = data.errors || []; throw err; }
  return data;
};
export const cpUpload = async (path, file, extra = {}) => {
  const fd = new FormData();
  fd.append("file", file, file.name);
  Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  let res;
  try { res = await fetch(`${API}/api/cp-onboarding${path}`, { method: "POST", body: fd }); } catch { throw new Error("Couldn't reach the server — try again."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
};
/** opens a PDF (Admin: with the login token) */
export const openCpPdf = async (path, { public: isPublic = false } = {}) => {
  const win = window.open("", "_blank");
  try {
    const res = await fetch(`${API}/api/cp-onboarding${path}`, { headers: isPublic ? {} : auth() });
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Server error ${res.status}`); }
    const url = URL.createObjectURL(await res.blob());
    if (win) win.location.href = url; else window.location.href = url;
  } catch (e) { if (win) win.close(); throw e; }
};
export const OWNERSHIP = ["Individual", "Shop Owner", "Employee", "Partner", "Broker", "Other Company Agent"];
