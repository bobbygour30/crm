// src/components/hr/SalaryEditor.jsx — Offer Letter "Salary" tab (also used by Promotions)
// Per Month <-> Per Annum (x12), deduction multi-select (NA zeroes + disables every line), live CTC / In-Hand.
<<<<<<< HEAD
import { computeSalary, autoEarnings, DEDUCTION_OPTIONS, EARNING_LINES, DEDUCTION_LINES } from "./hrSalary";
=======
import { computeSalary, DEDUCTION_OPTIONS, EARNING_LINES, DEDUCTION_LINES } from "./hrSalary";
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
import { inputCls, cx } from "./ui";

const fmt = (v) => Math.round(Number(v) || 0).toLocaleString("en-IN");

<<<<<<< HEAD
export default function SalaryEditor({ value, onChange, settings, disabled, errors = {} }) {
  const v = value || { earnings: {}, deductions: [], insurance: {} };
  const calc = computeSalary(v, settings || {});
  const auto = autoEarnings(v.earnings?.basic, settings || {});
  // a component counts as "auto" while it is blank or still equal to its auto value
  const isAuto = (k, earnings = v.earnings, basic = v.earnings?.basic) => {
    const cur = earnings?.[k];
    return cur === undefined || cur === "" || Number(cur) === autoEarnings(basic, settings || {})[k];
  };
  const setEarning = (k, monthly) => {
    if (k !== "basic") return onChange({ ...v, earnings: { ...v.earnings, [k]: monthly } });
    // Basic changed: refresh every component that is still auto (HR-edited ones stay as typed)
    const next = { ...v.earnings, basic: monthly };
    const fresh = autoEarnings(monthly, settings || {});
    Object.keys(fresh).forEach((c) => { if (isAuto(c)) next[c] = monthly ? String(fresh[c]) : ""; });
    onChange({ ...v, earnings: next });
  };
=======
export default function SalaryEditor({ value, onChange, settings, disabled }) {
  const v = value || { earnings: {}, deductions: [], insurance: {} };
  const calc = computeSalary(v, settings || {});
  const setEarning = (k, monthly) => onChange({ ...v, earnings: { ...v.earnings, [k]: monthly } });
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
  const toggle = (opt) => {
    const cur = v.deductions || [];
    let next;
    if (opt === "NA") next = cur.includes("NA") ? [] : ["NA"];
    else next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur.filter((x) => x !== "NA"), opt];
    onChange({ ...v, deductions: next });
  };
  const na = (v.deductions || []).includes("NA");
  const num = (s) => String(s).replace(/[^\d.]/g, "");
  return (
    <div className="space-y-4" data-editor="salary">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Earnings</h4>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500"><th className="py-1">Component</th><th className="py-1">Per Month (₹)</th><th className="py-1">Per Annum (₹)</th></tr></thead>
          <tbody>
            {EARNING_LINES.map(([k, label]) => (
              <tr key={k}>
<<<<<<< HEAD
                <td className="py-1 pr-2">
                  {label}{k === "basic" && <span className="text-red-500"> *</span>}
                  {k !== "basic" && (isAuto(k)
                    ? <span className="ml-1 text-[10px] text-gray-400" data-auto={k}>auto {settings?.[`${k}PercentOfBasic`] ?? ""}%</span>
                    : <button type="button" disabled={disabled} onClick={() => setEarning(k, auto[k] ? String(auto[k]) : "")} className="ml-1 text-[10px] text-indigo-600 underline" data-edited={k}>edited · use auto</button>)}
                </td>
                <td className="py-1 pr-2"><input data-field={`earn_${k}_m`} aria-label={`${label} per month`} inputMode="decimal" disabled={disabled} value={v.earnings?.[k] ?? ""} onChange={(e) => setEarning(k, num(e.target.value))} className={inputCls(k === "basic" && errors["earnings.basic"], disabled)} />{k === "basic" && errors["earnings.basic"] && <p className="text-red-500 text-xs">{errors["earnings.basic"]}</p>}</td>
=======
                <td className="py-1 pr-2">{label}</td>
                <td className="py-1 pr-2"><input data-field={`earn_${k}_m`} aria-label={`${label} per month`} inputMode="decimal" disabled={disabled} value={v.earnings?.[k] ?? ""} onChange={(e) => setEarning(k, num(e.target.value))} className={inputCls(false, disabled)} /></td>
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
                <td className="py-1"><input data-field={`earn_${k}_a`} aria-label={`${label} per annum`} inputMode="decimal" disabled={disabled} value={v.earnings?.[k] ? Math.round(Number(v.earnings[k]) * 12) : ""} onChange={(e) => setEarning(k, num(e.target.value) ? String(Math.round((Number(num(e.target.value)) / 12) * 100) / 100) : "")} className={inputCls(false, disabled)} /></td>
              </tr>
            ))}
            <tr className="font-semibold border-t"><td className="py-1">Total Fixed Pay - A</td><td className="py-1">₹{fmt(calc.gross.m)}</td><td className="py-1">₹{fmt(calc.gross.a)}</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Deductions <span className="text-xs font-normal text-gray-500">(select one or more)</span></h4>
<<<<<<< HEAD
        {errors.deductions && <p className="text-red-500 text-xs mb-1">{errors.deductions}</p>}
=======
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
        <div className="flex flex-wrap gap-2" data-field="deductions" role="group" aria-label="Deductions">
          {DEDUCTION_OPTIONS.map((o) => {
            const on = (v.deductions || []).includes(o);
            return (
              <label key={o} className={cx("px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none", on ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700", disabled && "opacity-60 cursor-not-allowed")}>
                <input type="checkbox" className="sr-only" checked={on} disabled={disabled} onChange={() => toggle(o)} /> {o}
              </label>
            );
          })}
        </div>
        {(v.deductions || []).includes("GPA") || (v.deductions || []).includes("GMC") ? (
          <div className="grid grid-cols-2 gap-3 mt-3 max-w-md">
<<<<<<< HEAD
            {(v.deductions || []).includes("GPA") && <label className="text-sm">GPA Premium / month (₹)<input data-field="ins_gpa" inputMode="decimal" disabled={disabled} value={v.insurance?.gpa ?? ""} onChange={(e) => onChange({ ...v, insurance: { ...v.insurance, gpa: num(e.target.value) } })} className={inputCls(errors["insurance.gpa"], disabled)} /></label>}
            {(v.deductions || []).includes("GMC") && <label className="text-sm">GMC Premium / month (₹)<input data-field="ins_gmc" inputMode="decimal" disabled={disabled} value={v.insurance?.gmc ?? ""} onChange={(e) => onChange({ ...v, insurance: { ...v.insurance, gmc: num(e.target.value) } })} className={inputCls(errors["insurance.gmc"], disabled)} /></label>}
=======
            {(v.deductions || []).includes("GPA") && <label className="text-sm">GPA Premium / month (₹)<input data-field="ins_gpa" inputMode="decimal" disabled={disabled} value={v.insurance?.gpa ?? ""} onChange={(e) => onChange({ ...v, insurance: { ...v.insurance, gpa: num(e.target.value) } })} className={inputCls(false, disabled)} /></label>}
            {(v.deductions || []).includes("GMC") && <label className="text-sm">GMC Premium / month (₹)<input data-field="ins_gmc" inputMode="decimal" disabled={disabled} value={v.insurance?.gmc ?? ""} onChange={(e) => onChange({ ...v, insurance: { ...v.insurance, gmc: num(e.target.value) } })} className={inputCls(false, disabled)} /></label>}
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
          </div>
        ) : null}
        <table className="w-full text-sm mt-3" data-table="deductions">
          <thead><tr className="text-left text-xs text-gray-500"><th className="py-1">Line</th><th className="py-1">Per Month (₹)</th><th className="py-1">Per Annum (₹)</th></tr></thead>
          <tbody>
            {DEDUCTION_LINES.map(([k, label]) => {
              const l = calc.lines[k];
              const employer = k === "pfEmployer" || k === "esicEmployer";
              return (
                <tr key={k} className={cx(!l.applicable && "text-gray-400")} data-line={k}>
                  <td className="py-1">{k === "tds" ? `TDS @ ${settings?.tdsPercent ?? 10}%` : label}{employer && <span className="ml-1 text-xs text-gray-400">(employer — part of CTC)</span>}</td>
                  <td className="py-1"><input readOnly disabled aria-label={`${label} per month`} value={fmt(l.m)} className={inputCls(false, true)} /></td>
                  <td className="py-1"><input readOnly disabled aria-label={`${label} per annum`} value={fmt(l.a)} className={inputCls(false, true)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {na && <p className="text-xs text-gray-500 mt-1">NA selected — every deduction line is 0.</p>}
        {calc.warnings.map((w) => <p key={w} className="text-xs text-amber-700 mt-1">{w}</p>)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-totals>
        <div className="rounded-lg bg-red-50 border border-red-100 p-3"><div className="text-xs text-gray-600">Total Deduction (employee)</div><div className="font-semibold" data-total="deduction">₹{fmt(calc.totalDeduction.m)} / month</div><div className="text-xs text-gray-500">₹{fmt(calc.totalDeduction.a)} / year</div></div>
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3"><div className="text-xs text-gray-600">CTC</div><div className="font-semibold" data-total="ctc">₹{fmt(calc.ctc.m)} / month</div><div className="text-xs text-gray-500">₹{fmt(calc.ctc.a)} / year</div></div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3"><div className="text-xs text-gray-600">In-Hand Salary</div><div className="font-semibold" data-total="inhand">₹{fmt(calc.inHand.m)} / month</div><div className="text-xs text-gray-500">₹{fmt(calc.inHand.a)} / year</div></div>
      </div>
    </div>
  );
}
