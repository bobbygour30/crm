// src/components/hr/HrHolidays.jsx — My HR › Holiday Calendar (Admin): manual marking with remarks + bulk upload
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { FaTrash, FaDownload, FaUpload, FaPlus } from "react-icons/fa";
import { hrApi, fmtDate } from "./hrApi";
import { Field, Btn, Card, Notice, inputCls, cx } from "./ui";

const pad = (n) => String(n).padStart(2, "0");
/** Excel cell → "YYYY-MM-DD" (accepts real Excel dates, DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD) */
export const toYmd = (v) => {
  if (v === undefined || v === null || v === "") return "";
  if (typeof v === "number") { const d = XLSX.SSF.parse_date_code(v); return d ? `${d.y}-${pad(d.m)}-${pad(d.d)}` : ""; }
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  return "";
};
// File → ArrayBuffer (FileReader fallback for older browsers without File.arrayBuffer)
const readBuffer = (file) => (typeof file.arrayBuffer === "function" ? file.arrayBuffer() : new Promise((resolve, reject) => {
  const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(r.error); r.readAsArrayBuffer(file);
}));
// checked in UTC so the result is the same in every time zone (local midnight in India is the previous day in UTC)
const validYmd = (s) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; const d = new Date(`${s}T00:00:00Z`); return !isNaN(d) && d.toISOString().slice(0, 10) === s; };
const shown = (v, ymd) => (ymd ? ymd.split("-").reverse().join("-") : String(v)); // error messages: 01-01-2026, not Excel's 46023

export default function HrHolidays() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ date: "", name: "", remarks: "" });
  const [preview, setPreview] = useState(null); // { rows, problems }
  const [msg, setMsg] = useState(null);
  const load = () => hrApi(`/holidays?year=${year}`).then(setList).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, [year]);

  const add = async () => {
    try { await hrApi("/holidays", { method: "POST", body: form }); setMsg({ kind: "ok", text: `Holiday marked on ${fmtDate(form.date)}.` }); setForm({ date: "", name: "", remarks: "" }); if (form.date.startsWith(String(year))) load(); else setYear(Number(form.date.slice(0, 4))); }
    catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const del = async (h) => { if (!window.confirm(`Delete the holiday "${h.name}" on ${fmtDate(h.date)}?`)) return; try { await hrApi(`/holidays/${h._id}`, { method: "DELETE" }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Date (DD-MM-YYYY)", "Holiday Name", "Remarks"],
      [`26-01-${thisYear + (new Date().getMonth() > 0 ? 1 : 0)}`, "Republic Day", "National holiday"],
      [`15-08-${thisYear}`, "Independence Day", ""],
    ]);
    ws["!cols"] = [{ wch: 18 }, { wch: 28 }, { wch: 36 }];
    const help = XLSX.utils.aoa_to_sheet([
      ["How to fill"], ["• One holiday per row. Date and Holiday Name are required; Remarks are optional."],
      ["• Date format: DD-MM-YYYY (an Excel date also works)."], ["• Dates that are already holidays are skipped."], ["• Delete the two sample rows before uploading."],
    ]);
    help["!cols"] = [{ wch: 80 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Holidays");
    XLSX.utils.book_append_sheet(wb, help, "Instructions");
    XLSX.writeFile(wb, "Holiday_Upload_Template.xlsx");
  };
  const readFile = async (file) => {
    setMsg(null);
    try {
      const wb = XLSX.read(new Uint8Array(await readBuffer(file)), { type: "array", cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" }).slice(1);
      const rows = [], problems = [], combined = [];
      const byDate = new Map(); // one holiday per date: festivals on the same day are combined
      raw.forEach((r, i) => {
        if (!r.some((c) => String(c).trim())) return; // blank row
        const row = i + 2, date = toYmd(r[0]), name = String(r[1] || "").trim(), remarks = String(r[2] || "").trim();
        if (!validYmd(date)) { problems.push(`Row ${row}: date "${shown(r[0], date)}" is not valid (use DD-MM-YYYY)`); return; }
        if (!name) { problems.push(`Row ${row}: Holiday Name is missing`); return; }
        const first = byDate.get(date);
        if (first) {
          if (!first.name.split(" / ").includes(name)) first.name = `${first.name} / ${name}`;
          if (remarks && !first.remarks.split("; ").includes(remarks)) first.remarks = first.remarks ? `${first.remarks}; ${remarks}` : remarks;
          combined.push(`Row ${row} is on the same date as row ${first.row} — combined as "${first.name}"`);
          return;
        }
        const h = { row, date, name, remarks };
        byDate.set(date, h); rows.push(h);
      });
      if (!rows.length && !problems.length) problems.push("The file has no holidays");
      setPreview({ rows, problems, combined, fileName: file.name });
    } catch (e) { setMsg({ kind: "error", text: `Could not read the file — use the downloaded template (.xlsx).${e && e.message ? ` (${e.message})` : ""}` }); }
  };
  const upload = async () => {
    try {
      const r = await hrApi("/holidays/bulk", { method: "POST", body: { rows: preview.rows } });
      setMsg({ kind: r.skipped.length ? "warn" : "ok", text: `${r.added} holiday(s) added.${r.skipped.length ? ` Skipped: ${r.skipped.map((s) => `row ${s.row} (${s.reason})`).join("; ")}.` : ""}` });
      setPreview(null); load();
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };

  return (
    <div className="space-y-4">
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title="Mark a holiday">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" data-form="holiday">
          <Field label="Date" required><input type="date" aria-label="Holiday date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls()} /></Field>
          <Field label="Holiday Name" required><input aria-label="Holiday name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls()} /></Field>
          <Field label="Remarks"><input aria-label="Holiday remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className={inputCls()} placeholder="Optional" /></Field>
          <Btn onClick={add} disabled={!form.date || !form.name.trim()}><FaPlus /> Mark Holiday</Btn>
        </div>
      </Card>
      <Card title="Bulk upload">
        <div className="flex flex-wrap items-center gap-3" data-bulk>
          <Btn kind="secondary" onClick={downloadTemplate}><FaDownload /> Download Template</Btn>
          <label className="px-3 py-2 rounded-lg text-sm border border-indigo-300 text-indigo-700 hover:bg-indigo-50 cursor-pointer flex items-center gap-2"><FaUpload /> Choose Filled File
            <input type="file" accept=".xlsx,.xls" className="hidden" aria-label="Holiday file" onChange={(e) => { if (e.target.files[0]) readFile(e.target.files[0]); e.target.value = ""; }} />
          </label>
          <span className="text-xs text-gray-500">Columns: Date (DD-MM-YYYY), Holiday Name, Remarks</span>
        </div>
        {preview && (
          <div className="mt-4 border rounded-lg p-3" data-preview>
            <p className="text-sm"><b>{preview.fileName}</b>: {preview.rows.length} holiday(s) ready{preview.combined.length ? `, ${preview.combined.length} row(s) combined with another holiday on the same date` : ""}{preview.problems.length ? `, ${preview.problems.length} problem(s)` : ""}.</p>
            {preview.problems.length > 0 && <ul className="text-xs text-red-600 mt-2 list-disc pl-5">{preview.problems.map((p) => <li key={p}>{p}</li>)}</ul>}
            {preview.combined.length > 0 && (
              <details className="text-xs text-amber-700 mt-2"><summary className="cursor-pointer">Same-date rows combined ({preview.combined.length})</summary>
                <ul className="list-disc pl-5 mt-1">{preview.combined.map((p) => <li key={p}>{p}</li>)}</ul>
              </details>
            )}
            {preview.rows.length > 0 && (
              <table className="w-full text-xs mt-2"><tbody>{preview.rows.map((r) => <tr key={r.row} className="border-t"><td className="p-1">{fmtDate(r.date)}</td><td className="p-1">{r.name}</td><td className="p-1 text-gray-500">{r.remarks}</td></tr>)}</tbody></table>
            )}
            <div className="flex justify-end gap-2 mt-3"><Btn kind="secondary" onClick={() => setPreview(null)}>Cancel</Btn><Btn onClick={upload} disabled={!preview.rows.length}>Upload {preview.rows.length} holiday(s)</Btn></div>
          </div>
        )}
      </Card>
      <Card title={`Holiday Calendar ${year}`} actions={
        <select aria-label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={cx(inputCls(), "w-28")}>{[thisYear - 1, thisYear, thisYear + 1].map((y) => <option key={y}>{y}</option>)}</select>
      }>
        {!list.length ? <p className="text-sm text-gray-500">No holidays for {year}.</p> : (
          <table className="w-full text-sm" data-table="holidays"><thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Date</th><th className="p-2">Day</th><th className="p-2">Holiday</th><th className="p-2">Remarks</th><th className="p-2"></th></tr></thead>
            <tbody>{list.map((h) => (
              <tr key={h._id} className="border-t"><td className="p-2">{fmtDate(h.date)}</td><td className="p-2">{new Date(`${h.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long" })}</td><td className="p-2 font-medium">{h.name}</td><td className="p-2 text-gray-600">{h.remarks || "—"}</td>
                <td className="p-2"><button type="button" aria-label={`Delete ${h.name}`} onClick={() => del(h)} className="text-red-500 hover:text-red-700"><FaTrash /></button></td></tr>
            ))}</tbody>
          </table>
        )}
        <p className="text-xs text-gray-500 mt-3">Holidays are paid and need no attendance. Employees see this calendar (read-only) in their My HR.</p>
      </Card>
    </div>
  );
}