// src/components/hr/MyHrSelf.jsx — My HR for employees, tab-wise:
//   Profile · Attendance · Salary Slip · Leave · Exit · Holiday Calendar (+ Approvals for reporting managers)
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaFilePdf, FaCalendarCheck } from "react-icons/fa";
import { hrApi, openHrPdf, fmtDate, todayYmd, MONTHS } from "./hrApi";
import { Field, Btn, Card, Notice, Badge, inputCls, cx } from "./ui";
import { DAY_STYLE, MonthPicker } from "./HrAttendance";
import { ManagerInbox } from "./HrPhase2";

const TABS = [["profile", "Profile"], ["attendance", "Attendance"], ["slips", "Salary Slip"], ["leave", "Leave"], ["exit", "Exit"], ["holidays", "Holiday Calendar"]];

export default function MyHrSelf() {
  const now = new Date();
  const [tab, setTab] = useState("profile");
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [mm, setMm] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [month, setMonth] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: "Approved Leave", from: todayYmd(), to: todayYmd(), reason: "" });
  const [slip, setSlip] = useState(() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return { month: d.getMonth() + 1, year: d.getFullYear() }; });
  const [exits, setExits] = useState([]);
  const [exitForm, setExitForm] = useState({ exitDate: "", reason: "" });
  const [hYear, setHYear] = useState(now.getFullYear());
  const [holidays, setHolidays] = useState(null);

  const loadProfile = () => { hrApi("/me/profile").then(setProfile).catch(() => {}); hrApi("/me/exit").then(setExits).catch(() => {}); };
  const loadMe = () => { loadProfile(); return hrApi("/me").then(setMe).catch((e) => setError(e.message)); };
  const loadLeaves = () => hrApi("/me/leaves").then(setLeaves).catch(() => {});
  useEffect(() => { loadMe(); loadLeaves(); }, []);
  useEffect(() => { if (me) hrApi(`/me/attendance?month=${mm.month}&year=${mm.year}`).then(setMonth).catch((e) => setMsg({ kind: "error", text: e.message })); }, [me, mm.month, mm.year]);
  useEffect(() => { if (tab === "holidays") hrApi(`/me/holidays?year=${hYear}`).then(setHolidays).catch((e) => setMsg({ kind: "error", text: e.message })); }, [tab, hYear]);
  const chosen = useRef(false);
  const go = (t) => { chosen.current = true; setTab(t); setMsg(null); };
  // reporting managers land on their Approvals first (until they pick another tab)
  useEffect(() => { if (profile?.isManager && !chosen.current) setTab("approvals"); }, [profile?.isManager]);

  const markToday = async () => { try { await hrApi("/me/attendance", { method: "POST" }); setMsg({ kind: "ok", text: "Attendance marked for today." }); loadMe(); setMm({ ...mm }); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const apply = async () => { try { await hrApi("/me/leaves", { method: "POST", body: form }); setMsg({ kind: "ok", text: "Leave applied — waiting for approval." }); setForm({ ...form, reason: "" }); loadLeaves(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const submitExit = async () => {
    if (!window.confirm("Submit your exit request to your reporting manager?")) return;
    try { await hrApi("/me/exit", { method: "POST", body: exitForm }); setMsg({ kind: "ok", text: "Exit request submitted — your reporting manager has been informed." }); setExitForm({ exitDate: "", reason: "" }); loadProfile(); }
    catch (e) { setMsg({ kind: "error", text: e.message }); }
  };

  // a reporting manager may not have an employee record of their own — they still get the Manager inbox
  if (error) return <div className="p-4 space-y-4 max-w-5xl mx-auto"><ManagerInbox /><Notice kind="warn">{error}</Notice></div>;
  if (!me) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  const t = me.today;
  const todayNote = t.status ? `Marked: ${t.status}` : t.weeklyOff ? "Sunday — weekly off" : t.holiday ? "Holiday" : t.beforeJoining ? "Before your joining date" : null;
  const tabs = [...(profile?.isManager ? [["approvals", "Approvals"]] : []), ...TABS];
  const today = todayYmd();
  const nextHoliday = (holidays || []).find((h) => h.date >= today);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div><h1 className="text-2xl font-bold text-gray-800">My HR</h1><p className="text-sm text-gray-500">{me.employee.employeeCode} · {me.employee.name} · {me.employee.designation}</p></div>
      <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="My HR">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => go(k)}
            className={cx("px-4 py-2 text-sm whitespace-nowrap -mb-px border-b-2", tab === k ? "border-indigo-600 text-indigo-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-800")}>{l}</button>
        ))}
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      {tab === "approvals" && <ManagerInbox />}

      {tab === "profile" && profile && (
        <Card title="Profile" actions={<Btn kind="outline" onClick={() => openHrPdf("/me/id-card").catch((e) => setMsg({ kind: "error", text: e.message }))}><FaFilePdf /> View ID Card</Btn>}>
          <div className="flex flex-wrap gap-4 items-start" data-profile>
            <div className="w-20 h-24 border rounded bg-gray-50 overflow-hidden flex items-center justify-center">{profile.employee.photo ? <img src={profile.employee.photo} alt="Photo" className="max-w-full max-h-full" /> : <span className="text-xs text-gray-400">Photo</span>}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm flex-1">
              {[["Employee Code", profile.employee.employeeCode], ["Department", profile.employee.department], ["Reporting to", profile.employee.reportingManager], ["Joined", fmtDate(profile.employee.dateOfJoining)], ["Blood Group", profile.employee.bloodGroup], ["Date of Birth", fmtDate(profile.employee.dob)], ["Emergency No.", profile.employee.emergencyNo], ["E-mail", profile.employee.email], ["Mobile", profile.employee.mobile]].map(([l, v]) => <div key={l}><span className="text-xs text-gray-500">{l}</span><div className="break-words">{v || "—"}</div></div>)}
            </div>
          </div>
          <div className="mt-3 text-sm"><b>Assets with you:</b> {profile.assets.filter((a) => a.status === "Assigned").map((a) => `${a.assetType} (${a.assetId})`).join(", ") || "none"}</div>
          {profile.letters.length > 0 && <div className="mt-2 flex flex-wrap gap-2 text-sm"><b>Letters:</b> {profile.letters.map((l) => <button key={l._id} type="button" className="text-indigo-600 underline" onClick={() => openHrPdf(`/requests/${l._id}/letter`)}>{l.label} ({fmtDate(l.date)})</button>)}</div>}
        </Card>
      )}

      {tab === "attendance" && (
        <>
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
        </>
      )}

      {tab === "slips" && (
        <Card title="Salary Slip">
          <div className="flex flex-wrap gap-3 items-end">
            <MonthPicker {...slip} onChange={setSlip} />
            <Btn onClick={() => openHrPdf(`/me/salary-slip?month=${slip.month}&year=${slip.year}`).catch((e) => setMsg({ kind: "error", text: e.message }))}><FaFilePdf /> View slip — {MONTHS[slip.month - 1]} {slip.year}</Btn>
          </div>
          <p className="text-xs text-gray-500 mt-2">Available after the month ends.</p>
        </Card>
      )}

      {tab === "leave" && (
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
      )}

      {tab === "exit" && (
        <Card title="Exit / Paper Submit">
          {exits.map((x) => <p key={x._id} className="text-sm mb-1" data-my-exit>Exit date {fmtDate(x.exitDate)} — <Badge s={x.status === "Auto-Approved" ? "Approved" : x.status === "On Hold" ? "Pending" : x.status} /> {x.status}{x.remarks ? ` · ${x.remarks}` : ""}</p>)}
          {!exits.some((x) => ["Pending", "On Hold"].includes(x.status)) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end" data-form="exit">
              <Field label="Exit Mark Date" required><input type="date" aria-label="Exit Mark Date" min={todayYmd()} value={exitForm.exitDate} onChange={(e) => setExitForm({ ...exitForm, exitDate: e.target.value })} className={inputCls()} /></Field>
              <Field label="Reporting Manager"><input readOnly value={profile?.employee.reportingManager || ""} className={inputCls(false, true)} /></Field>
              <Field label="Assets List"><input readOnly value={(profile?.assets || []).filter((a) => a.status === "Assigned").map((a) => a.assetType).join(", ") || "None"} className={inputCls(false, true)} /></Field>
              <Field label="Reason for Exit" required className="md:col-span-3"><textarea aria-label="Reason for Exit" rows="2" value={exitForm.reason} onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })} className={inputCls()} /></Field>
              <div className="md:col-span-3 flex justify-end"><Btn kind="danger" onClick={submitExit} disabled={!exitForm.exitDate || !exitForm.reason.trim()}>Submit</Btn></div>
            </div>
          )}
        </Card>
      )}

      {tab === "holidays" && (
        <Card title={`Holiday Calendar ${hYear}`} actions={
          <select aria-label="Holiday year" value={hYear} onChange={(e) => setHYear(Number(e.target.value))} className={cx(inputCls(), "w-28")}>{[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y}>{y}</option>)}</select>
        }>
          {!holidays ? <p className="text-sm text-gray-500">Loading…</p> : !holidays.length ? <p className="text-sm text-gray-500">No holidays published for {hYear} yet.</p> : (
            <div className="space-y-3" data-holidays>
              {MONTHS.map((m, i) => {
                const inMonth = holidays.filter((h) => Number(h.date.slice(5, 7)) === i + 1);
                if (!inMonth.length) return null;
                return (
                  <div key={m}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">{m}</h4>
                    {inMonth.map((h) => (
                      <div key={h._id} className={cx("flex flex-wrap items-center gap-3 py-2 px-3 rounded-lg border mb-1 text-sm", h === nextHoliday ? "border-indigo-300 bg-indigo-50" : h.date < today ? "border-gray-100 text-gray-400" : "border-gray-200")} data-holiday={h.date}>
                        <span className="w-28 font-medium">{fmtDate(h.date)}</span>
                        <span className="w-24 text-gray-500">{new Date(`${h.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long" })}</span>
                        <span className="flex-1 font-medium">{h.name}{h === nextHoliday && <span className="ml-2 text-xs text-indigo-700">next holiday</span>}</span>
                        {h.remarks && <span className="text-xs text-gray-500">{h.remarks}</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
