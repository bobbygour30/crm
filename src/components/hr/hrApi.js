// src/components/hr/hrApi.js — My HR API helpers
const API = import.meta.env.VITE_BACKEND_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/** JSON request; throws Error(message) with .errors for field errors */
export const hrApi = async (path, { method = "GET", body, public: isPublic = false } = {}) => {
  let res;
  try {
    res = await fetch(`${API}/api/hr${path}`, {
      method,
      headers: { ...(isPublic ? {} : auth()), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Couldn't reach the server — check the connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Server error ${res.status}`);
    err.errors = data.errors || [];
    err.status = res.status;
    throw err;
  }
  return data;
};

/** Upload one file (multipart, field "file") */
export const hrUpload = async (path, file, extra = {}, { public: isPublic = false } = {}) => {
  const fd = new FormData();
  fd.append("file", file, file.name);
  Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  let res;
  try {
    res = await fetch(`${API}/api/hr${path}`, { method: "POST", headers: isPublic ? {} : auth(), body: fd });
  } catch {
    throw new Error("Couldn't reach the server — check the connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
};

/** Opens a PDF from the API in a new tab (the request carries the login token) */
export const openHrPdf = async (path, { public: isPublic = false } = {}) => {
  const win = window.open("", "_blank");
  try {
    const res = await fetch(`${API}/api/hr${path}`, { headers: isPublic ? {} : auth() });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || `Server error ${res.status}`);
    }
    const url = URL.createObjectURL(await res.blob());
    if (win) win.location.href = url; else window.location.href = url;
  } catch (e) {
    if (win) win.close();
    throw e;
  }
};

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const inr = (v) => `₹${Math.round(Number(v) || 0).toLocaleString("en-IN")}`;
export const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(String(v).length === 10 ? `${v}T00:00:00` : v);
  return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
export const todayYmd = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
