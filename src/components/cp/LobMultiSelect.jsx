// src/components/cp/LobMultiSelect.jsx — drop-down with multiple selection + Select all / Clear all
import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function LobMultiSelect({ options, value = [], onChange, error, label = "LOB" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const shown = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  const summary = !value.length ? "Select LOBs" : value.length === options.length ? `All LOBs (${value.length})` : value.length <= 2 ? value.join(", ") : `${value.length} LOBs selected`;
  return (
    <div className="relative" ref={ref} data-lob-multiselect>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}
        className={`w-full p-2 border rounded-lg text-sm bg-white flex items-center justify-between gap-2 text-left ${error ? "border-red-500" : "border-gray-300"}`}>
        <span className={value.length ? "text-gray-800 truncate" : "text-gray-400"}>{summary}</span><FaChevronDown className="text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border rounded-lg shadow-lg" role="listbox" aria-multiselectable="true">
          <div className="p-2 border-b space-y-2">
            <input aria-label="Search LOB" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full p-1.5 border border-gray-300 rounded text-sm" />
            <div className="flex items-center justify-between text-xs">
              <span className="space-x-3">
                <button type="button" className="text-indigo-600 underline" onClick={() => onChange([...options])}>Select all</button>
                <button type="button" className="text-gray-600 underline" onClick={() => onChange([])}>Clear all</button>
              </span>
              <span className="text-gray-500">{value.length} selected</span>
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {shown.map((o) => (
              <li key={o}><label className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-indigo-50 cursor-pointer">
                <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} /> {o}
              </label></li>
            ))}
            {!shown.length && <li className="px-3 py-2 text-sm text-gray-500">No match</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
