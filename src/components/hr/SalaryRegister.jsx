// src/components/hr/SalaryRegister.jsx — My HR › Salary Register + Salary Slip
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { hrApi, openHrPdf, inr, MONTHS } from "./hrApi";
import { EARNING_LINES, DEDUCTION_LINES } from "./hrSalary";
import { Field, Btn, Card, Notice, inputCls } from "./ui";
import { MonthPicker } from "./HrAttendance";

const prevMonth = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return { month: d.getMonth() + 1, year: d.getFullYear() }; };

export function SalaryRegister() {
  const [mm, setMm] = useState(prevMonth());
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);
  useEffect(() => { setData(null); hrApi(`/salary-register?month=${mm.month}&year=${mm.year}`).then(setData).catch((e) => setMsg({ kind: "error", text: e.message })); }, [mm.month, mm.year]);

  const exportExcel = () => {
    const head = ["Emp. Code", "Name", "Designation", "Days in Month", "Payable Days", "LOP Days", ...EARNING_LINES.map(([, l]) => l), "Gross Earned", ...DEDUCTION_LINES.map(([, l]) => l), "Total Deduction", "Net Pay", "CTC (month)"];
    const rows = data.rows.map((r) => [r.employeeCode, r.name, r.designation, r.daysInMonth, r.payableDays, r.lopDays, ...EARNING_LINES.map(([k]) => r.earned[k]), r.grossEarned, ...DEDUCTION_LINES.map(([k]) => r.deductions[k]), r.totalDeduction, r.netPay, r.ctc]);
    const total = ["", "TOTAL", "", "", "", "", ...EARNING_LINES.map(([k]) => data.rows.reduce((t, r) => t + r.earned[k], 0)), data.totals.grossEarned, ...DEDUCTION_LINES.map(([k]) => data.rows.reduce((t, r) => t + r.deductions[k], 0)), data.totals.totalDeduction, data.totals.netPay, data.rows.reduce((t, r) => t + r.ctc, 0)];
    const ws = XLSX.utils.aoa_to_sheet([[`Salary Register — ${data.monthName} ${data.year}`], ["Arshyan Insurance Marketing & Services Pvt Ltd"], [], head, ...rows, total]);
    ws["!cols"] = head.map((h) => ({ wch: Math.max(10, h.length + 2) }));
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTHS[mm.month - 1].slice(0, 3)} ${mm.year}`);
    XLSX.writeFile(wb, `Salary_Register_${MONTHS[mm.month - 1]}_${mm.year}.xlsx`);
  };
  const provisional = data?.rows.some((r) => r.provisional);
  return (
    <Card title="Salary Register" actions={<><MonthPicker {...mm} onChange={setMm} /><Btn kind="success" onClick={exportExcel} disabled={!data?.rows.length}><FaFileExcel /> Excel</Btn></>}>
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      {provisional && <div className="mb-3"><Notice kind="warn">This month isn't over — upcoming days are counted as paid (provisional).</Notice></div>}
<<<<<<< HEAD
      {data?.withoutSalary?.length > 0 && <div className="mb-3"><Notice kind="warn">{data.withoutSalary.length} employee(s) have no salary structure yet and are not in this register: {data.withoutSalary.slice(0, 8).join(", ")}{data.withoutSalary.length > 8 ? "…" : ""}. Set it in My HR › Employees.</Notice></div>}
=======
>>>>>>> 81cb897ccc1ce715d5f4389393077eacc0b2a77e
      {!data ? <p className="text-sm text-gray-500">Loading…</p> : !data.rows.length ? <p className="text-sm text-gray-500">No employees on payroll for {data.monthName} {data.year}.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" data-table="register">
            <thead className="bg-gray-50 text-left text-gray-500"><tr>
              <th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2 text-right">Payable</th><th className="p-2 text-right">LOP</th>
              {EARNING_LINES.map(([k, l]) => <th key={k} className="p-2 text-right">{l}</th>)}<th className="p-2 text-right">Gross</th>
              {DEDUCTION_LINES.map(([k, l]) => <th key={k} className="p-2 text-right">{l}</th>)}<th className="p-2 text-right">Total Ded.</th><th className="p-2 text-right">Net Pay</th><th className="p-2 text-right">CTC</th><th className="p-2"></th>
            </tr></thead>
            <tbody>{data.rows.map((r) => (
              <tr key={r.employeeId} className="border-t" data-row={r.employeeCode}>
                <td className="p-2 font-medium">{r.employeeCode}</td><td className="p-2">{r.name}{!r.linked && <span className="text-amber-700" title="No CRM login — attendance can't be marked"> ⚠</span>}</td>
                <td className="p-2 text-right">{r.payableDays}/{r.daysInMonth}</td><td className="p-2 text-right text-red-600">{r.lopDays}</td>
                {EARNING_LINES.map(([k]) => <td key={k} className="p-2 text-right">{inr(r.earned[k])}</td>)}<td className="p-2 text-right font-medium">{inr(r.grossEarned)}</td>
                {DEDUCTION_LINES.map(([k]) => <td key={k} className={`p-2 text-right ${r.employeeKeys.includes(k) ? "" : "text-gray-400"}`}>{inr(r.deductions[k])}</td>)}
                <td className="p-2 text-right">{inr(r.totalDeduction)}</td><td className="p-2 text-right font-semibold text-emerald-700">{inr(r.netPay)}</td><td className="p-2 text-right">{inr(r.ctc)}</td>
                <td className="p-2"><Btn kind="secondary" onClick={() => openHrPdf(`/salary-slip/${r.employeeId}?month=${mm.month}&year=${mm.year}`).catch((e) => setMsg({ kind: "error", text: e.message }))}><FaFilePdf /> Slip</Btn></td>
              </tr>))}
              <tr className="border-t bg-gray-50 font-semibold"><td className="p-2" colSpan={4 + EARNING_LINES.length}>Total</td><td className="p-2 text-right">{inr(data.totals.grossEarned)}</td><td colSpan={DEDUCTION_LINES.length}></td><td className="p-2 text-right">{inr(data.totals.totalDeduction)}</td><td className="p-2 text-right">{inr(data.totals.netPay)}</td><td colSpan={2}></td></tr>
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-3">Employer PF / ESIC (grey) are part of CTC, not deducted from pay. Payable days = present + approved paid leave + holidays + Sundays.</p>
    </Card>
  );
}

export function SalarySlips() {
  const [mm, setMm] = useState(prevMonth());
  const [emps, setEmps] = useState([]);
  const [emp, setEmp] = useState("");
  const [msg, setMsg] = useState(null);
  const blank = () => ({ has: "", amount: "", monthFor: "", yearFor: "" });
  const [adj, setAdj] = useState({ arrear: blank(), incentive: blank() });
  useEffect(() => { hrApi("/employees").then((l) => setEmps(l.filter((e) => e.status === "Active"))).catch((e) => setMsg({ kind: "error", text: e.message })); }, []);
  // load what was saved for this employee + month
  useEffect(() => {
    if (!emp) return;
    hrApi(`/pay-adjustments?employeeId=${emp}&month=${mm.month}&year=${mm.year}`).then((a) => {
      const part = (p) => (p && Number(p.amount) > 0 ? { has: "Yes", amount: String(p.amount), monthFor: String(p.monthFor || ""), yearFor: String(p.yearFor || "") } : { ...blank(), has: a ? "No" : "" });
      setAdj({ arrear: part(a?.arrear), incentive: part(a?.incentive) });
    }).catch(() => {});
  }, [emp, mm.month, mm.year]);
  const setPart = (k, p) => setAdj((a) => ({ ...a, [k]: { ...a[k], ...p } }));
  const open = async () => {
    setMsg(null);
    if (!adj.arrear.has || !adj.incentive.has) return setMsg({ kind: "warn", text: "Answer both questions first: Is there any arrear? Is there any incentive?" });
    const body = (p) => (p.has === "Yes" ? { amount: p.amount, monthFor: p.monthFor, yearFor: p.yearFor } : { amount: 0 });
    try {
      await hrApi("/pay-adjustments", { method: "PUT", body: { employeeId: emp, month: mm.month, year: mm.year, arrear: body(adj.arrear), incentive: body(adj.incentive) } });
      await openHrPdf(`/salary-slip/${emp}?month=${mm.month}&year=${mm.year}`);
    } catch (e) { setMsg({ kind: "error", text: [e.message, ...(e.errors || [])].join(" — ") }); }
  };
  const Q = (k, label) => (
    <div className="border rounded-lg p-3" data-question={k}>
      <div className="flex flex-wrap items-center gap-4 text-sm"><span className="font-medium">{label}</span>
        {["Yes", "No"].map((v) => <label key={v} className="flex items-center gap-1"><input type="radio" name={k} checked={adj[k].has === v} onChange={() => setPart(k, { has: v })} /> {v}</label>)}
      </div>
      {adj[k].has === "Yes" && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          <Field label="Amount (₹)" required><input aria-label={`${k} amount`} inputMode="numeric" value={adj[k].amount} onChange={(e) => setPart(k, { amount: e.target.value.replace(/\D/g, "") })} className={inputCls()} /></Field>
          <Field label="Month For" required><select aria-label={`${k} month`} value={adj[k].monthFor} onChange={(e) => setPart(k, { monthFor: e.target.value })} className={inputCls()}><option value="">Select</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></Field>
          <Field label="Year For" required><select aria-label={`${k} year`} value={adj[k].yearFor} onChange={(e) => setPart(k, { yearFor: e.target.value })} className={inputCls()}><option value="">Select</option>{[0, 1, 2].map((d) => new Date().getFullYear() - d).map((y) => <option key={y} value={y}>{y}</option>)}</select></Field>
        </div>
      )}
    </div>
  );
  return (
    <Card title="Salary Slip">
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <Field label="Employee"><select aria-label="Employee" value={emp} onChange={(e) => setEmp(e.target.value)} className={inputCls()}><option value="">Select</option>{emps.map((e) => <option key={e._id} value={e._id}>{e.employeeCode} — {e.name}</option>)}</select></Field>
        <Field label="Month / Year"><MonthPicker {...mm} onChange={setMm} /></Field>
<<<<<<< HEAD
        <Btn onClick={() => (emp ? open() : setMsg({ kind: "warn", text: "Choose the employee first." }))}><FaFilePdf /> View / Download Slip</Btn>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4" data-questions>{Q("arrear", "Is there any arrear?")}{Q("incentive", "Is there any incentive?")}</div>
=======
        <Btn onClick={open} disabled={!emp}><FaFilePdf /> View / Download Slip</Btn>
      </div>
      {emp && <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">{Q("arrear", "Is there any arrear?")}{Q("incentive", "Is there any incentive?")}</div>}
>>>>>>> 81cb897ccc1ce715d5f4389393077eacc0b2a77e
      <p className="text-xs text-gray-500 mt-3">Generated from the attendance register for the chosen month, in the company's salary slip format.</p>
    </Card>
  );
}
