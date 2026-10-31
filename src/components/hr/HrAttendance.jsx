// src/components/hr/HrAttendance.jsx — My HR › Attendance (register, holidays, leave approvals)
import { useEffect, useState } from "react";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { hrApi, MONTHS, fmtDate } from "./hrApi";
import { Field, Btn, Card, Notice, Badge, inputCls, cx } from "./ui";

export const DAY_STYLE = {
  present: ["P", "bg-emerald-100 text-emerald-800", "Present"], weeklyOff: ["S", "bg-gray-100 text-gray-500", "Sunday (weekly off)"],
  holiday: ["H", "bg-sky-100 text-sky-800", "Holiday (paid)"], paidLeave: ["L", "bg-indigo-100 text-indigo-800", "Approved leave (paid)"],
  lwp: ["W", "bg-orange-100 text-orange-800", "Leave without pay"], absent: ["A", "bg-red-100 text-red-700", "Absent / not marked"],
  future: ["·", "bg-white text-gray-300", "Upcoming"], notJoined: ["–", "bg-white text-gray-300", "Before joining"],
};
export const MonthPicker = ({ month, year, onChange }) => {
  const now = new Date().getFullYear();
  return (
    <div className="flex gap-2">
      <select aria-label="Month" value={month} onChange={(e) => onChange({ month: Number(e.target.value), year })} className={inputCls()}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      <select aria-label="Year" value={year} onChange={(e) => onChange({ month, year: Number(e.target.value) })} className={inputCls()}>{[now - 2, now - 1, now, now + 1].map((y) => <option key={y} value={y}>{y}</option>)}</select>
    </div>
  );
};

export default function HrAttendance() {
  const now = new Date();
  const [mm, setMm] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [reg, setReg] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [hForm, setHForm] = useState({ date: "", name: "" });
  const [remarks, setRemarks] = useState({});
  const [msg, setMsg] = useState(null);
  const [cell, setCell] = useState(null);

  const load = async () => {
    try {
      const [r, h, l] = await Promise.all([hrApi(`/attendance?month=${mm.month}&year=${mm.year}`), hrApi(`/holidays?year=${mm.year}`), hrApi("/leaves")]);
      setReg(r); setHolidays(h); setLeaves(l);
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  useEffect(() => { load(); }, [mm.month, mm.year]);

  const mark = async (status) => {
    try { await hrApi("/attendance", { method: "POST", body: { employeeId: cell.employeeId, date: cell.date, status } }); setCell(null); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); setCell(null); }
  };
  const addHoliday = async () => { try { await hrApi("/holidays", { method: "POST", body: hForm }); setHForm({ date: "", name: "" }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const delHoliday = async (id) => { if (window.confirm("Delete this holiday?")) { await hrApi(`/holidays/${id}`, { method: "DELETE" }); load(); } };
  const decide = async (id, status) => {
    try { await hrApi(`/leaves/${id}`, { method: "PUT", body: { status, remarks: remarks[id] || "" } }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const pending = leaves.filter((l) => l.status === "Pending");

  return (
    <div className="space-y-4">
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title="Leave approvals" actions={<span className="text-sm text-gray-500">{pending.length} pending</span>}>
        {!pending.length ? <p className="text-sm text-gray-500">No pending leave requests.</p> : pending.map((l) => (
          <div key={l._id} className="border rounded-lg p-3 mb-2 flex flex-wrap items-center gap-3" data-leave={l._id}>
            <div className="flex-1 min-w-[200px] text-sm"><b>{l.name}</b> ({l.employeeCode}) — {l.leaveType === "LWP" ? "Leave without pay" : "Approved leave (paid)"}<div className="text-xs text-gray-600">{fmtDate(l.from)}{l.to !== l.from ? ` to ${fmtDate(l.to)}` : ""} · {l.reason}</div></div>
            <input aria-label="Remarks" value={remarks[l._id] || ""} onChange={(e) => setRemarks({ ...remarks, [l._id]: e.target.value })} placeholder="Remarks (needed to reject)" className={cx(inputCls(), "max-w-xs")} />
            <Btn kind="success" onClick={() => decide(l._id, "Approved")}><FaCheck /> Approve</Btn>
            <Btn kind="danger" onClick={() => decide(l._id, "Rejected")}><FaTimes /> Reject</Btn>
          </div>
        ))}
      </Card>
      <Card title="Attendance register" actions={<MonthPicker {...mm} onChange={setMm} />}>
        <div className="flex flex-wrap gap-3 text-xs mb-3">{Object.entries(DAY_STYLE).map(([k, [c, cls, l]]) => <span key={k} className="flex items-center gap-1"><span className={cx("inline-flex w-5 h-5 items-center justify-center rounded", cls)}>{c}</span>{l}</span>)}</div>
        {!reg ? <p className="text-sm text-gray-500">Loading…</p> : !reg.rows.length ? <p className="text-sm text-gray-500">No employees for this month.</p> : (
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse" data-table="attendance">
              <thead><tr><th className="p-1 text-left sticky left-0 bg-white">Employee</th>{reg.rows[0].days.map((d) => <th key={d.date} className="p-0.5 w-6 text-center text-gray-500">{Number(d.date.slice(8))}</th>)}<th className="p-1">Paid</th><th className="p-1">LOP</th></tr></thead>
              <tbody>{reg.rows.map((r) => (
                <tr key={r.employeeId} className="border-t">
                  <td className="p-1 sticky left-0 bg-white whitespace-nowrap"><b>{r.employeeCode}</b> {r.name}{!r.linked && <span className="text-amber-700" title="No CRM login linked"> ⚠</span>}</td>
                  {r.days.map((d) => {
                    const [c, cls, l] = DAY_STYLE[d.kind];
                    const editable = r.linked && !["weeklyOff", "holiday", "notJoined"].includes(d.kind);
                    return <td key={d.date} className="p-0.5"><button type="button" disabled={!editable} title={`${d.date}: ${l}`} onClick={() => setCell({ employeeId: r.employeeId, date: d.date, name: r.name })} className={cx("w-6 h-6 rounded", cls, editable && "hover:ring-2 hover:ring-indigo-400")}>{c}</button></td>;
                  })}
                  <td className="p-1 text-center font-medium">{r.payableDays}</td><td className="p-1 text-center text-red-600">{r.lopDays}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
        {cell && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm bg-gray-50 border rounded-lg p-2" data-cell>
            <span>{cell.name} — {fmtDate(cell.date)}:</span>
            <Btn kind="success" onClick={() => mark("Present")}>Present</Btn><Btn kind="danger" onClick={() => mark("Absent")}>Absent</Btn><Btn kind="secondary" onClick={() => mark("Clear")}>Clear</Btn><Btn kind="secondary" onClick={() => setCell(null)}>Cancel</Btn>
          </div>
        )}
      </Card>
      <Card title={`Holiday calendar ${mm.year}`}>
        <div className="flex flex-wrap gap-2 mb-3">
          <input type="date" aria-label="Holiday date" value={hForm.date} onChange={(e) => setHForm({ ...hForm, date: e.target.value })} className={cx(inputCls(), "max-w-[180px]")} />
          <input aria-label="Holiday name" value={hForm.name} onChange={(e) => setHForm({ ...hForm, name: e.target.value })} placeholder="Holiday name" className={cx(inputCls(), "max-w-xs")} />
          <Btn onClick={addHoliday} disabled={!hForm.date}>Add holiday</Btn>
        </div>
        <p className="text-xs text-gray-500 mb-2">Holidays are paid and can't be marked. Sundays are weekly offs.</p>
        {holidays.map((h) => <div key={h._id} className="flex justify-between items-center text-sm py-1 border-b"><span>{fmtDate(h.date)} — {h.name}</span><button type="button" aria-label={`Delete ${h.name}`} onClick={() => delHoliday(h._id)} className="text-red-500"><FaTrash /></button></div>)}
      </Card>
      <Card title="Leave history">
        <table className="w-full text-xs"><tbody>{leaves.filter((l) => l.status !== "Pending").slice(0, 50).map((l) => (
          <tr key={l._id} className="border-t"><td className="p-1">{l.employeeCode} {l.name}</td><td className="p-1">{l.leaveType}</td><td className="p-1">{fmtDate(l.from)}{l.to !== l.from ? ` – ${fmtDate(l.to)}` : ""}</td><td className="p-1"><Badge s={l.status} /></td><td className="p-1 text-gray-500">{l.approverRemarks}</td></tr>
        ))}</tbody></table>
      </Card>
    </div>
  );
}
