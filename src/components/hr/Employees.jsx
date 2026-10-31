// src/components/hr/Employees.jsx — My HR › Employees (profile, CRM login, promotion history)
import { useEffect, useState } from "react";
import { FaArrowLeft, FaUserPlus, FaLink, FaFilePdf } from "react-icons/fa";
import { hrApi, openHrPdf, inr, fmtDate } from "./hrApi";
import { computeSalary } from "./hrSalary";
import { Field, Btn, Card, Notice, Badge, inputCls } from "./ui";

export default function Employees({ settings, reloadKey }) {
  const [list, setList] = useState([]);
  const [emp, setEmp] = useState(null);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [login, setLogin] = useState({ email: "" });
  const [created, setCreated] = useState(null);

  const load = async () => { try { setList(await hrApi("/employees")); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  useEffect(() => { load(); }, [reloadKey]);
  // keep: reload after an action without clearing its message (e.g. the new login's password)
  const open = async (id, keep = false) => {
    if (!keep) { setMsg(null); setCreated(null); }
    try {
      const [e, u] = await Promise.all([hrApi(`/employees/${id}`), hrApi("/users")]);
      setEmp(e); setUsers(u); setLogin({ email: e.email || "" });
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
      <div className="mt-5 border-t pt-4" data-section="login">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">CRM login (for attendance and leave)</h4>
        {created && <div className="mb-3"><Notice kind="ok">Login created — username <b>{created.username}</b> or {created.email}, password <b>{created.password}</b>. Share it once; the employee should change it after the first login.</Notice></div>}
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
