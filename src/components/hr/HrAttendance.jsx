// src/components/hr/HrAttendance.jsx — My HR › Attendance (register, holidays, leave approvals)
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { FaFileExcel, FaCalendarCheck } from "react-icons/fa";
import EmployeeSelect from "./EmployeeSelect";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { hrApi, MONTHS, fmtDate, todayYmd } from "./hrApi";
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
  const [remarks, setRemarks] = useState({});
  const [msg, setMsg] = useState(null);
  const [cell, setCell] = useState(null);
  const [emps, setEmps] = useState([]);
  const [mark, setMark] = useState({ employeeId: "", date: todayYmd(), status: "Present" });
  useEffect(() => { hrApi("/employees").then(setEmps).catch(() => {}); }, []);

  const load = async () => {
    try {
      const [r, h, l] = await Promise.all([hrApi(`/attendance?month=${mm.month}&year=${mm.year}`), hrApi(`/holidays?year=${mm.year}`), hrApi("/leaves")]);
      setReg(r); setHolidays(h); setLeaves(l);
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  useEffect(() => { load(); }, [mm.month, mm.year]);

  const setDay = async (status) => {
    try { await hrApi("/attendance", { method: "POST", body: { employeeId: cell.employeeId, date: cell.date, status } }); setCell(null); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); setCell(null); }
  };
  // Admin marks any employee for any back date or today
  const markFor = async () => {
    const emp = emps.find((e) => e._id === mark.employeeId);
    try {
      await hrApi("/attendance", { method: "POST", body: mark });
      setMsg({ kind: "ok", text: `${emp ? `${emp.employeeCode} ${emp.name}` : "Employee"}: ${mark.status === "Clear" ? "mark cleared" : mark.status} on ${fmtDate(mark.date)}.` });
      const [y, m] = mark.date.split("-").map(Number);
      if (y !== mm.year || m !== mm.month) setMm({ month: m, year: y }); else load();
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  // Attendance register as an Excel file (one row per employee, one column per day + totals)
  const exportExcel = () => {
    const days = reg.rows[0].days.map((d) => d.date);
    const code = (k) => DAY_STYLE[k][0] === "·" || DAY_STYLE[k][0] === "–" ? "" : DAY_STYLE[k][0];
    const head = ["Emp. Code", "Name", ...days.map((d) => `${Number(d.slice(8))} ${new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}`),
      "Present", "Paid Leave", "LWP", "Absent", "Holidays", "Sundays", "Payable Days", "LOP Days"];
    const rows = reg.rows.map((r) => [r.employeeCode, r.name, ...r.days.map((d) => code(d.kind)), r.count.present, r.count.paidLeave, r.count.lwp, r.count.absent, r.count.holiday, r.count.weeklyOff, r.payableDays, r.lopDays]);
    const ws = XLSX.utils.aoa_to_sheet([[`Attendance Register — ${MONTHS[reg.month - 1]} ${reg.year}`], ["Arshyan Insurance Marketing & Services Pvt Ltd"], [], head, ...rows]);
    ws["!cols"] = [{ wch: 14 }, { wch: 24 }, ...days.map(() => ({ wch: 6 })), ...Array(8).fill({ wch: 11 })];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }];
    ws["!freeze"] = { xSplit: 2, ySplit: 4 };
    const legend = XLSX.utils.aoa_to_sheet([["Code", "Meaning"], ...Object.values(DAY_STYLE).filter(([c]) => c !== "·" && c !== "–").map(([c, , l]) => [c, l]), ["(blank)", "Upcoming day / before joining"]]);
    legend["!cols"] = [{ wch: 10 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTHS[reg.month - 1].slice(0, 3)} ${reg.year}`);
    XLSX.utils.book_append_sheet(wb, legend, "Legend");
    XLSX.writeFile(wb, `Attendance_Register_${MONTHS[reg.month - 1]}_${reg.year}.xlsx`);
  };
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
      <Card title="Mark Attendance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" data-form="mark-attendance">
          <Field label="Employee" required><EmployeeSelect employees={emps} value={mark.employeeId} onChange={(id) => setMark({ ...mark, employeeId: id })} /></Field>
          <Field label="Date" required hint="Today or any earlier date"><input type="date" aria-label="Attendance date" max={todayYmd()} value={mark.date} onChange={(e) => setMark({ ...mark, date: e.target.value })} className={inputCls(mark.date > todayYmd())} /></Field>
          <Field label="Status" required><select aria-label="Attendance status" value={mark.status} onChange={(e) => setMark({ ...mark, status: e.target.value })} className={inputCls()}><option>Present</option><option>Absent</option><option value="Clear">Clear (remove mark)</option></select></Field>
          <Btn onClick={markFor} disabled={!mark.employeeId || !mark.date || mark.date > todayYmd()}><FaCalendarCheck /> Mark Attendance</Btn>
        </div>
        {mark.date > todayYmd() && <p className="text-xs text-red-600 mt-2">Attendance can't be marked for a future date.</p>}
      </Card>
      <Card title="Attendance register" actions={<><MonthPicker {...mm} onChange={setMm} /><Btn kind="success" onClick={exportExcel} disabled={!reg?.rows?.length}><FaFileExcel /> Excel</Btn></>}>
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
                    const editable = r.linked && !["weeklyOff", "holiday", "notJoined", "future"].includes(d.kind) && d.date <= todayYmd();
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
            <Btn kind="success" onClick={() => setDay("Present")}>Present</Btn><Btn kind="danger" onClick={() => setDay("Absent")}>Absent</Btn><Btn kind="secondary" onClick={() => setDay("Clear")}>Clear</Btn><Btn kind="secondary" onClick={() => setCell(null)}>Cancel</Btn>
          </div>
        )}
      </Card>
      <p className="text-xs text-gray-500">Holidays ({holidays.length} in {mm.year}) are managed in My HR › Holiday Calendar.</p>
      <Card title="Leave history">
        <table className="w-full text-xs"><tbody>{leaves.filter((l) => l.status !== "Pending").slice(0, 50).map((l) => (
          <tr key={l._id} className="border-t"><td className="p-1">{l.employeeCode} {l.name}</td><td className="p-1">{l.leaveType}</td><td className="p-1">{fmtDate(l.from)}{l.to !== l.from ? ` – ${fmtDate(l.to)}` : ""}</td><td className="p-1"><Badge s={l.status} /></td><td className="p-1 text-gray-500">{l.approverRemarks}</td></tr>
        ))}</tbody></table>
      </Card>
    </div>
  );
}
