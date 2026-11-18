// src/components/hr/Employees.jsx — My HR › Employees (profile, CRM login, promotion history)
import { useEffect, useState } from "react";
import { FaArrowLeft, FaUserPlus, FaLink, FaFilePdf } from "react-icons/fa";
import { hrApi, openHrPdf, inr, fmtDate } from "./hrApi";
import { computeSalary } from "./hrSalary";
import { Field, Btn, Card, Notice, Badge, inputCls } from "./ui";
import MasterSelect from "./MasterSelect";
import SalaryEditor from "./SalaryEditor";
import { todayYmd } from "./hrApi";

const ymd = (v) => (v ? String(v).slice(0, 10) : "");
const JOB_DROPDOWNS = [["designation", "Designation"], ["department", "Department"], ["reportingManager", "Reporting Manager"], ["rank", "Rank"], ["employmentType", "Employment Type"], ["workSchedule", "Working Hour / Schedule"], ["jobVenue", "Job Venue"]];

export default function Employees({ settings, reloadKey, masters, setMasters }) {
  const [list, setList] = useState([]);
  const [emp, setEmp] = useState(null);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [login, setLogin] = useState({ email: "" });
  const [created, setCreated] = useState(null);
  const [details, setDetails] = useState(null); // edit form
  const [salary, setSalary] = useState(null);   // salary structure form

  const load = async () => { try { setList(await hrApi("/employees")); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  useEffect(() => { load(); }, [reloadKey]);
  // keep: reload after an action without clearing its message (e.g. the new login's password)
  const open = async (id, keep = false) => {
    if (!keep) { setMsg(null); setCreated(null); }
    try {
      const [e, u] = await Promise.all([hrApi(`/employees/${id}`), hrApi("/users")]);
      setEmp(e); setUsers(u); setLogin({ email: e.email || "" });
      setDetails(null);
      setSalary(e.salary?.earnings ? null : { effectiveFrom: ymd(e.dateOfJoining) || todayYmd(), earnings: {}, deductions: [], insurance: {}, deductionAmounts: {} });
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const update = async (body, okText) => { try { setEmp(await hrApi(`/employees/${emp._id}`, { method: "PUT", body })); setMsg({ kind: "ok", text: okText }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const createLogin = async () => {
    try { const r = await hrApi(`/employees/${emp._id}/create-login`, { method: "POST", body: login }); setCreated(r); await open(emp._id, true); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };

  if (!emp) {
    return (
      <Card title="Employees">
        {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
        {!list.length ? <p className="text-sm text-gray-500">Employees appear here once their documentation is fully approved.</p> : (
          <table className="w-full text-sm" data-table="employees">
            <thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Designation</th><th className="p-2">Joined</th><th className="p-2">CRM login</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
            <tbody>{list.map((e) => (
              <tr key={e._id} className="border-t">
                <td className="p-2 font-medium">{e.employeeCode}</td><td className="p-2">{e.name}</td><td className="p-2">{e.designation}<div className="text-xs text-gray-500">{e.department}</div></td>
                <td className="p-2">{fmtDate(e.dateOfJoining)}</td><td className="p-2 text-xs">{e.user ? "Linked" : <span className="text-amber-700">Not linked</span>}</td>
                <td className="p-2"><Badge s={e.status} /></td><td className="p-2"><Btn kind="outline" onClick={() => open(e._id)}>Open</Btn></td>
              </tr>))}
            </tbody>
          </table>
        )}
      </Card>
    );
  }

  const calc = computeSalary(emp.salary || {}, settings || {});
  const openDetails = () => setDetails({
    designation: emp.designation || "", department: emp.department || "", reportingManager: emp.reportingManager || "", rank: emp.rank || "",
    employmentType: emp.employmentType || "", workSchedule: emp.workSchedule || "", jobVenue: emp.jobVenue || "", dateOfJoining: ymd(emp.dateOfJoining),
    fatherName: emp.fatherName || "", relationPrefix: emp.relationPrefix || "S/O", address: emp.address || "", email: emp.email || "", mobile: emp.mobile || "",
    bankName: emp.bank?.bankName || "", branch: emp.bank?.branch || "", accountNo: emp.bank?.accountNo || "", ifsc: emp.bank?.ifsc || "",
    pan: emp.pan || "", aadhaar: emp.aadhaar || "", uan: emp.uan || "", esicNo: emp.esicNo || "",
  });
  const saveDetails = async () => { try { setEmp(await hrApi(`/employees/${emp._id}/details`, { method: "PUT", body: details })); setDetails(null); setMsg({ kind: "ok", text: "Details saved." }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const openSalary = () => setSalary({ effectiveFrom: todayYmd(), earnings: { ...(emp.salary?.earnings || {}) }, deductions: [...(emp.salary?.deductions || [])], insurance: { ...(emp.salary?.insurance || {}) }, deductionAmounts: emp.salary?.deductionAmounts ? { ...emp.salary.deductionAmounts } : undefined });
  const saveSalary = async () => { try { setEmp(await hrApi(`/employees/${emp._id}/salary`, { method: "PUT", body: salary })); setSalary(null); setMsg({ kind: "ok", text: "Salary structure saved — the employee is now in the salary register." }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const dt = (k, label, props = {}) => <Field label={label}><input aria-label={label} value={details[k]} onChange={(ev) => setDetails({ ...details, [k]: ev.target.value })} className={inputCls()} {...props} /></Field>;
  const row = (l, v) => <div className="flex justify-between gap-3 py-1 border-b border-gray-100 text-sm"><span className="text-gray-500">{l}</span><span className="text-right break-all">{v || "—"}</span></div>;
  return (
    <Card title={<span className="flex items-center gap-2"><button type="button" aria-label="Back" onClick={() => { setEmp(null); load(); }} className="text-gray-500 hover:text-gray-800"><FaArrowLeft /></button>{emp.employeeCode} — {emp.name} <Badge s={emp.status} /></span>}
      actions={<Btn kind="secondary" onClick={() => update({ status: emp.status === "Active" ? "Inactive" : "Active" }, "Status updated.")}>{emp.status === "Active" ? "Mark Inactive" : "Mark Active"}</Btn>}>
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div><h4 className="font-semibold text-sm text-gray-700 mb-2">Job</h4>
          {row("Designation", emp.designation)}{row("Department", emp.department)}{row("Rank", emp.rank)}{row("Reporting to", emp.reportingManager)}{row("Joined", fmtDate(emp.dateOfJoining))}{row("Employment", emp.employmentType)}{row("Schedule", emp.workSchedule)}{row("Location", emp.jobVenue)}
        </div>
        <div><h4 className="font-semibold text-sm text-gray-700 mb-2">Bank & IDs</h4>
          {row("Bank", emp.bank?.bankName)}{row("Account No.", emp.bank?.accountNo)}{row("IFSC", emp.bank?.ifsc)}{row("Branch", emp.bank?.branch)}{row("PAN", emp.pan)}{row("Aadhaar", emp.aadhaar)}{row("UAN", emp.uan)}{row("ESIC", emp.esicNo)}
        </div>
        <div><h4 className="font-semibold text-sm text-gray-700 mb-2">Salary (per month)</h4>
          {row("Gross", inr(calc.gross.m))}{row("Total Deduction", inr(calc.totalDeduction.m))}{row("CTC", inr(calc.ctc.m))}{row("In-Hand", inr(calc.inHand.m))}{row("Deductions", (emp.salary?.deductions || []).join(", "))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!details && <Btn kind="outline" onClick={openDetails}>Edit details</Btn>}
        {!salary && <Btn kind="outline" onClick={openSalary}>{emp.salary?.earnings ? "Revise salary structure" : "Set salary structure"}</Btn>}
        {!emp.salary?.earnings && <span className="text-xs text-amber-700 self-center">No salary structure yet — set it to include this employee in payroll.</span>}
      </div>
      {details && (
        <div className="mt-4 border rounded-lg p-4" data-form="details">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">Edit details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {JOB_DROPDOWNS.map(([k, l]) => <Field key={k} label={l}><MasterSelect type={k} label={l} value={details[k]} onChange={(v) => setDetails({ ...details, [k]: v })} masters={masters} setMasters={setMasters} withEmail={k === "reportingManager"} /></Field>)}
            {dt("dateOfJoining", "Date of Joining", { type: "date" })}
            <Field label="Father's / Husband's Name"><div className="flex gap-2"><select aria-label="Relation" value={details.relationPrefix} onChange={(ev) => setDetails({ ...details, relationPrefix: ev.target.value })} className={inputCls() + " w-20"}><option>S/O</option><option>D/O</option><option>W/O</option></select><input aria-label="Father's / Husband's Name" value={details.fatherName} onChange={(ev) => setDetails({ ...details, fatherName: ev.target.value })} className={inputCls()} /></div></Field>
            {dt("email", "E-mail", { type: "email" })}{dt("mobile", "Mobile", { inputMode: "numeric", maxLength: 10 })}
            <Field label="Address" className="sm:col-span-2"><input aria-label="Address" value={details.address} onChange={(ev) => setDetails({ ...details, address: ev.target.value })} className={inputCls()} /></Field>
            {dt("bankName", "Bank Name")}{dt("branch", "Branch")}{dt("accountNo", "Account No.")}{dt("ifsc", "IFSC")}{dt("pan", "PAN")}{dt("aadhaar", "Aadhaar")}{dt("uan", "PF UAN No.")}{dt("esicNo", "ESIC No.")}
          </div>
          <p className="text-xs text-gray-500 mt-2">Masked numbers (XXXX1234) are kept as they are unless you type a new value.</p>
          <div className="flex justify-end gap-2 mt-3"><Btn kind="secondary" onClick={() => setDetails(null)}>Cancel</Btn><Btn onClick={saveDetails}>Save details</Btn></div>
        </div>
      )}
      {salary && (
        <div className="mt-4 border rounded-lg p-4" data-form="salary">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <h4 className="font-semibold text-sm text-gray-700">Salary structure</h4>
            <Field label="Effective from" required><input type="date" aria-label="Effective from" value={salary.effectiveFrom} onChange={(ev) => setSalary({ ...salary, effectiveFrom: ev.target.value })} className={inputCls()} /></Field>
          </div>
          <SalaryEditor value={salary} onChange={(v) => setSalary({ ...salary, earnings: v.earnings, deductions: v.deductions, insurance: v.insurance, deductionAmounts: v.deductionAmounts })} settings={settings} />
          <div className="flex justify-end gap-2 mt-3">{emp.salary?.earnings && <Btn kind="secondary" onClick={() => setSalary(null)}>Cancel</Btn>}<Btn onClick={saveSalary}>Save salary structure</Btn></div>
        </div>
      )}
      <div className="mt-5 border-t pt-4" data-section="login">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">CRM login (for attendance and leave)</h4>
        {created && <div className="mb-3"><Notice kind="ok">Login created — User ID <b>{created.username}</b>, password <b>{created.password}</b>. Share it once; the employee should change it after the first login.</Notice></div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Link an existing CRM user">
            <div className="flex gap-2">
              <select aria-label="CRM user" value={emp.user || ""} onChange={(e) => update({ user: e.target.value || null }, e.target.value ? "Login linked." : "Login unlinked.")} className={inputCls()}>
                <option value="">— not linked —</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name} {u.email ? `(${u.email})` : ""} — {u.role}</option>)}
              </select>
              <span className="self-center text-indigo-600"><FaLink /></span>
            </div>
          </Field>
          {!emp.user && (
            <Field label="…or create a new login" hint="Username = employee code">
              <div className="flex gap-2"><input aria-label="Login e-mail" type="email" value={login.email} onChange={(e) => setLogin({ email: e.target.value })} className={inputCls()} placeholder="E-mail" /><Btn onClick={createLogin}><FaUserPlus /> Create</Btn></div>
            </Field>
          )}
        </div>
      </div>
      {(emp.promotions || []).length > 0 && (
        <div className="mt-5 border-t pt-4"><h4 className="font-semibold text-sm text-gray-700 mb-2">Promotion history</h4>
          {emp.promotions.map((p) => (
            <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 border-b">
              <span>{fmtDate(p.effectiveDate)} — {p.from.designation} → <b>{p.to.designation}</b> ({p.refId})</span>
              <Btn kind="secondary" onClick={() => openHrPdf(`/employees/${emp._id}/promotions/${p._id}/letter`).catch((e) => setMsg({ kind: "error", text: e.message }))}><FaFilePdf /> Letter</Btn>
            </div>
          ))}
        </div>
      )}
      {(emp.audit || []).length > 0 && (
        <details className="mt-5 border-t pt-4"><summary className="text-sm font-semibold text-gray-700 cursor-pointer">Audit trail ({emp.audit.length})</summary>
          <ul className="text-xs text-gray-600 mt-2 space-y-1">{[...emp.audit].reverse().map((a, i) => <li key={i}>{new Date(a.at).toLocaleString("en-IN")} — {a.by}: {a.action}{a.details ? ` (${a.details})` : ""}</li>)}</ul>
        </details>
      )}
    </Card>
  );
}
