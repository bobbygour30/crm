// src/components/lob/TermInsuranceForm.jsx
// ============================================================
// TERM INSURANCE (TERM BRD) — form sections (logic + constants live in termInsurance.js):
//   Quote module           -> <TermQuoteSection>     (Admin + Employee)
//   Policy Issuance module -> <TermIssuanceSection>  (Admin + Employee)
// ============================================================
import { useEffect } from "react";
import { FaUserShield } from "react-icons/fa";
import { YES_NO, Field, FileInput, Select, inputCls, maxAdultDob } from "./LobShared";
import {
  TERM_OCCUPATIONS, TERM_QUALIFICATIONS, TERM_COVER_TILL_AGES, TERM_CUSTOM_SI, TERM_LIFE_COVERS, TERM_PAYING_TERMS, TERM_PREMIUM_MODES,
  TERM_MARITAL, TERM_NOMINEE_RELATIONS, CHILD_COUNTS, computeTerm, termLeadFields,
} from "./termInsurance";

// ============================================================
// QUOTE MODULE
// ============================================================
export function TermQuoteSection({ details: d, setDetails, errors: err = {}, formData = {}, setFormData }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const c = computeTerm(d);
  // keep the lead's Paying Term / Tenure / Sum Insured in step (EMI dues, cashback, profit, reports)
  useEffect(() => {
    if (!setFormData) return;
    const f = termLeadFields(d);
    if (f.paymentTerm !== (formData.paymentTerm || "") || f.policyTenure !== (formData.policyTenure || "") || f.sumInsured !== (formData.sumInsured || "")) {
      setFormData((p) => ({ ...p, ...f }));
    }
  }, [d.proposerDOB, d.coverTillAge, d.payingTerm, d.premiumMode, d.lifeCover, d.customLifeCover, formData.paymentTerm, formData.policyTenure, formData.sumInsured]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = (k, label, props = {}) => (
    <Field label={label} required={props.required !== false} error={err[`term_${k}`]} hint={props.hint}>
      <input data-field={`term_${k}`} type={props.type || "text"} inputMode={props.inputMode} max={props.max} value={d[k]} onChange={(e) => set({ [k]: props.digits ? e.target.value.replace(/\D/g, "") : e.target.value })} className={inputCls(err[`term_${k}`])} />
    </Field>
  );
  const pick = (k, label, options, extra = {}) => (
    <Field label={label} required error={err[`term_${k}`]} hint={extra.hint}>
      <Select data-field={`term_${k}`} options={options} value={d[k]} onChange={(e) => set({ [k]: e.target.value, ...(extra.patch ? extra.patch(e.target.value) : {}) })} className={inputCls(err[`term_${k}`])} />
    </Field>
  );
  return (
    <div className="mb-6" data-section="term-quote">
      <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2"><FaUserShield /> Term Insurance — Quote Details</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {text("proposerName", "Proposer Name")}
        {text("proposerDOB", "Proposer DOB", { type: "date", max: maxAdultDob(), hint: c.age !== null ? `Age ${c.age}` : undefined })}
        {pick("occupation", "Select Your Occupation", TERM_OCCUPATIONS)}
        {pick("qualification", "Qualification", TERM_QUALIFICATIONS)}
        {text("annualIncome", "Annual Income (₹)", { inputMode: "numeric", digits: true, hint: Number(d.annualIncome) > 0 ? `₹${Number(d.annualIncome).toLocaleString("en-IN")}` : undefined })}
        {pick("tobacco", "Do You Smoke or Chew Tobacco?", YES_NO)}
        {pick("coverTillAge", "Cover Till Age", TERM_COVER_TILL_AGES)}
        <Field label="Covered Age (Policy Term)" hint="Cover Till Age − current age (from DOB)">
          <input data-field="term_coveredYears" readOnly disabled value={c.coveredYears !== null ? `${c.coveredYears} years${d.coverTillAge ? ` (till age ${d.coverTillAge})` : ""}` : ""} className={inputCls()} />
        </Field>
        {pick("lifeCover", "Life Cover / Sum Insured", TERM_LIFE_COVERS, { patch: (v) => (v === TERM_CUSTOM_SI ? {} : { customLifeCover: "" }) })}
        {d.lifeCover === TERM_CUSTOM_SI && text("customLifeCover", "Custom Sum Insured (₹)", { inputMode: "numeric", digits: true, hint: Number(d.customLifeCover) > 0 ? `₹${Number(d.customLifeCover).toLocaleString("en-IN")}` : undefined })}
        {pick("payingTerm", "Paying Term", TERM_PAYING_TERMS, { patch: (v) => (v === "One Time" ? { premiumMode: "" } : {}) })}
        {d.payingTerm && d.payingTerm !== "One Time" && pick("premiumMode", "Premium Paying Mode", TERM_PREMIUM_MODES)}
        <Field label="Premium Paying Term (auto)" hint="As per the Covered Age and Premium Paying Mode">
          <input data-field="term_payingSummary" readOnly disabled className={inputCls()}
            value={c.oneTime ? "One Time (single premium)" : c.payingYears > 0 ? `${c.payingYears} years${d.premiumMode ? ` · ${d.premiumMode} · ${c.premiumCount} premiums` : ""}` : ""} />
        </Field>
        {text("organisationName", "Organisation Name")}
        {text("designation", "Designation / Post")}
        {text("fatherSpouseName", "Father's / Spouse Name")}
        {text("motherName", "Mother's Name")}
        <Field label="PED, If Any" className="sm:col-span-2 lg:col-span-3">
          <textarea data-field="term_pedRemarks" rows="2" value={d.pedRemarks} onChange={(e) => set({ pedRemarks: e.target.value })} className={inputCls()} placeholder="Pre-existing diseases, if any" />
        </Field>
      </div>
    </div>
  );
}

// ============================================================
// POLICY ISSUANCE MODULE
// ============================================================
export function TermIssuanceSection({ details: d, setDetails, errors: err = {} }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const file = (k, label, { required = true, accept = ".pdf,.jpg,.jpeg" } = {}) => (
    <FileInput label={label} name={`term_${k}`} value={d[k]} onChange={(f) => set({ [k]: f })} error={err[`term_${k}`]} required={required} accept={accept} />
  );
  const text = (k, label, props = {}) => (
    <Field label={label} required={props.required !== false} error={err[`term_${k}`]}>
      <input data-field={`term_${k}`} type={props.type || "text"} inputMode={props.inputMode} maxLength={props.maxLength} value={d[k]} onChange={(e) => set({ [k]: props.transform ? props.transform(e.target.value) : e.target.value })} className={inputCls(err[`term_${k}`])} />
    </Field>
  );
  const pick = (k, label, options, patch) => (
    <Field label={label} required error={err[`term_${k}`]}>
      <Select data-field={`term_${k}`} options={options} value={d[k]} onChange={(e) => set({ [k]: e.target.value, ...(patch ? patch(e.target.value) : {}) })} className={inputCls(err[`term_${k}`])} />
    </Field>
  );
  return (
    <div className="mb-2" data-section="term-issuance">
      <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2"><FaUserShield /> Proposer Details</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Name" hint="From the Quote"><input readOnly disabled value={d.proposerName} className={inputCls()} /></Field>
        <Field label="DOB" hint="From the Quote"><input readOnly disabled value={d.proposerDOB} className={inputCls()} /></Field>
        {pick("maritalStatus", "Marital Status", TERM_MARITAL, (v) => (v === "Married" ? {} : { sons: "", daughters: "" }))}
        {d.maritalStatus === "Married" && pick("sons", "No. of Children — Son", CHILD_COUNTS)}
        {d.maritalStatus === "Married" && pick("daughters", "No. of Children — Daughter", CHILD_COUNTS)}
      </div>
      <h4 className="text-sm font-semibold text-gray-700 mt-5 mb-2">Nominee</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {text("nomineeName", "Nominee Name")}
        {text("nomineeDOB", "Nominee DOB", { type: "date" })}
        {pick("nomineeRelation", "Relationship with Nominee", TERM_NOMINEE_RELATIONS)}
        {file("nomineeAadhaarFile", "Upload Nominee Aadhaar (JPG/JPEG/PDF)")}
      </div>
      <h4 className="text-sm font-semibold text-gray-700 mt-5 mb-2">Proposer KYC</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {text("height", "Height", { })}
        {text("weight", "Weight (kg)", { inputMode: "numeric", transform: (v) => v.replace(/[^\d.]/g, "") })}
        <div />
        {text("aadhaarNumber", "Aadhaar Number", { inputMode: "numeric", transform: (v) => v.replace(/\D/g, "").slice(0, 12) /* paste "1234 5678 9012" works */ })}
        {file("aadhaarFile", "Upload Aadhaar (Mandatory)")}
        <div />
        {text("panNumber", "PAN Number", { maxLength: 10, transform: (v) => v.toUpperCase() })}
        {file("panFile", "Upload PAN")}
      </div>
      <h4 className="text-sm font-semibold text-gray-700 mt-5 mb-2">Income Documents (PDF only)</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {file("salarySlipFile", "Upload last 3 Month Salary Slip", { required: d.occupation === "Salaried", accept: ".pdf" })}
        {file("bankStatementFile", "Upload last 3 Month Bank Statement", { accept: ".pdf" })}
        {file("itrFile", "Upload ITR Copy (If Applicable — Not Mandatory)", { required: false, accept: ".pdf" })}
      </div>
      <Field label="Remarks (PED / Treatment)" className="mt-4">
        <textarea data-field="term_issuanceRemarks" rows="2" value={d.issuanceRemarks} onChange={(e) => set({ issuanceRemarks: e.target.value })} className={inputCls()} />
      </Field>
    </div>
  );
}
