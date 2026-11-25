// src/components/access/AssignedAccess.jsx — Admin › Assigned Access (modules per individual user)
import { useEffect, useMemo, useRef, useState } from "react";
import { FaUserShield, FaSave, FaUndo } from "react-icons/fa";
import { Field, Btn, Card, Notice, Badge, inputCls, cx } from "../hr/ui";
import { resetMyAccess } from "./myAccess";

const API = import.meta.env.VITE_BACKEND_URL;
const call = async (path, opts = {}) => {
  const res = await fetch(`${API}/api/access${path}`, { ...opts, headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, ...(opts.body ? { "Content-Type": "application/json" } : {}) } });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || `Server error ${res.status}`);
  return d;
};
const TYPES = ["All", "Admin", "Employee", "Channel Partner"];

export default function AssignedAccess() {
  const [catalog, setCatalog] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [sel, setSel] = useState(null);           // user being edited
  const [draft, setDraft] = useState(null);       // { customized, modules:Set }
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const load = () => Promise.all([call("/catalog"), call("/users")]).then(([c, u]) => { setCatalog(c); setUsers(u); }).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  const shown = useMemo(() => users.filter((u) => (type === "All" || (type === "Admin" ? u.app === "admin" : String(u.userType).toLowerCase() === type.toLowerCase()))
    && `${u.name} ${u.email} ${u.code}`.toLowerCase().includes(q.toLowerCase())), [users, q, type]);
  const pick = (u) => { setMsg(null); setSel(u); setDraft({ customized: u.customized, modules: new Set(u.modules) }); };
  const mods = sel ? (sel.app === "admin" ? catalog.admin : catalog.user) : [];
  const leaves = mods.flatMap((m) => (m.children ? m.children.map(([k, l]) => ({ key: k, label: l, group: m.label })) : [{ key: m.key, label: m.label }]));
  const toggle = (k) => setDraft((d) => { const s = new Set(d.modules); if (s.has(k)) s.delete(k); else s.add(k); return { ...d, modules: s }; });
  const setMany = (keys, on) => setDraft((d) => { const s = new Set(d.modules); keys.forEach((k) => (on ? s.add(k) : s.delete(k))); return { ...d, modules: s }; });
  const save = async () => {
    if (lock.current) return; lock.current = true; setBusy(true);
    try {
      const saved = await call(`/users/${sel._id}`, { method: "PUT", body: JSON.stringify({ customized: draft.customized, modules: [...draft.modules] }) });
      setUsers((list) => list.map((u) => (u._id === saved._id ? saved : u))); setSel(saved); setDraft({ customized: saved.customized, modules: new Set(saved.modules) });
      if (saved._id === localStorage.getItem("userId")) resetMyAccess();
      setMsg({ kind: "ok", text: saved.customized ? `Saved — ${saved.name} now has ${saved.modules.length} of ${saved.total} modules.` : `${saved.name} is back to the default (all ${saved.total} modules).` });
    } catch (e) { setMsg({ kind: "error", text: e.message }); } finally { lock.current = false; setBusy(false); }
  };
  const groups = mods.map((m) => ({ label: m.label, keys: m.children ? m.children.map(([k]) => k) : [m.key], children: m.children }));
  const custom = draft?.customized;
  return (
    <div className="p-4 space-y-4" data-assigned-access>
      <div><h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaUserShield className="text-indigo-600" /> Assigned Access</h1>
        <p className="text-sm text-gray-500">Assign or remove modules for each individual. Users on "Default" see every module of their app, as before.</p></div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <Card title={`Users (${shown.length})`}>
          <div className="space-y-2 mb-3">
            <input aria-label="Search users" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, e-mail, code…" className={inputCls()} />
            <div className="flex flex-wrap gap-1">{TYPES.map((t) => <button key={t} type="button" onClick={() => setType(t)} className={cx("px-2.5 py-1 rounded-full text-xs border", type === t ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300")}>{t}</button>)}</div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto divide-y" data-user-list>
            {shown.map((u) => (
              <li key={u._id}><button type="button" onClick={() => pick(u)} className={cx("w-full text-left px-2 py-2 rounded hover:bg-gray-50", sel?._id === u._id && "bg-indigo-50")} data-user={u._id}>
                <div className="flex items-center justify-between gap-2"><span className="font-medium text-sm text-gray-800 truncate">{u.name}</span><span className="text-[11px] text-gray-500 whitespace-nowrap">{u.customized ? `${u.modules.length}/${u.total}` : "Default"}</span></div>
                <div className="text-xs text-gray-500 truncate">{[u.code, u.userType, u.email].filter(Boolean).join(" · ")}</div>
              </button></li>
            ))}
          </ul>
        </Card>
        {!sel ? <Card><p className="text-sm text-gray-500">Choose a user to see and change their modules.</p></Card> : (
          <Card title={<span className="flex items-center gap-2">{sel.name} <Badge s={custom ? "Pending" : "Active"} /><span className="text-xs font-normal text-gray-500">{sel.app === "admin" ? "Admin app" : "Employee / CP app"}</span></span>}
            actions={<Btn onClick={save} disabled={busy}><FaSave /> {busy ? "Saving…" : "Save"}</Btn>}>
            <div className="flex flex-wrap gap-4 mb-4 text-sm" role="radiogroup" aria-label="Access mode">
              <label className="flex items-center gap-2"><input type="radio" checked={!custom} onChange={() => setDraft({ customized: false, modules: new Set(leaves.map((l) => l.key)) })} /> Default — all {leaves.length} modules of their app</label>
              <label className="flex items-center gap-2"><input type="radio" checked={!!custom} onChange={() => setDraft((d) => ({ ...d, customized: true }))} /> Custom — only the ticked modules</label>
            </div>
            {custom && (
              <div className="flex flex-wrap items-center gap-2 mb-3" data-bulk>
                <Btn kind="secondary" onClick={() => setMany(leaves.map((l) => l.key), true)}>Select all</Btn>
                <Btn kind="secondary" onClick={() => setMany(leaves.map((l) => l.key), false)}><FaUndo /> Clear all</Btn>
                <span className="text-sm text-gray-600 ml-auto"><b>{draft.modules.size}</b> of {leaves.length} selected</span>
              </div>
            )}
            <div className={cx("grid grid-cols-1 md:grid-cols-2 gap-3", !custom && "opacity-60")} data-modules>
              {groups.map((g) => (
                <div key={g.label} className={cx("border rounded-lg p-3", g.children && "md:col-span-2")}>
                  {g.children ? (<>
                    <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{g.label}</span>
                      {custom && <span className="text-xs space-x-2"><button type="button" className="text-indigo-600 underline" onClick={() => setMany(g.keys, true)}>Select all</button><button type="button" className="text-gray-600 underline" onClick={() => setMany(g.keys, false)}>Clear</button></span>}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                      {g.children.map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!custom} checked={draft.modules.has(k)} onChange={() => toggle(k)} data-module={k} /> {l}</label>)}
                    </div>
                  </>) : <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!custom} checked={draft.modules.has(g.keys[0])} onChange={() => toggle(g.keys[0])} data-module={g.keys[0]} /> {g.label}</label>}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">Changes apply the next time the user opens or refreshes the CRM. Unassigned modules disappear from their menu and the server refuses them.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
