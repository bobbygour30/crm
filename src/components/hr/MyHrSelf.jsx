// src/components/hr/MyHrSelf.jsx — My HR for employees: attendance, leave, salary slips
import { useEffect, useState } from "react";
import { FaCheckCircle, FaFilePdf, FaCalendarCheck } from "react-icons/fa";
import { hrApi, openHrPdf, fmtDate, todayYmd, MONTHS } from "./hrApi";
import { Field, Btn, Card, Notice, Badge, inputCls, cx } from "./ui";
import { DAY_STYLE, MonthPicker } from "./HrAttendance";

export default function MyHrSelf() {
  const now = new Date();
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [mm, setMm] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [month, setMonth] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: "Approved Leave", from: todayYmd(), to: todayYmd(), reason: "" });
  const [slip, setSlip] = useState(() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return { month: d.getMonth() + 1, year: d.getFullYear() }; });

  const loadMe = () => hrApi("/me").then(setMe).catch((e) => setError(e.message));
  const loadLeaves = () => hrApi("/me/leaves").then(setLeaves).catch(() => {});
  useEffect(() => { loadMe(); loadLeaves(); }, []);
  useEffect(() => { if (me) hrApi(`/me/attendance?month=${mm.month}&year=${mm.year}`).then(setMonth).catch((e) => setMsg({ kind: "error", text: e.message })); }, [me, mm.month, mm.year]);

  const markToday = async () => { try { await hrApi("/me/attendance", { method: "POST" }); setMsg({ kind: "ok", text: "Attendance marked for today." }); loadMe(); setMm({ ...mm }); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const apply = async () => { try { await hrApi("/me/leaves", { method: "POST", body: form }); setMsg({ kind: "ok", text: "Leave applied — waiting for approval." }); setForm({ ...form, reason: "" }); loadLeaves(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };

  if (error) return <div className="p-4"><Notice kind="warn">{error}</Notice></div>;
  if (!me) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  const t = me.today;
  const todayNote = t.status ? `Marked: ${t.status}` : t.weeklyOff ? "Sunday — weekly off" : t.holiday ? "Holiday" : t.beforeJoining ? "Before your joining date" : null;
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div><h1 className="text-2xl font-bold text-gray-800">My HR</h1><p className="text-sm text-gray-500">{me.employee.employeeCode} · {me.employee.name} · {me.employee.designation}</p></div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title={`Today — ${fmtDate(t.date)}`}>
        <div className="flex flex-wrap items-center gap-4" data-today>
          {todayNote ? <span className="flex items-center gap-2 text-emerald-700"><FaCheckCircle /> {todayNote}</span> : <Btn kind="success" onClick={markToday}><FaCalendarCheck /> Mark Present</Btn>}
          <span className="text-xs text-gray-500">One mark per day. Sundays and holidays need no mark. Schedule: {me.employee.workSchedule || "—"}</span>
        </div>
      </Card>
      <Card title="My attendance" actions={<MonthPicker {...mm} onChange={setMm} />}>
        {month && (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs" data-calendar>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="text-gray-500 py-1">{d}</div>)}
              {Array.from({ length: new Date(`${month.days[0].date}T00:00:00Z`).getUTCDay() }).map((_, i) => <div key={`pad${i}`} />)}
              {month.days.map((d) => { const [c, cls, l] = DAY_STYLE[d.kind]; return <div key={d.date} title={l} className={cx("rounded py-2", cls)}><div className="font-medium">{Number(d.date.slice(8))}</div><div className="text-[10px]">{c}</div></div>; })}
            </div>
            <p className="text-sm mt-3">Paid days: <b>{month.payableDays}</b> · Loss of pay: <b className="text-red-600">{month.lopDays}</b></p>
          </>
        )}
      </Card>
      <Card title="Apply for leave">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Field label="Type"><select aria-label="Leave type" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} className={inputCls()}><option value="Approved Leave">Approved Leave (paid)</option><option value="LWP">Leave Without Pay</option></select></Field>
          <Field label="From"><input type="date" aria-label="From" min={todayYmd()} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value, to: e.target.value > form.to ? e.target.value : form.to })} className={inputCls()} /></Field>
          <Field label="To"><input type="date" aria-label="To" min={form.from} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className={inputCls()} /></Field>
          <Field label="Reason"><input aria-label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputCls()} /></Field>
        </div>
        <div className="flex items-center justify-between mt-3"><span className="text-xs text-gray-500">{me.paidLeavesPerMonth} paid leave per month; more is unpaid. Leave needs approval before the date.</span><Btn onClick={apply} disabled={!form.reason.trim()}>Apply</Btn></div>
        {leaves.length > 0 && <table className="w-full text-sm mt-4"><tbody>{leaves.map((l) => <tr key={l._id} className="border-t"><td className="p-2">{l.leaveType}</td><td className="p-2">{fmtDate(l.from)}{l.to !== l.from ? ` – ${fmtDate(l.to)}` : ""}</td><td className="p-2"><Badge s={l.status} /></td><td className="p-2 text-xs text-gray-500">{l.approverRemarks}</td></tr>)}</tbody></table>}
      </Card>
      <Card title="Salary slips">
        <div className="flex flex-wrap gap-3 items-end">
          <MonthPicker {...slip} onChange={setSlip} />
          <Btn onClick={() => openHrPdf(`/me/salary-slip?month=${slip.month}&year=${slip.year}`).catch((e) => setMsg({ kind: "error", text: e.message }))}><FaFilePdf /> View slip — {MONTHS[slip.month - 1]} {slip.year}</Btn>
        </div>
        <p className="text-xs text-gray-500 mt-2">Available after the month ends.</p>
      </Card>
    </div>
  );
}
