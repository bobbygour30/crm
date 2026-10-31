// src/components/hr/HrSettings.jsx — My HR › Settings (dropdown lists, statutory rates, document templates)
import { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { hrApi, hrUpload } from "./hrApi";
import { Field, Btn, Card, Notice, inputCls, cx } from "./ui";

const LISTS = [["designation", "Designation"], ["department", "Department"], ["reportingManager", "Reporting Manager"], ["rank", "Rank"], ["employmentType", "Employment Type"], ["workSchedule", "Working Hour / Schedule"], ["jobVenue", "Job Venue"]];
const DOCS = [["cv", "CV"], ["signedOffer", "Signed Offer Letter"], ["esicForm", "ESIC Form"], ["epfoForm", "EPFO Form"], ["gmcForm", "GMC Form"], ["gpaForm", "GPA Form"]];

export default function HrSettings({ settings, setSettings, reloadMasters }) {
  const [all, setAll] = useState(null);
  const [list, setList] = useState("designation");
  const [draft, setDraft] = useState({ value: "", email: "" });
  const [rates, setRates] = useState(settings);
  const [msg, setMsg] = useState(null);
  const loadAll = async () => setAll(await hrApi("/masters?all=1"));
  useEffect(() => { loadAll().catch((e) => setMsg({ kind: "error", text: e.message })); }, []);
  useEffect(() => { setRates(settings); }, [settings]);
  const add = async () => { try { await hrApi("/masters", { method: "POST", body: { type: list, ...draft } }); setDraft({ value: "", email: "" }); await loadAll(); reloadMasters(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const upd = async (id, body) => { try { await hrApi(`/masters/${id}`, { method: "PUT", body }); await loadAll(); reloadMasters(); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const saveRates = async () => { try { const s = await hrApi("/settings", { method: "PUT", body: rates }); setSettings(s); setRates(s); setMsg({ kind: "ok", text: "Settings saved — new offers and salary calculations use them." }); } catch (e) { setMsg({ kind: "error", text: [e.message, ...(e.errors || [])].join(" — ") }); } };
  const upload = async (docKey, kind, file) => { try { const r = await hrUpload(`/settings/templates/${docKey}`, file, { kind }); setSettings((s) => ({ ...s, documentTemplates: { ...(s.documentTemplates || {}), [docKey]: r } })); setMsg({ kind: "ok", text: "File uploaded." }); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const r = rates || {};
  const num = (k, label, hint) => <Field label={label} hint={hint}><input data-field={k} inputMode="decimal" value={r[k] ?? ""} onChange={(e) => setRates({ ...r, [k]: e.target.value })} className={inputCls()} /></Field>;
  return (
    <div className="space-y-4">
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title="Dropdown lists">
        <div className="flex flex-wrap gap-1 mb-3" role="tablist">{LISTS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={list === k} onClick={() => setList(k)} className={cx("px-3 py-1.5 rounded-full text-sm border", list === k ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-300 text-gray-700")}>{l}</button>)}</div>
        <div className="flex flex-wrap gap-2 mb-3">
          <input aria-label="New value" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} placeholder="New value" className={cx(inputCls(), "max-w-xs")} />
          {list === "reportingManager" && <input aria-label="E-mail" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="E-mail (CC on rejection mails)" className={cx(inputCls(), "max-w-xs")} />}
          <Btn onClick={add} disabled={!draft.value.trim()}>Add</Btn>
        </div>
        {(all?.[list] || []).map((m) => (
          <div key={m._id} className={cx("flex flex-wrap items-center gap-2 py-1.5 border-b text-sm", !m.active && "opacity-50")}>
            <input aria-label="Value" defaultValue={m.value} onBlur={(e) => e.target.value !== m.value && upd(m._id, { value: e.target.value })} className={cx(inputCls(), "max-w-xs")} />
            {list === "reportingManager" && <input aria-label="Manager e-mail" defaultValue={m.email || ""} onBlur={(e) => e.target.value !== (m.email || "") && upd(m._id, { email: e.target.value })} placeholder="e-mail" className={cx(inputCls(), "max-w-xs")} />}
            <Btn kind="secondary" onClick={() => upd(m._id, { active: !m.active })}>{m.active ? "Deactivate" : "Reactivate"}</Btn>
          </div>
        ))}
      </Card>
      <Card title="Statutory rates & rules" actions={<Btn onClick={saveRates}>Save settings</Btn>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {num("tdsPercent", "TDS %")}
          <Field label="TDS calculated on"><select aria-label="TDS base" value={r.tdsBase} onChange={(e) => setRates({ ...r, tdsBase: e.target.value })} className={inputCls()}><option value="gross">Gross monthly pay</option><option value="basic">Basic pay</option></select></Field>
          {num("pfEmployeePercent", "PF — employee %")}{num("pfEmployerPercent", "PF — employer %")}
          <Field label="PF wage ceiling"><label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!r.pfApplyWageCeiling} onChange={(e) => setRates({ ...r, pfApplyWageCeiling: e.target.checked })} /> Cap PF wages at</label></Field>
          {num("pfWageCeiling", "PF wage ceiling (₹ basic)")}
          {num("esicEmployeePercent", "ESIC — employee %")}{num("esicEmployerPercent", "ESIC — employer %")}{num("esicWageCeiling", "ESIC eligibility ceiling (₹ gross)", "No ESIC above this gross")}
          <Field label="GPA / GMC premium"><select aria-label="Insurance" value={r.insuranceRecoveredFromEmployee ? "employee" : "company"} onChange={(e) => setRates({ ...r, insuranceRecoveredFromEmployee: e.target.value === "employee" })} className={inputCls()}><option value="employee">Deducted from the employee</option><option value="company">Paid by the company (in CTC)</option></select></Field>
          <Field label="Salary proration"><select aria-label="Proration" value={r.prorationBasis} onChange={(e) => setRates({ ...r, prorationBasis: e.target.value })} className={inputCls()}><option value="calendar">Calendar days of the month</option><option value="30">30 days</option></select></Field>
          {num("paidLeavesPerMonth", "Paid leaves per month", "Beyond this, leave is unpaid (no carry-forward)")}
        </div>
      </Card>
      <Card title="Candidate document templates">
        <p className="text-sm text-gray-600 mb-3">Shown in the candidate's Documents section: a blank template to download and a filled sample showing how to complete it.</p>
        {DOCS.map(([k, l]) => {
          const t = (settings?.documentTemplates || {})[k] || {};
          return (
            <div key={k} className="flex flex-wrap items-center gap-3 py-2 border-b text-sm" data-template={k}>
              <span className="w-44 font-medium">{l}</span>
              {["template", "sample"].map((kind) => (
                <span key={kind} className="flex items-center gap-2">
                  {t[kind] ? <a href={t[kind]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">{t[`${kind}Name`] || kind}</a> : <span className="text-gray-400">no {kind}</span>}
                  <label className="cursor-pointer text-xs px-2 py-1 border rounded flex items-center gap-1"><FaUpload /> {kind === "template" ? "Template" : "Sample"}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.doc,.docx" className="hidden" aria-label={`${l} ${kind}`} onChange={(e) => e.target.files[0] && upload(k, kind, e.target.files[0])} /></label>
                </span>
              ))}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
