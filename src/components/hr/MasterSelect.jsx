// src/components/hr/MasterSelect.jsx — dropdown with inline "Add New" (saved to the master for everyone)
import { useState } from "react";
import { hrApi } from "./hrApi";
import { inputCls } from "./ui";

export default function MasterSelect({ type, label, value, onChange, masters, setMasters, error, disabled, withEmail }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const options = (masters?.[type] || []).map((m) => m.value);
  const save = async () => {
    setMsg("");
    try {
      const m = await hrApi("/masters", { method: "POST", body: { type, value: draft, email: withEmail ? email : undefined } });
      setMasters((p) => ({ ...p, [type]: [...(p[type] || []), { _id: m._id, value: m.value, email: m.email, active: true }].sort((a, b) => a.value.localeCompare(b.value)) }));
      onChange(m.value);
      setAdding(false); setDraft(""); setEmail("");
    } catch (e) { setMsg(e.message); }
  };
  return (
    <div>
      {adding ? (
        <div className="space-y-1">
          <div className="flex gap-1">
            <input autoFocus aria-label={`New ${label}`} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }} className={inputCls()} placeholder={`New ${label}`} />
            <button type="button" onClick={save} disabled={!draft.trim()} className="px-3 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50">Add</button>
            <button type="button" onClick={() => { setAdding(false); setMsg(""); }} className="px-2 rounded-lg bg-gray-100 text-sm">✕</button>
          </div>
          {withEmail && <input aria-label="Reporting manager e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls()} placeholder="E-mail (CC on rejection mails) — optional" />}
          {msg && <p className="text-red-500 text-xs">{msg}</p>}
        </div>
      ) : (
        <select
          data-field={type} aria-label={label} value={value || ""} disabled={disabled} className={inputCls(error, disabled)}
          onChange={(e) => (e.target.value === "__add" ? setAdding(true) : onChange(e.target.value))}
        >
          <option value="">Select</option>
          {value && !options.includes(value) && <option value={value}>{value}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
          {!disabled && <option value="__add">+ Add New…</option>}
        </select>
      )}
    </div>
  );
}
