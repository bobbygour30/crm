// src/components/hr/EmployeeSelect.jsx — searchable "AIM00010 MD AZEEM AHMAD" picker (AS-01, 9.1)
import { useMemo, useState } from "react";
import { inputCls } from "./ui";

export default function EmployeeSelect({ employees = [], value, onChange, label = "Employee", includeInactive = false }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = useMemo(() => employees.filter((e) => includeInactive || e.status !== "Inactive"), [employees, includeInactive]);
  const selected = list.find((e) => e._id === value);
  const shown = list.filter((e) => `${e.employeeCode} ${e.name}`.toLowerCase().includes(q.toLowerCase())).slice(0, 50);
  return (
    <div className="relative" data-employee-select>
      <input
        aria-label={label} placeholder="Search code or name…" className={inputCls()}
        value={open ? q : selected ? `${selected.employeeCode} ${selected.name}` : q}
        onFocus={() => { setOpen(true); setQ(""); }} onBlur={() => setTimeout(() => setOpen(false), 150)} onChange={(e) => { setQ(e.target.value); setOpen(true); }}
      />
      {open && (
        <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg text-sm" role="listbox">
          {shown.length ? shown.map((e) => (
            <li key={e._id} role="option" aria-selected={e._id === value}>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-indigo-50" onMouseDown={() => { onChange(e._id, e); setOpen(false); }}>
                <b>{e.employeeCode}</b> {e.name}<span className="text-xs text-gray-500"> · {e.department || "—"}</span>
              </button>
            </li>
          )) : <li className="px-3 py-2 text-gray-500">No match</li>}
        </ul>
      )}
    </div>
  );
}
