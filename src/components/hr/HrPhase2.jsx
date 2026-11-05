// src/components/hr/HrPhase2.jsx — Additional Feature BRD screens
//   Assets · Confirmation · Exits · Relieving Letters · Promotion & Hike · Documents · Manager inbox
import { useEffect, useState } from "react";
import { FaEnvelope, FaFilePdf, FaCheck, FaTimes, FaPause, FaUndo, FaUpload, FaIdCard } from "react-icons/fa";
import { hrApi, hrUpload, openHrPdf, inr, fmtDate, todayYmd } from "./hrApi";
import { computeSalary } from "./hrSalary";
import { Field, Btn, Card, Modal, Notice, Badge, inputCls, cx } from "./ui";
import MasterSelect from "./MasterSelect";
import EmployeeSelect from "./EmployeeSelect";

const useEmployees = () => {
  const [emps, setEmps] = useState([]);
  const load = () => hrApi("/employees").then(setEmps).catch(() => {});
  useEffect(() => { load(); }, []);
  return [emps, load];
};
const errText = (e) => [e.message, ...(e.errors || []).filter((x) => typeof x === "string")].join(" — ");
const pdfOr = (setMsg) => (path) => openHrPdf(path).catch((e) => setMsg({ kind: "error", text: e.message }));

// ============================================================ ASSETS
export function Assets({ masters, setMasters }) {
  const [emps] = useEmployees();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ employeeId: "", assetType: "", brand: "", model: "", assetId: "", assignedOn: todayYmd(), remarks: "" });
  const [msg, setMsg] = useState(null);
  const load = () => hrApi("/assets").then(setList).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  const emp = emps.find((e) => e._id === form.employeeId);
  const set = (p) => setForm((f) => ({ ...f, ...p }));
  const assign = async () => { try { await hrApi("/assets", { method: "POST", body: form }); setMsg({ kind: "ok", text: "Asset assigned." }); set({ assetId: "", remarks: "" }); load(); } catch (e) { setMsg({ kind: "error", text: errText(e) }); } };
  const mail = async (a) => { try { const r = await hrApi(`/assets/${a._id}/email`, { method: "POST" }); setMsg({ kind: "ok", text: `Confirmation e-mailed to ${r.to}.` }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const toggle = async (a) => { try { await hrApi(`/assets/${a._id}`, { method: "PUT", body: { status: a.status === "Assigned" ? "Returned" : "Assigned" } }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  return (
    <div className="space-y-4">
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title="Assign asset">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-form="asset">
          <Field label="Employee" required className="lg:col-span-1"><EmployeeSelect employees={emps} value={form.employeeId} onChange={(id) => set({ employeeId: id })} /></Field>
          <Field label="Department"><input readOnly value={emp?.department || ""} className={inputCls(false, true)} /></Field>
          <Field label="E-mail ID"><input readOnly value={emp?.email || ""} className={inputCls(false, true)} /></Field>
          <Field label="Asset" required><MasterSelect type="assetType" label="Asset" value={form.assetType} onChange={(v) => set({ assetType: v })} masters={masters} setMasters={setMasters} /></Field>
          <Field label="Asset Brand"><MasterSelect type="assetBrand" label="Asset Brand" value={form.brand} onChange={(v) => set({ brand: v })} masters={masters} setMasters={setMasters} /></Field>
          <Field label="Asset Model"><MasterSelect type="assetModel" label="Asset Model" value={form.model} onChange={(v) => set({ model: v })} masters={masters} setMasters={setMasters} /></Field>
          <Field label="Asset ID (serial no.)" required><input data-field="assetId" value={form.assetId} onChange={(e) => set({ assetId: e.target.value })} className={inputCls()} /></Field>
          <Field label="Assigned on"><input type="date" value={form.assignedOn} onChange={(e) => set({ assignedOn: e.target.value })} className={inputCls()} /></Field>
          <Field label="Remarks"><input value={form.remarks} onChange={(e) => set({ remarks: e.target.value })} className={inputCls()} /></Field>
        </div>
        <div className="flex justify-end mt-3"><Btn onClick={assign} disabled={!form.employeeId || !form.assetType || !form.assetId.trim()}>Assign</Btn></div>
      </Card>
      <Card title={`Assets (${list.filter((a) => a.status === "Assigned").length} with employees)`}>
        <table className="w-full text-sm" data-table="assets"><thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Employee</th><th className="p-2">Asset</th><th className="p-2">Asset ID</th><th className="p-2">Assigned</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
          <tbody>{list.map((a) => (
            <tr key={a._id} className="border-t">
              <td className="p-2">{a.employeeCode} {a.name}</td><td className="p-2">{a.assetType}<div className="text-xs text-gray-500">{[a.brand, a.model].filter(Boolean).join(" · ")}</div></td>
              <td className="p-2 font-mono text-xs">{a.assetId}</td><td className="p-2">{fmtDate(a.assignedOn)}</td>
              <td className="p-2"><Badge s={a.status === "Assigned" ? "Pending" : "Approved"} /> <span className="text-xs">{a.status}</span></td>
              <td className="p-2 flex gap-2 flex-wrap">
                <Btn kind="secondary" onClick={() => mail(a)}><FaEnvelope /> {a.confirmationSentAt ? "Re-send" : "E-mail confirmation"}</Btn>
                <Btn kind="secondary" onClick={() => toggle(a)}><FaUndo /> {a.status === "Assigned" ? "Mark returned" : "Re-assign"}</Btn>
              </td>
            </tr>))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================ CONFIRMATION
export function Confirmations() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const load = () => hrApi("/confirmations").then(setRows).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  const send = async (r) => { if (!window.confirm(`Send the confirmation letter to ${r.name}?`)) return; try { await hrApi(`/confirmations/${r._id}/send`, { method: "POST" }); setMsg({ kind: "ok", text: `Confirmation letter sent to ${r.name}.` }); load(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  return (
    <Card title="Confirmation Letter — employees who completed 6 months">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      {!rows.length ? <p className="text-sm text-gray-500">No employee has completed 6 months yet.</p> : (
        <table className="w-full text-sm" data-table="confirmations"><thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Employee Code</th><th className="p-2">Name</th><th className="p-2">Department</th><th className="p-2">Designation</th><th className="p-2 text-right">CTC Monthly</th><th className="p-2 text-right">CTC Annum</th><th className="p-2"></th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r._id} className="border-t"><td className="p-2 font-medium">{r.employeeCode}</td><td className="p-2">{r.name}</td><td className="p-2">{r.department}</td><td className="p-2">{r.designation}</td>
              <td className="p-2 text-right">{inr(r.ctcMonthly)}</td><td className="p-2 text-right">{inr(r.ctcAnnum)}</td>
              <td className="p-2">{r.confirmedAt ? <span className="text-xs text-emerald-700">Sent {fmtDate(r.confirmedAt)}</span> : <Btn onClick={() => send(r)}><FaEnvelope /> Send</Btn>}</td></tr>))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ============================================================ DECISION BUTTONS (manager / HR)
function Decide({ path, onDone, labels = ["Approve", "Reject", "Hold"], remarksRequiredForApprove = false }) {
  const [remarks, setRemarks] = useState("");
  const [err, setErr] = useState("");
  const go = async (status) => {
    setErr("");
    try { await hrApi(path, { method: "POST", body: { status, remarks } }); onDone && onDone(status); } catch (e) { setErr(e.message); }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2" data-decide>
      <input aria-label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={remarksRequiredForApprove ? "Remarks (required)" : "Remarks (required to reject / hold)"} className={cx(inputCls(), "max-w-xs")} />
      <Btn kind="success" onClick={() => go("Approved")}><FaCheck /> {labels[0]}</Btn>
      <Btn kind="danger" onClick={() => go("Rejected")}><FaTimes /> {labels[1]}</Btn>
      <Btn kind="secondary" onClick={() => go("On Hold")}><FaPause /> {labels[2]}</Btn>
      {err && <span className="text-red-600 text-xs w-full">{err}</span>}
    </div>
  );
}

// ============================================================ EXITS
export function Exits() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const load = () => hrApi("/exits").then(setRows).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  return (
    <Card title="Employee Exit">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      {!rows.length ? <p className="text-sm text-gray-500">No exit requests.</p> : rows.map((x) => (
        <div key={x._id} className="border rounded-lg p-3 mb-2" data-exit={x._id}>
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <div><b>{x.employeeCode} {x.name}</b> — exit date {fmtDate(x.exitDate)} <Badge s={x.status === "Auto-Approved" ? "Approved" : x.status === "On Hold" ? "Pending" : x.status} /> <span className="text-xs">{x.status}</span>
              <div className="text-xs text-gray-600">Reason: {x.reason} · Reporting manager: {x.reportingManager || "—"} · Assets: {x.assets.length ? x.assets.map((a) => `${a.assetType} (${a.assetId})`).join(", ") : "none"}</div>
              {x.remarks && <div className="text-xs text-gray-600">Remarks: {x.remarks} ({x.decidedBy})</div>}
              {x.autoApproveOn && <div className="text-xs text-amber-700">Auto-approves on {fmtDate(x.autoApproveOn)} if no action is taken</div>}
              {(x.notifications || []).some((n) => !n.ok) && <div className="text-xs text-red-600">An e-mail could not be sent — check the mail settings.</div>}
            </div>
            <span className="text-xs text-gray-500">Submitted {fmtDate(x.createdAt)}</span>
          </div>
          {["Pending", "On Hold"].includes(x.status) && <Decide path={`/exits/${x._id}/decide`} labels={["Accept", "Reject", "Hold"]} remarksRequiredForApprove onDone={(s) => { setMsg({ kind: "ok", text: `Exit ${s === "On Hold" ? "put on hold" : s.toLowerCase()} — e-mails sent.` }); load(); }} />}
        </div>
      ))}
    </Card>
  );
}

// ============================================================ RELIEVING
export function Relieving() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [assets, setAssets] = useState(null);
  const [release, setRelease] = useState(null);
  const load = () => hrApi("/relieving").then(setRows).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  const send = async () => {
    try { await hrApi(`/relieving/${release.row._id}/send`, { method: "POST", body: { lastWorkingDay: release.lwd } }); setMsg({ kind: "ok", text: `Relieving letter sent to ${release.row.reportingManager} for approval.` }); setRelease(null); load(); }
    catch (e) { setMsg({ kind: "error", text: e.message }); setRelease(null); }
  };
  return (
    <Card title="Relieving Letter">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      <div className="overflow-x-auto"><table className="w-full text-xs" data-table="relieving"><thead className="text-left text-gray-500 bg-gray-50"><tr>
        <th className="p-2">Sr No.</th><th className="p-2">Employee Code</th><th className="p-2">Name</th><th className="p-2">Department</th><th className="p-2">Position</th><th className="p-2">Employee Email ID</th>
        <th className="p-2">Reporting Manager</th><th className="p-2">RM Email ID</th><th className="p-2">Assets Status</th><th className="p-2"></th></tr></thead>
        <tbody>{rows.map((r) => {
          const n = r.pendingAssets.length;
          const req = r.request;
          return (
            <tr key={r._id} className="border-t" data-row={r.employeeCode}>
              <td className="p-2">{r.sr}</td><td className="p-2 font-medium">{r.employeeCode}</td><td className="p-2">{r.name}</td><td className="p-2">{r.department}</td><td className="p-2">{r.position}</td>
              <td className="p-2 break-all">{r.email}</td><td className="p-2">{r.reportingManager}</td><td className="p-2 break-all">{r.rmEmail || <span className="text-red-600">missing</span>}</td>
              <td className="p-2">{n ? <button type="button" className="text-red-600 underline font-medium" onClick={() => setAssets(r)} data-pending={n}>{n} pending</button> : <span className="text-emerald-700">0 pending</span>}</td>
              <td className="p-2">
                {r.relievedAt ? <span className="text-emerald-700">Relieved</span>
                  : req && ["Pending", "On Hold"].includes(req.status) ? <span className="text-amber-700">With RM ({req.status})</span>
                  : <Btn disabled={n > 0} onClick={() => setRelease({ row: r, lwd: r.exit?.exitDate ? String(r.exit.exitDate).slice(0, 10) : todayYmd() })} title={n ? "Return all assets first" : ""}>Release</Btn>}
                {req && req.status === "Approved" && <button type="button" className="text-indigo-600 underline ml-2" onClick={() => pdfOr(setMsg)(`/requests/${req._id}/letter`)}>Letter</button>}
              </td>
            </tr>
          );
        })}</tbody>
      </table></div>
      {assets && (
        <Modal title={`Pending assets — ${assets.employeeCode} ${assets.name}`} onClose={() => setAssets(null)}>
          <ul className="text-sm space-y-1">{assets.pendingAssets.map((a) => <li key={a._id}>• {a.assetType} {[a.brand, a.model].filter(Boolean).join(" ")} — <span className="font-mono">{a.assetId}</span></li>)}</ul>
          <p className="text-xs text-gray-500 mt-3">Mark them returned in My HR › Assets to enable the relieving letter.</p>
        </Modal>
      )}
      {release && (
        <Modal title={`Release relieving letter — ${release.row.name}`} onClose={() => setRelease(null)}>
          <Field label="Last working day" required><input type="date" aria-label="Last working day" value={release.lwd} onChange={(e) => setRelease({ ...release, lwd: e.target.value })} className={inputCls()} /></Field>
          <p className="text-sm text-gray-600 mt-3">The letter goes to <b>{release.row.reportingManager}</b> only. When they approve it, it is e-mailed to the employee with them in CC.</p>
          <div className="flex justify-end gap-2 mt-4"><Btn kind="secondary" onClick={() => setRelease(null)}>Cancel</Btn><Btn onClick={send}><FaEnvelope /> Send to reporting manager</Btn></div>
        </Modal>
      )}
    </Card>
  );
}

// ============================================================ PROMOTION & SALARY HIKE
export function PromotionHike({ masters, setMasters, settings }) {
  const [emps] = useEmployees();
  const [emp, setEmp] = useState(null);
  const [form, setForm] = useState({ kind: "Salary Hike", hikePercent: "", newDesignation: "", newDepartment: "", newRm: "" });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);
  const load = () => hrApi("/requests").then((l) => setList(l.filter((r) => r.kind !== "Relieving Letter"))).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  const pick = async (id) => { const e = await hrApi(`/employees/${id}`); setEmp(e); setForm((f) => ({ ...f, newDepartment: e.department, newRm: e.reportingManager })); };
  const set = (p) => setForm((f) => ({ ...f, ...p }));
  const rmEmail = (v) => (masters?.reportingManager || []).find((m) => m.value === v)?.email || "—";
<<<<<<< HEAD
  const cur = computeSalary(emp?.salary || {}, settings || {});
=======
  const cur = emp ? computeSalary(emp.salary || {}, settings || {}) : null;
>>>>>>> 81cb897ccc1ce715d5f4389393077eacc0b2a77e
  const pct = Number(form.hikePercent) || 0;
  const hiked = emp ? computeSalary({ ...(emp.salary || {}), earnings: Object.fromEntries(Object.entries(emp.salary?.earnings || {}).map(([k, v]) => [k, Math.round((Number(v) || 0) * (1 + pct / 100))])) }, settings || {}) : null;
  const hike = form.kind !== "Promotion", promo = form.kind !== "Salary Hike";
  const submit = async () => {
<<<<<<< HEAD
    try { await hrApi("/requests", { method: "POST", body: { ...form, employeeId: emp._id } }); setMsg({ kind: "ok", text: `Letter assigned to ${promo ? form.newRm : emp.reportingManager} for approval.` }); setEmp(null); set({ hikePercent: "", newDesignation: "", newRm: "" }); load(); }
=======
    try { await hrApi("/requests", { method: "POST", body: { ...form, employeeId: emp._id } }); setMsg({ kind: "ok", text: `Letter assigned to ${promo ? form.newRm : emp.reportingManager} for approval.` }); setEmp(null); set({ hikePercent: "", newDesignation: "" }); load(); }
>>>>>>> 81cb897ccc1ce715d5f4389393077eacc0b2a77e
    catch (e) { setMsg({ kind: "error", text: errText(e) }); }
  };
  return (
    <div className="space-y-4">
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title="Promotion & Salary Hike">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Type" required><select aria-label="Type" value={form.kind} onChange={(e) => set({ kind: e.target.value })} className={inputCls()}><option>Salary Hike</option><option>Promotion</option><option value="Salary and Promotion">Salary and Promotion Both</option></select></Field>
          <Field label="Employee Code - Name" required className="lg:col-span-2"><EmployeeSelect employees={emps} value={emp?._id} onChange={(id) => pick(id)} /></Field>
        </div>
<<<<<<< HEAD
        {(
          <div className="mt-4 space-y-4" data-form="request">
            {emp && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm bg-gray-50 rounded-lg p-3">
              {[["Employee Code", emp.employeeCode], ["Name", emp.name], ["Department", emp.department], ["Position", emp.designation], ["Employee Email ID", emp.email], ["Reporting Manager", emp.reportingManager], ["RM Email ID", rmEmail(emp.reportingManager)]].map(([l, v]) => <div key={l}><div className="text-xs text-gray-500">{l}</div>{v || "—"}</div>)}
            </div>}
            {hike && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-section="hike">
                <Field label="Current CTC (per annum)"><input readOnly value={emp ? inr(cur.ctc.a) : "—"} className={inputCls(false, true)} /></Field>
                <Field label="Hike %" required><input data-field="hikePercent" inputMode="decimal" value={form.hikePercent} onChange={(e) => set({ hikePercent: e.target.value.replace(/[^\d.]/g, "") })} className={inputCls()} /></Field>
                <Field label="Hiked Salary CTC (calculated)" hint="Each salary component raised by the hike %"><input readOnly data-field="hikedCtc" value={pct && hiked ? `${inr(hiked.ctc.a)} / year (${inr(hiked.ctc.m)} / month)` : "—"} className={inputCls(false, true)} /></Field>
=======
        {emp && (
          <div className="mt-4 space-y-4" data-form="request">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm bg-gray-50 rounded-lg p-3">
              {[["Employee Code", emp.employeeCode], ["Name", emp.name], ["Department", emp.department], ["Position", emp.designation], ["Employee Email ID", emp.email], ["Reporting Manager", emp.reportingManager], ["RM Email ID", rmEmail(emp.reportingManager)]].map(([l, v]) => <div key={l}><div className="text-xs text-gray-500">{l}</div>{v || "—"}</div>)}
            </div>
            {hike && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-section="hike">
                <Field label="Current CTC (per annum)"><input readOnly value={inr(cur.ctc.a)} className={inputCls(false, true)} /></Field>
                <Field label="Hike %" required><input data-field="hikePercent" inputMode="decimal" value={form.hikePercent} onChange={(e) => set({ hikePercent: e.target.value.replace(/[^\d.]/g, "") })} className={inputCls()} /></Field>
                <Field label="Hiked Salary CTC (calculated)" hint="Each salary component raised by the hike %"><input readOnly data-field="hikedCtc" value={pct ? `${inr(hiked.ctc.a)} / year (${inr(hiked.ctc.m)} / month)` : "—"} className={inputCls(false, true)} /></Field>
>>>>>>> 81cb897ccc1ce715d5f4389393077eacc0b2a77e
              </div>
            )}
            {promo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-section="promotion">
<<<<<<< HEAD
                <Field label="Current Position"><input readOnly value={emp?.designation || ""} className={inputCls(false, true)} /></Field>
                <Field label="Promoted To Position" required><MasterSelect type="designation" label="Promoted To Position" value={form.newDesignation} onChange={(v) => set({ newDesignation: v })} masters={masters} setMasters={setMasters} /></Field>
                <Field label="Reporting Manager"><input readOnly value={emp?.reportingManager || ""} className={inputCls(false, true)} /></Field>
                <Field label="New Reporting Manager" required><MasterSelect type="reportingManager" label="New Reporting Manager" value={form.newRm} onChange={(v) => set({ newRm: v })} masters={masters} setMasters={setMasters} withEmail /></Field>
              </div>
            )}
            <div className="flex justify-end"><Btn onClick={() => (emp ? submit() : setMsg({ kind: "warn", text: "Choose the employee first." }))}>Letter Assigned</Btn></div>
=======
                <Field label="Current Position"><input readOnly value={emp.designation || ""} className={inputCls(false, true)} /></Field>
                <Field label="Promoted To Position" required><MasterSelect type="designation" label="Promoted To Position" value={form.newDesignation} onChange={(v) => set({ newDesignation: v })} masters={masters} setMasters={setMasters} /></Field>
                <Field label="Reporting Manager"><input readOnly value={emp.reportingManager || ""} className={inputCls(false, true)} /></Field>
                <Field label="New Reporting Manager" required><MasterSelect type="reportingManager" label="New Reporting Manager" value={form.newRm} onChange={(v) => set({ newRm: v })} masters={masters} setMasters={setMasters} withEmail /></Field>
              </div>
            )}
            <div className="flex justify-end"><Btn onClick={submit}>Letter Assigned</Btn></div>
>>>>>>> 81cb897ccc1ce715d5f4389393077eacc0b2a77e
          </div>
        )}
      </Card>
      <Card title="Requests">
        {!list.length ? <p className="text-sm text-gray-500">No requests yet.</p> : (
          <table className="w-full text-sm"><thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Employee</th><th className="p-2">Type</th><th className="p-2">Change</th><th className="p-2">With</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
            <tbody>{list.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.employeeCode} {r.name}</td><td className="p-2">{r.kind}</td>
                <td className="p-2 text-xs">{r.kind !== "Promotion" && <>Hike {r.payload.hikePercent}% ({inr(r.payload.current?.ctc?.a)} → {inr(r.payload.newCtc?.a)} /yr)<br /></>}{r.kind !== "Salary Hike" && <>{r.payload.current?.designation} → <b>{r.payload.newDesignation}</b></>}</td>
                <td className="p-2 text-xs">{r.approverRm}</td>
                <td className="p-2"><Badge s={r.status === "On Hold" ? "Pending" : r.status} /> <span className="text-xs">{r.status}</span>{r.remarks && <div className="text-xs text-gray-500">{r.remarks}</div>}</td>
                <td className="p-2">{r.status === "Approved" && <Btn kind="secondary" onClick={() => pdfOr(setMsg)(`/requests/${r._id}/letter`)}><FaFilePdf /> Letter</Btn>}</td>
              </tr>))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ============================================================ DOCUMENTS (Admin / Manager / HR)
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Other"];
export function HrDocuments() {
  const [emps] = useEmployees();
  const [data, setData] = useState(null);
  const [prof, setProf] = useState({});
  const [msg, setMsg] = useState(null);
  const open = async (id) => { setMsg(null); try { const d = await hrApi(`/employees/${id}/documents`); setData(d); setProf({ bloodGroup: d.employee.bloodGroup || "", dob: d.employee.dob ? String(d.employee.dob).slice(0, 10) : "", emergencyNo: d.employee.emergencyNo || "" }); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const save = async () => { try { await hrApi(`/employees/${data.employee._id}/profile`, { method: "PUT", body: prof }); setMsg({ kind: "ok", text: "Profile saved — the ID card uses it." }); open(data.employee._id); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const upload = async (kind, file) => {
    if (!file) return;
    if (!/\.(jpe?g)$/i.test(file.name)) return setMsg({ kind: "error", text: `The ${kind} must be a JPG or JPEG file.` });
    if (file.size > 100 * 1024) return setMsg({ kind: "error", text: `The ${kind} is ${Math.ceil(file.size / 1024)} KB — it must be under 100 KB.` });
    try { await hrUpload(`/employees/${data.employee._id}/upload/${kind}`, file); setMsg({ kind: "ok", text: `${kind === "photo" ? "Photo" : "Signature"} uploaded.` }); open(data.employee._id); } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const e = data?.employee;
  return (
    <Card title="Documents">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      <Field label="Employee" className="max-w-md"><EmployeeSelect employees={emps} value={e?._id} onChange={(id) => open(id)} includeInactive /></Field>
      {e && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6" data-docs>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Documents</h4>
            {data.documents.map((d) => (
              <div key={d.path} className="flex justify-between items-center py-2 border-b text-sm"><span className="flex items-center gap-2">{d.label === "Employee ID Card" ? <FaIdCard className="text-indigo-600" /> : <FaFilePdf className="text-red-500" />} {d.label}</span><Btn kind="secondary" onClick={() => pdfOr(setMsg)(d.path)}>Open</Btn></div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">ID card details</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Blood Group"><select aria-label="Blood Group" value={prof.bloodGroup} onChange={(ev) => setProf({ ...prof, bloodGroup: ev.target.value })} className={inputCls()}><option value="">Select</option>{BLOOD.map((b) => <option key={b}>{b}</option>)}</select></Field>
              <Field label="Date of Birth"><input type="date" aria-label="Date of Birth" value={prof.dob} onChange={(ev) => setProf({ ...prof, dob: ev.target.value })} className={inputCls()} /></Field>
              <Field label="Emergency No."><input aria-label="Emergency No." inputMode="numeric" maxLength="10" value={prof.emergencyNo} onChange={(ev) => setProf({ ...prof, emergencyNo: ev.target.value.replace(/\D/g, "") })} className={inputCls()} /></Field>
              <div className="flex items-end"><Btn onClick={save}>Save</Btn></div>
            </div>
            <div className="flex gap-4 mt-4">
              {["photo", "signature"].map((k) => (
                <div key={k} className="text-center">
                  <div className="w-24 h-28 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">{e[k] ? <img src={e[k]} alt={k} className="max-w-full max-h-full" /> : <span className="text-xs text-gray-400">{k}</span>}</div>
                  <label className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-1 border rounded cursor-pointer"><FaUpload /> {k === "photo" ? "Photo" : "Signature"}<input type="file" accept=".jpg,.jpeg" className="hidden" aria-label={`Upload ${k}`} onChange={(ev) => { upload(k, ev.target.files[0]); ev.target.value = ""; }} /></label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">JPG / JPEG under 100 KB.</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================ MANAGER INBOX (reporting manager logins; HR sees all)
export function ManagerInbox() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);
  const load = () => hrApi("/manager/inbox").then(setData).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  if (!data) return <p className="text-sm text-gray-500">{msg ? msg.text : "Loading…"}</p>;
  if (!data.isManager) return null;
  const done = (t) => { setMsg({ kind: "ok", text: t }); load(); };
  const empty = !data.exits.length && !data.requests.length && !data.confirmations.length;
  return (
    <Card title="Manager inbox" className="border-indigo-200">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      {empty && <p className="text-sm text-gray-500">Nothing waiting for you.</p>}
      {data.requests.map((r) => (
        <div key={r._id} className="border rounded-lg p-3 mb-2" data-request={r._id}>
          <div className="text-sm"><b>{r.kind}</b> — {r.employeeCode} {r.name} <span className="text-xs">({r.status})</span></div>
          <div className="text-xs text-gray-600">
            {r.kind === "Relieving Letter" ? <>Last working day {fmtDate(r.payload.lastWorkingDay)}</> : <>
              {r.kind !== "Promotion" && <>Hike {r.payload.hikePercent}%: CTC {inr(r.payload.current?.ctc?.a)} → {inr(r.payload.newCtc?.a)} per year. </>}
              {r.kind !== "Salary Hike" && <>Position {r.payload.current?.designation} → {r.payload.newDesignation}; reporting to {r.payload.newRm}.</>}</>}
          </div>
          <button type="button" className="text-xs text-indigo-600 underline" onClick={() => pdfOr(setMsg)(`/requests/${r._id}/letter`)}>Preview letter</button>
          <Decide path={`/requests/${r._id}/decide`} onDone={(s) => done(`${r.kind} ${s === "On Hold" ? "put on hold" : s.toLowerCase()}.`)} />
        </div>
      ))}
      {data.exits.map((x) => (
        <div key={x._id} className="border rounded-lg p-3 mb-2" data-inbox-exit={x._id}>
          <div className="text-sm"><b>Exit request</b> — {x.employeeCode} {x.name}, exit date {fmtDate(x.exitDate)} <span className="text-xs">({x.status})</span></div>
          <div className="text-xs text-gray-600">Reason: {x.reason} · Assets: {x.assets.length ? x.assets.map((a) => `${a.assetType} (${a.assetId})`).join(", ") : "none"}{x.autoApproveOn ? ` · auto-approves on ${fmtDate(x.autoApproveOn)}` : ""}</div>
          <Decide path={`/exits/${x._id}/decide`} labels={["Accept", "Reject", "Hold"]} remarksRequiredForApprove onDone={(s) => done(`Exit ${s === "On Hold" ? "put on hold" : s.toLowerCase()} — e-mails sent.`)} />
        </div>
      ))}
      {data.confirmations.map((c) => (
        <div key={c._id} className="border rounded-lg p-3 mb-2 flex flex-wrap items-center justify-between gap-2" data-inbox-confirm={c._id}>
          <span className="text-sm"><b>Confirmation due</b> — {c.employeeCode} {c.name} ({c.designation})</span>
          <Btn onClick={async () => { try { await hrApi(`/confirmations/${c._id}/send`, { method: "POST" }); done(`Confirmation letter sent to ${c.name}.`); } catch (e) { setMsg({ kind: "error", text: e.message }); } }}><FaEnvelope /> Send confirmation letter</Btn>
        </div>
      ))}
    </Card>
  );
}
