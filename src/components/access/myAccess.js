a// src/components/access/myAccess.js — the signed-in user's assigned modules (Assigned Access)
// Until Admin customises a user, the server returns every module of their app, so nothing changes.
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL;
// employee / CP app: page path -> module key
export const PATH_MODULE = { "/": "u-dashboard", "/leads": "u-leads", "/reports": "u-reports", "/my-hr": "u-my-hr", "/tasks": "u-tasks", "/salary-slip": "u-salary-slip", "/quote": "u-quote", "/profile": "u-profile", "/activity": "u-activity", "/attendance": "u-attendance" };

let cache = null;      // { customized, modules }
let pending = null;

export const loadMyAccess = (force = false) => {
  if (cache && !force) return Promise.resolve(cache);
  if (pending && !force) return pending;
  pending = fetch(`${API}/api/access/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { cache = d && Array.isArray(d.modules) ? d : { customized: false, modules: [] }; return cache; })
    .catch(() => { cache = { customized: false, modules: [] }; return cache; }) // can't reach the server: keep the menus
    .finally(() => { pending = null; });
  return pending;
};
export const resetMyAccess = () => { cache = null; };

/** a parent ("hr", "reports") is allowed when any of its children is */
export const canAccess = (access, key) => {
  if (!access || !access.customized) return true;
  const list = access.modules || [];
  return list.includes(key) || list.some((k) => k.startsWith(`${key}-`));
};

export function useMyAccess() {
  const [access, setAccess] = useState(cache);
  useEffect(() => { let on = true; loadMyAccess().then((a) => { if (on) setAccess(a); }); return () => { on = false; }; }, []);
  return { ready: !!access, access, can: (key) => canAccess(access, key) };
}
