// src/components/hr/Promotions.jsx — My HR › Promotions
import { useEffect, useState } from "react";
import { FaFilePdf, FaArrowUp } from "react-icons/fa";
import { hrApi, openHrPdf, fmtDate, inr, todayYmd } from "./hrApi";
import { computeSalary } from "./hrSalary";
import { Field, Btn, Card, Notice, inputCls } from "./ui";
import MasterSelect from "./MasterSelect";
import SalaryEditor from "./SalaryEditor";

export default function Promotions({ masters, setMasters, settings }) {
  const [emps, setEmps] = useState([]);
  const [emp, setEmp] = useState(null);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { hrApi("/employees").then((l) => setEmps(l.filter((e) => e.status === "Active"))).catch((e) => setMsg({ kind: "error", text: e.message })); }, []);
  const pick = async (id) => {
    setMsg(null);
    if (!id) { setEmp(null); setForm(null); return; }
    const e = await hrApi(`/employees/${id}`);
    setEmp(e);
    setForm({ effectiveDate: todayYmd(), designation: "", department: e.department, rank: e.rank, reportingManager: e.reportingManager, remarks: "",
      earnings: { ...(e.salary?.earnings || {}) }, deductions: [...(e.salary?.deductions || [])], insurance: { ...(e.salary?.insurance || {}) } });
  };
  const set = (p) => setForm((f) => ({ ...f, ...p }));
  const save = async () => {
    setBusy(true);
    try {
      const r = await hrApi(`/employees/${emp._id}/promotions`, { method: "POST", body: form });
      setEmp(r.employee);
      setMsg({ kind: "ok", text: `Promotion saved (${r.promotion.refId}).`, pid: r.promotion._id });
      setForm(null);
    } catch (e) { setMsg({ kind: "error", text: e.message }); } finally { setBusy(false); }
  };
  const cur = emp ? computeSalary(emp.salary || {}, settings || {}) : null;
  return (
    <Card title="Promotions">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text} {msg.pid && <button type="button" className="underline ml-2" onClick={() => openHrPdf(`/employees/${emp._id}/promotions/${msg.pid}/letter`)}>Open promotion letter</button>}</Notice></div>}
      <Field label="Employee" className="max-w-md"><select aria-label="Employee" value={emp?._id || ""} onChange={(e) => pick(e.target.value)} className={inputCls()}><option value="">Select</option>{emps.map((e) => <option key={e._id} value={e._id}>{e.employeeCode} — {e.name}</option>)}</select></Field>
      {emp && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm bg-gray-50 rounded-lg p-3" data-current>
          <div><div className="text-xs text-gray-500">Designation</div>{emp.designation}</div><div><div className="text-xs text-gray-500">Department</div>{emp.department}</div>
          <div><div className="text-xs text-gray-500">Rank</div>{emp.rank || "—"}</div><div><div className="text-xs text-gray-500">CTC / month</div>{inr(cur.ctc.m)}</div><div><div className="text-xs text-gray-500">In-hand</div>{inr(cur.inHand.m)}</div>
        </div>
      )}
      {emp && !form && <Btn className="mt-4" onClick={() => pick(emp._id)}><FaArrowUp /> New promotion</Btn>}
      {form && (
        <div className="mt-4 space-y-4" data-form="promotion">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Effective date" required><input type="date" data-field="effectiveDate" value={form.effectiveDate} onChange={(e) => set({ effectiveDate: e.target.value })} className={inputCls()} /></Field>
            <Field label="New Designation" required><MasterSelect type="designation" label="Designation" value={form.designation} onChange={(v) => set({ designation: v })} masters={masters} setMasters={setMasters} /></Field>
            <Field label="Department"><MasterSelect type="department" label="Department" value={form.department} onChange={(v) => set({ department: v })} masters={masters} setMasters={setMasters} /></Field>
            <Field label="Rank"><MasterSelect type="rank" label="Rank" value={form.rank} onChange={(v) => set({ rank: v })} masters={masters} setMasters={setMasters} /></Field>
            <Field label="Reporting Manager"><MasterSelect type="reportingManager" label="Reporting Manager" value={form.reportingManager} onChange={(v) => set({ reportingManager: v })} masters={masters} setMasters={setMasters} withEmail /></Field>
            <Field label="Remarks (printed in the letter)"><input value={form.remarks} onChange={(e) => set({ remarks: e.target.value })} className={inputCls()} /></Field>
          </div>
          <h4 className="font-semibold text-sm text-gray-700">Revised salary</h4>
          <SalaryEditor value={form} onChange={(v) => set({ earnings: v.earnings, deductions: v.deductions, insurance: v.insurance })} settings={settings} />
          <div className="flex justify-end gap-2"><Btn kind="secondary" onClick={() => setForm(null)}>Cancel</Btn><Btn onClick={save} disabled={busy || !form.designation}>{busy ? "Saving…" : "Save promotion"}</Btn></div>
        </div>
      )}
      {emp && (emp.promotions || []).length > 0 && (
        <div className="mt-6"><h4 className="font-semibold text-sm text-gray-700 mb-2">History</h4>
          {[...emp.promotions].reverse().map((p) => (
            <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 border-b">
              <span>{fmtDate(p.effectiveDate)}: {p.from.designation} → <b>{p.to.designation}</b> · CTC {inr(computeSalary(p.from, settings || {}).ctc.m)} → {inr(computeSalary(p.to, settings || {}).ctc.m)}</span>
              <Btn kind="secondary" onClick={() => openHrPdf(`/employees/${emp._id}/promotions/${p._id}/letter`)}><FaFilePdf /> Letter</Btn>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
