// src/components/lob/PersonalAccidentForm.jsx
// ============================================================
// PERSONAL ACCIDENT (PA BRD) — staged like Health / Motor / Mobile:
//   Quote module           -> <PAQuoteSection>     (Admin + Employee)
//   Policy Issuance module -> <PAIssuanceSection>  (Admin + Employee)
// Leads saved with the older single-page PA form are converted on load.
// ============================================================
import { useEffect } from "react";
import { FaShieldAlt } from "react-icons/fa";
import {
  YES_NO, QUALIFICATIONS, OCCUPATIONS, Field, FileInput, Select, inputCls, rupeeOptions, range,
  validateAadhaar, validatePAN, maxAdultDob, todayStr, fmtDate, stripFiles, hasFile,
} from "./LobShared";

// ---- option lists (PA BRD) ----
export const PA_POLICY_TYPES = ["Individual", "Family Floater"];
export const PA_TENURES = ["1 Year", "2 Years", "3 Years"];
export const PA_SUM_INSURED = ["1 Lakh", "2 Lakh", "3 Lakh", "5 Lakh", "7.5 Lakh", "10 Lakh", "15 Lakh", "20 Lakh", "25 Lakh", "50 Lakh", "75 Lakh", "1 Crore", "2 Crore"];
export const PA_MARITAL = ["Married", "Unmarried", "Live-in Relationship", "Widow", "Divorcee"];
const PREVIOUS_CASES = ["Renew Case", "Portability Case", "Fresh Case"];
const EXPERIENCE_YEARS = Array.from({ length: 20 }, (_, i) => i + 1);

const HEALTH_PRIME = [
  ...Array.from({ length: 8 }, (_, i) => `Individual Option ${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `Floater Option ${i + 1}`),
];
const lakh = (n) => n * 100000;

// The 14 additional covers of the PA BRD
//   select = pick a Sum Insured, number = type the amount, fixed = fixed SI, na = no SI
export const PA_COVERS = [
  { key: "accidentalHospitalization", label: "Accidental Hospitalization Expenses", type: "select", options: rupeeOptions(range(lakh(2), lakh(25), lakh(1))) },
  { key: "adventureSportsDeath", label: "Adventure Sports Benefit (Death)", type: "na" },
  { key: "airAmbulance", label: "Air Ambulance Cover", type: "select", options: rupeeOptions([5, 10, 15, 20, 25].map(lakh)) },
  { key: "coma", label: "COMA due to Accidental Bodily Injury", type: "select", options: rupeeOptions(range(lakh(1), lakh(10), lakh(1))) },
  { key: "fractureCare", label: "Fracture Care", type: "select", options: rupeeOptions([50000, 75000, lakh(1), lakh(2), lakh(3), lakh(4), lakh(5)]) },
  { key: "loanProtector", label: "Loan Protector Cover", type: "number" },
  { key: "roadAmbulance", label: "Road Ambulance Cover", type: "fixed", value: 25000 },
  { key: "healthPrime", label: "Health Prime Rider", type: "select", options: HEALTH_PRIME },
  { key: "adventureSportsPTD", label: "Adventure Sports Benefit (PTD)", type: "na" },
  { key: "childrenEducation", label: "Children Education Benefit", type: "select", options: rupeeOptions(range(lakh(1), lakh(10), lakh(1))) },
  { key: "emiPayment", label: "EMI Payment Cover", type: "select", options: rupeeOptions([50000, 75000, lakh(1), lakh(2), lakh(3), lakh(4), lakh(5)]) },
  { key: "hospitalCash", label: "Hospital Cash Benefit", type: "select", options: rupeeOptions(range(1000, 10000, 1000)) },
  { key: "lossOfIncome", label: "Loss of Income due to Disability from Accident", type: "select", options: rupeeOptions(range(32000, 50000, 1000)) },
  { key: "travelExpenses", label: "Travel Expenses Benefit", type: "fixed", value: 25000 },
];
const coverNeedsValue = (c) => c.type === "select" || c.type === "number";

/** "Air Ambulance Cover (₹10,00,000), Road Ambulance Cover (₹25,000)" */
export const describeCovers = (d = {}) => {
  if (d.wantAdditionalCover !== "Yes") return d.wantAdditionalCover === "No" ? "No additional cover" : "";
  return PA_COVERS.filter((c) => d.covers?.[c.key]?.selected)
    .map((c) => {
      const v = c.type === "fixed" ? c.value : d.covers[c.key].value;
      if (c.type === "na" || !v) return c.label;
      return `${c.label} (${/^\d+$/.test(String(v)) ? `₹${Number(v).toLocaleString("en-IN")}` : v})`;
    })
    .join(", ");
};

// ============================================================
// STATE
// ============================================================
export const emptyPA = () => ({
  // Quote
  hasPreviousPolicy: "", previousPolicyCase: "", experienceYears: "",
  renewalDetails: { insurerName: "", policyNumber: "", policyDueDate: "", uploadPolicy: null },
  portabilityDetails: [],
  policyType: "", proposerName: "", proposerDOB: "", familyIncome: "", grossMonthlyIncome: "", occupation: "",
  deathSI: "", ppdSI: "", ptdSI: "", pedRemarks: "", wantAdditionalCover: "", covers: {},
  // Policy Issuance
  maritalStatus: "", height: "", weight: "", qualification: "",
  aadhaarNumber: "", aadhaarFile: null, panNumber: "", panFile: null, issuanceRemarks: "",
});

const str = (v) => (v === null || v === undefined ? "" : String(v));

/** Load a saved lead; older single-page PA leads are mapped onto the staged fields */
export const hydratePA = (s, leadName = "") => {
  if (!s) return { ...emptyPA(), proposerName: leadName };
  const m = (s.members && s.members[0]) || {};
  const legacy = !s.policyType && s.members?.length;
  const base = { ...emptyPA(), ...s };
  if (legacy) {
    Object.assign(base, {
      hasPreviousPolicy: s.policyCase ? (s.policyCase === "New" ? "No" : "Yes") : "",
      previousPolicyCase: s.policyCase === "Renew" ? "Renew Case" : s.policyCase === "Portability" ? "Portability Case" : "",
      renewalDetails: { insurerName: s.prevInsurerName || "", policyNumber: s.prevPolicyNumber || "", policyDueDate: s.prevPolicyDueDate || "", uploadPolicy: s.prevPolicyFile || null },
      policyType: "Individual",
      proposerName: m.fullName || leadName, proposerDOB: m.dob, grossMonthlyIncome: m.grossMonthlyIncome, occupation: m.occupation,
      deathSI: m.deathSI, ppdSI: m.ppdSI, ptdSI: m.ptdSI, wantAdditionalCover: m.wantAdditionalCover || "", covers: m.covers || {},
      pedRemarks: m.pedDetails || "", maritalStatus: m.maritalStatus || "", height: m.height || "", weight: m.weight,
      qualification: m.qualification || "", aadhaarNumber: m.aadhaarNumber || "", aadhaarFile: m.aadhaarFront || null,
      panNumber: m.panNumber || "", panFile: m.panFile || null,
    });
  }
  return {
    ...base,
    proposerName: base.proposerName || leadName,
    experienceYears: str(base.experienceYears),
    familyIncome: str(base.familyIncome), grossMonthlyIncome: str(base.grossMonthlyIncome),
    deathSI: str(base.deathSI), ppdSI: str(base.ppdSI), ptdSI: str(base.ptdSI), weight: str(base.weight),
    proposerDOB: fmtDate(base.proposerDOB),
    covers: base.covers || {},
    renewalDetails: { insurerName: "", policyNumber: "", uploadPolicy: null, ...(base.renewalDetails || {}), policyDueDate: fmtDate(base.renewalDetails?.policyDueDate) },
    portabilityDetails: (base.portabilityDetails || []).map((p) => ({
      ...p, policyActiveFrom: fmtDate(p.policyActiveFrom), policyTillDate: fmtDate(p.policyTillDate), uploadPYP: p.uploadPYP || null,
    })),
  };
};

/** Adds paDetails JSON + files to the FormData */
export const appendPA = (fd, d) => {
  fd.append("paDetails", stripFiles(d));
  if (d.renewalDetails?.uploadPolicy instanceof File) fd.append("paRenewalPolicyFile", d.renewalDetails.uploadPolicy);
  (d.portabilityDetails || []).forEach((p, i) => { if (p.uploadPYP instanceof File) fd.append(`paPortabilityPYP_${i}`, p.uploadPYP); });
  if (d.aadhaarFile instanceof File) fd.append("paAadhaarFile", d.aadhaarFile);
  if (d.panFile instanceof File) fd.append("paPanFile", d.panFile);
};

// ============================================================
// VALIDATION
// ============================================================
const multipleOf1000 = (v) => Number(v) > 0 && Number(v) % 1000 === 0;

/** Quote module (formData carries Policy Tenure + Sum Insured) */
export const validatePA = (d, formData = {}) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  if (!d.hasPreviousPolicy) add("pa_hasPreviousPolicy", "PA: Select whether there is an Active Policy");
  if (d.hasPreviousPolicy === "Yes") {
    if (!d.previousPolicyCase) add("pa_previousPolicyCase", "PA: Select the Previous Policy Case");
    if (d.previousPolicyCase === "Renew Case") {
      if (!d.renewalDetails?.insurerName) add("pa_renewalInsurer", "PA Renewal: Insurer Name is required");
      if (!d.renewalDetails?.policyNumber) add("pa_renewalPolicy", "PA Renewal: Policy Number is required");
      if (!d.renewalDetails?.policyDueDate) add("pa_renewalDueDate", "PA Renewal: Policy Due Date is required");
    }
    if (d.previousPolicyCase === "Portability Case" && !(Number(d.experienceYears) > 0)) add("pa_experienceYears", "PA Portability: select how many years old the policy is");
  }
  if (!d.policyType) add("pa_policyType", "PA: Policy Type is required");
  if (!formData.policyTenure) add("policyTenure", "PA: Policy Tenure is required");
  if (!formData.sumInsured) add("sumInsured", "PA: Sum Insured is required");
  if (!String(d.proposerName || "").trim()) add("pa_proposerName", "PA: Proposer Name is required");
  if (!d.proposerDOB) add("pa_proposerDOB", "PA: Proposer DOB is required");
  else if (d.proposerDOB > maxAdultDob()) add("pa_proposerDOB", "PA: Proposer must be at least 18 years old");
  if (!(Number(d.familyIncome) > 0)) add("pa_familyIncome", "PA: Family Income is required");
  if (!(Number(d.grossMonthlyIncome) > 0)) add("pa_grossMonthlyIncome", "PA: Gross Monthly Income is required");
  if (!d.occupation) add("pa_occupation", "PA: Occupation is required");
  [["deathSI", "Death"], ["ppdSI", "Permanent Partial Disability"], ["ptdSI", "Permanent Total Disability"]].forEach(([k, label]) => {
    if (!d[k]) add(`pa_${k}`, `PA: ${label} Sum Insured is required`);
    else if (!multipleOf1000(d[k])) add(`pa_${k}`, `PA: ${label} Sum Insured must be in multiples of 1000`);
  });
  if (!d.wantAdditionalCover) add("pa_wantAdditionalCover", "PA: Do you want to add any additional cover? (Yes / No)");
  if (d.wantAdditionalCover === "Yes") {
    const picked = PA_COVERS.filter((c) => d.covers?.[c.key]?.selected);
    if (!picked.length) add("pa_covers", "PA: Select at least one additional cover");
    picked.filter(coverNeedsValue).forEach((c) => {
      if (!d.covers[c.key].value) add(`pa_cover_${c.key}`, `PA: ${c.label} — Sum Insured is required`);
    });
  }
  return out;
};

/** Policy Issuance module */
export const validatePAIssuance = (d) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  if (!d.maritalStatus) add("pa_maritalStatus", "PA: Marital Status is required");
  if (!String(d.height || "").trim()) add("pa_height", "PA: Height is required");
  if (!(Number(d.weight) > 0)) add("pa_weight", "PA: Weight is required");
  if (!d.qualification) add("pa_qualification", "PA: Qualification is required");
  if (!d.occupation) add("pa_occupation", "PA: Occupation is required");
  if (!d.aadhaarNumber) add("pa_aadhaarNumber", "PA: Aadhaar Number is required");
  else if (!validateAadhaar(d.aadhaarNumber)) add("pa_aadhaarNumber", "PA: Aadhaar must be exactly 12 digits");
  if (!hasFile(d.aadhaarFile)) add("pa_aadhaarFile", "PA: Upload Aadhaar (mandatory)");
  if (!d.panNumber) add("pa_panNumber", "PA: Proposer PAN Number is required");
  else if (!validatePAN(d.panNumber)) add("pa_panNumber", "PA: PAN format ABCDE1234F");
  if (!hasFile(d.panFile)) add("pa_panFile", "PA: Upload PAN Card (mandatory)");
  if (d.hasPreviousPolicy === "Yes" && d.previousPolicyCase === "Portability Case") {
    (d.portabilityDetails || []).forEach((p, i) => {
      const w = `PA Previous Policy ${i + 1}: `;
      if (!p.insurerName) add(`pa_port_${i}_insurerName`, w + "Insurer Name is required");
      if (!p.policyNumber) add(`pa_port_${i}_policyNumber`, w + "Policy Number is required");
      if (!p.policyActiveFrom) add(`pa_port_${i}_policyActiveFrom`, w + "Active From is required");
      if (!p.policyTillDate) add(`pa_port_${i}_policyTillDate`, w + "Till Date is required");
      if (!p.sumAssured) add(`pa_port_${i}_sumAssured`, w + "Sum Insured is required");
      if (!hasFile(p.uploadPYP)) add(`pa_port_${i}_uploadPYP`, w + "Upload PYP is mandatory");
    });
  }
  return out;
};

// ============================================================
// QUOTE MODULE
// ============================================================
export function PAQuoteSection({ details: d, setDetails, errors: err = {}, formData = {}, setFormData, insurerOptions = [] }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const setRenewal = (patch) => setDetails((p) => ({ ...p, renewalDetails: { ...(p.renewalDetails || {}), ...patch } }));
  const setCover = (key, patch) => setDetails((p) => ({ ...p, covers: { ...(p.covers || {}), [key]: { ...(p.covers?.[key] || {}), ...patch } } }));
  const setLead = (patch) => setFormData && setFormData((p) => ({ ...p, ...patch }));
  const amount = (k, label) => (
    <Field label={label} required error={err[`pa_${k}`]} hint="Enter the amount in multiples of 1000">
      <input data-field={`pa_${k}`} type="text" inputMode="numeric" value={d[k]} onChange={(e) => set({ [k]: e.target.value.replace(/\D/g, "") })} className={inputCls(err[`pa_${k}`])} />
    </Field>
  );
  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2"><FaShieldAlt /> Personal Accident — Quote Details</h4>

      <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Active Policy?" required error={err.pa_hasPreviousPolicy}>
          <Select
            data-field="pa_hasPreviousPolicy" options={YES_NO} value={d.hasPreviousPolicy} className={inputCls(err.pa_hasPreviousPolicy)}
            onChange={(e) => {
              const v = e.target.value;
              set(v === "Yes" ? { hasPreviousPolicy: v } : { hasPreviousPolicy: v, previousPolicyCase: "", experienceYears: "", portabilityDetails: [], renewalDetails: { insurerName: "", policyNumber: "", policyDueDate: "", uploadPolicy: null } });
            }}
          />
        </Field>
        {d.hasPreviousPolicy === "Yes" && (
          <Field label="Previous Policy Case" required error={err.pa_previousPolicyCase}>
            <Select data-field="pa_previousPolicyCase" options={PREVIOUS_CASES} value={d.previousPolicyCase} onChange={(e) => set({ previousPolicyCase: e.target.value })} className={inputCls(err.pa_previousPolicyCase)} />
          </Field>
        )}
        {d.hasPreviousPolicy === "Yes" && d.previousPolicyCase === "Portability Case" && (
          <Field label="How many years Experience / Old is the Policy?" required error={err.pa_experienceYears} hint="Details for each year are filled at Policy Issuance">
            <Select data-field="pa_experienceYears" options={EXPERIENCE_YEARS} value={d.experienceYears} onChange={(e) => set({ experienceYears: e.target.value })} className={inputCls(err.pa_experienceYears)} />
          </Field>
        )}
        {d.hasPreviousPolicy === "Yes" && d.previousPolicyCase === "Fresh Case" && <p className="text-sm text-green-700 self-end">Fresh Case — no previous policy details required.</p>}
        {d.hasPreviousPolicy === "Yes" && d.previousPolicyCase === "Renew Case" && (
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Renewal — Insurer Name" required error={err.pa_renewalInsurer}>
              <Select data-field="pa_renewalInsurer" options={insurerOptions} value={d.renewalDetails?.insurerName || ""} onChange={(e) => setRenewal({ insurerName: e.target.value })} className={inputCls(err.pa_renewalInsurer)} />
            </Field>
            <Field label="Policy No" required error={err.pa_renewalPolicy}>
              <input data-field="pa_renewalPolicy" type="text" value={d.renewalDetails?.policyNumber || ""} onChange={(e) => setRenewal({ policyNumber: e.target.value })} className={inputCls(err.pa_renewalPolicy)} />
            </Field>
            <Field label="Policy Due Date" required error={err.pa_renewalDueDate}>
              <input data-field="pa_renewalDueDate" type="date" value={d.renewalDetails?.policyDueDate || ""} onChange={(e) => setRenewal({ policyDueDate: e.target.value })} className={inputCls(err.pa_renewalDueDate)} />
            </Field>
            <FileInput label="Upload Policy (Not Mandatory)" name="pa_renewalUpload" value={d.renewalDetails?.uploadPolicy} onChange={(file) => setRenewal({ uploadPolicy: file })} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Policy Type" required error={err.pa_policyType}>
          <Select data-field="pa_policyType" options={PA_POLICY_TYPES} value={d.policyType} onChange={(e) => set({ policyType: e.target.value })} className={inputCls(err.pa_policyType)} />
        </Field>
        <Field label="Policy Tenure" required error={err.policyTenure}>
          <Select data-field="policyTenure" options={PA_TENURES} value={formData.policyTenure || ""} onChange={(e) => setLead({ policyTenure: e.target.value })} className={inputCls(err.policyTenure)} />
        </Field>
        <Field label="Sum Insured" required error={err.sumInsured}>
          <Select data-field="sumInsured" options={formData.sumInsured && !PA_SUM_INSURED.includes(formData.sumInsured) ? [formData.sumInsured, ...PA_SUM_INSURED] : PA_SUM_INSURED} value={formData.sumInsured || ""} onChange={(e) => setLead({ sumInsured: e.target.value })} className={inputCls(err.sumInsured)} />
        </Field>
        <Field label="Proposer Name" required error={err.pa_proposerName} hint="Taken from the lead — you can change it">
          <input data-field="pa_proposerName" type="text" value={d.proposerName} onChange={(e) => set({ proposerName: e.target.value.toUpperCase() })} className={`${inputCls(err.pa_proposerName)} uppercase`} />
        </Field>
        <Field label="Proposer DOB" required error={err.pa_proposerDOB}>
          <input data-field="pa_proposerDOB" type="date" max={maxAdultDob()} value={d.proposerDOB} onChange={(e) => set({ proposerDOB: e.target.value })} className={inputCls(err.pa_proposerDOB)} />
        </Field>
        <Field label="Occupation" required error={err.pa_occupation}>
          <Select data-field="pa_occupation" options={OCCUPATIONS} value={d.occupation} onChange={(e) => set({ occupation: e.target.value })} className={inputCls(err.pa_occupation)} />
        </Field>
        <Field label="Family Income (₹, yearly)" required error={err.pa_familyIncome}>
          <input data-field="pa_familyIncome" type="text" inputMode="numeric" value={d.familyIncome} onChange={(e) => set({ familyIncome: e.target.value.replace(/\D/g, "") })} className={inputCls(err.pa_familyIncome)} />
        </Field>
        <Field label="Gross Monthly Income (₹)" required error={err.pa_grossMonthlyIncome}>
          <input data-field="pa_grossMonthlyIncome" type="text" inputMode="numeric" value={d.grossMonthlyIncome} onChange={(e) => set({ grossMonthlyIncome: e.target.value.replace(/\D/g, "") })} className={inputCls(err.pa_grossMonthlyIncome)} />
        </Field>
        <div />
        {amount("deathSI", "Death Sum Insured (₹)")}
        {amount("ppdSI", "Permanent Partial Disability Sum Insured (₹)")}
        {amount("ptdSI", "Permanent Total Disability Sum Insured (₹)")}
        <Field label="PED, If Any" className="sm:col-span-2 lg:col-span-3">
          <textarea rows="2" value={d.pedRemarks} onChange={(e) => set({ pedRemarks: e.target.value })} className={inputCls()} placeholder="Pre-existing disease / disability details" />
        </Field>
        <Field label="Do you want to add any additional cover?" required error={err.pa_wantAdditionalCover}>
          <Select data-field="pa_wantAdditionalCover" options={YES_NO} value={d.wantAdditionalCover} onChange={(e) => set(e.target.value === "No" ? { wantAdditionalCover: "No", covers: {} } : { wantAdditionalCover: e.target.value })} className={inputCls(err.pa_wantAdditionalCover)} />
        </Field>
      </div>

      {d.wantAdditionalCover === "Yes" && (
        <div data-field="pa_covers" className={`mt-3 border rounded-lg p-3 ${err.pa_covers ? "border-red-500" : "border-gray-200"}`}>
          <p className="text-sm font-medium text-gray-700 mb-2">Additional Covers {err.pa_covers && <span className="text-red-500 text-xs ml-2">{err.pa_covers}</span>}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2">
            {PA_COVERS.map((c) => {
              const cv = d.covers?.[c.key] || {};
              const e = err[`pa_cover_${c.key}`];
              return (
                <div key={c.key} className="flex flex-wrap items-center gap-2 py-1 border-b border-gray-100">
                  <label className="flex items-center gap-2 text-sm flex-1 min-w-[220px]">
                    <input type="checkbox" className="rounded text-indigo-600" checked={!!cv.selected} onChange={(ev) => setCover(c.key, { selected: ev.target.checked, value: ev.target.checked ? cv.value || "" : "" })} />
                    {c.label}
                  </label>
                  {cv.selected && c.type === "select" && (
                    <Select data-field={`pa_cover_${c.key}`} options={c.options} placeholder="Select SI" value={cv.value || ""} onChange={(ev) => setCover(c.key, { value: ev.target.value })} className={`${inputCls(e)} max-w-[180px]`} />
                  )}
                  {cv.selected && c.type === "number" && (
                    <input data-field={`pa_cover_${c.key}`} type="text" inputMode="numeric" placeholder="Amount (₹)" value={cv.value || ""} onChange={(ev) => setCover(c.key, { value: ev.target.value.replace(/\D/g, "") })} className={`${inputCls(e)} max-w-[180px]`} />
                  )}
                  {cv.selected && c.type === "fixed" && <span className="text-xs text-gray-600">SI ₹{c.value.toLocaleString("en-IN")}</span>}
                  {cv.selected && c.type === "na" && <span className="text-xs text-gray-500">SI not applicable</span>}
                  {e && <span className="text-red-500 text-xs w-full">{e}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// POLICY ISSUANCE MODULE
// ============================================================
export function PAIssuanceSection({ details: d, setDetails, errors: err = {}, insurerOptions = [], sumInsuredOptions = [] }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const setPort = (i, patch) => setDetails((p) => ({ ...p, portabilityDetails: (p.portabilityDetails || []).map((r, k) => (k === i ? { ...r, ...patch } : r)) }));
  const portability = d.hasPreviousPolicy === "Yes" && d.previousPolicyCase === "Portability Case";
  const years = parseInt(d.experienceYears, 10) || 0;
  const rowCount = (d.portabilityDetails || []).length;

  // one previous-policy row per year of experience (Portability)
  useEffect(() => {
    if (!portability || rowCount === years) return;
    setDetails((p) => {
      const cur = p.portabilityDetails || [];
      return {
        ...p,
        portabilityDetails: Array.from({ length: years }, (_, i) => cur[i] || { insurerName: "", policyNumber: "", policyActiveFrom: "", policyTillDate: "", sumAssured: "", claimTaken: "", uploadPYP: null }),
      };
    });
  }, [portability, years, rowCount, setDetails]);

  // remarks start from the PED noted at the Quote
  useEffect(() => {
    if (!d.issuanceRemarks && d.pedRemarks) set({ issuanceRemarks: d.pedRemarks });
  }, [d.pedRemarks]); // eslint-disable-line react-hooks/exhaustive-deps

  const covers = describeCovers(d);
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-md font-semibold text-indigo-600 mb-3">Proposer Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Name" hint="From the Quote"><input type="text" readOnly value={d.proposerName} className={`${inputCls()} bg-gray-100`} /></Field>
          <Field label="DOB" hint="From the Quote"><input type="date" readOnly value={d.proposerDOB} className={`${inputCls()} bg-gray-100`} /></Field>
          <Field label="Relationship"><input type="text" readOnly value="Self" className={`${inputCls()} bg-gray-100`} /></Field>
          <Field label="Marital Status" required error={err.pa_maritalStatus}>
            <Select data-field="pa_maritalStatus" options={PA_MARITAL} value={d.maritalStatus} onChange={(e) => set({ maritalStatus: e.target.value })} className={inputCls(err.pa_maritalStatus)} />
          </Field>
          <Field label="Height (ft/in)" required error={err.pa_height}>
            <input data-field="pa_height" type="text" value={d.height} onChange={(e) => set({ height: e.target.value })} className={inputCls(err.pa_height)} placeholder={`e.g., 5'8"`} />
          </Field>
          <Field label="Weight (kg)" required error={err.pa_weight}>
            <input data-field="pa_weight" type="text" inputMode="numeric" value={d.weight} onChange={(e) => set({ weight: e.target.value.replace(/[^\d.]/g, "") })} className={inputCls(err.pa_weight)} />
          </Field>
          <Field label="Qualification" required error={err.pa_qualification}>
            <Select data-field="pa_qualification" options={QUALIFICATIONS} value={d.qualification} onChange={(e) => set({ qualification: e.target.value })} className={inputCls(err.pa_qualification)} />
          </Field>
          <Field label="Occupation" required error={err.pa_occupation}>
            <Select data-field="pa_occupation" options={OCCUPATIONS} value={d.occupation} onChange={(e) => set({ occupation: e.target.value })} className={inputCls(err.pa_occupation)} />
          </Field>
          <div />
          <Field label="Aadhaar Number" required error={err.pa_aadhaarNumber}>
            <input data-field="pa_aadhaarNumber" type="text" inputMode="numeric" maxLength="12" value={d.aadhaarNumber} onChange={(e) => set({ aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} className={inputCls(err.pa_aadhaarNumber)} />
          </Field>
          <FileInput label="Upload Aadhaar (Mandatory)" required name="pa_aadhaarFile" value={d.aadhaarFile} error={err.pa_aadhaarFile} onChange={(file) => set({ aadhaarFile: file })} />
          <div />
          <Field label="PAN Number" required error={err.pa_panNumber}>
            <input data-field="pa_panNumber" type="text" maxLength="10" value={d.panNumber} onChange={(e) => set({ panNumber: e.target.value.toUpperCase().slice(0, 10) })} className={`${inputCls(err.pa_panNumber)} uppercase`} placeholder="ABCDE1234F" />
          </Field>
          <FileInput label="Upload PAN Card (Mandatory)" required name="pa_panFile" value={d.panFile} error={err.pa_panFile} onChange={(file) => set({ panFile: file })} />
          <div />
          <Field label="Any Additional Cover?" className="sm:col-span-2 lg:col-span-3">
            <div className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 min-h-[38px]">{covers || "—"}</div>
          </Field>
          <Field label="Remarks (PED / Treatment)" className="sm:col-span-2 lg:col-span-3">
            <textarea rows="2" value={d.issuanceRemarks} onChange={(e) => set({ issuanceRemarks: e.target.value })} className={inputCls()} />
          </Field>
        </div>
      </div>

      {portability && (
        <div>
          <h4 className="text-md font-semibold text-indigo-600 mb-3">Previous Policy Details (Portability — {years} year{years === 1 ? "" : "s"})</h4>
          {(d.portabilityDetails || []).map((p, i) => {
            const k = (f) => `pa_port_${i}_${f}`;
            return (
              <div key={i} className="border rounded-lg p-4 mb-3 bg-gray-50">
                <h5 className="font-medium text-gray-700 mb-3">Previous Policy {i + 1}</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Insurer Name" required error={err[k("insurerName")]}>
                    <Select data-field={k("insurerName")} options={insurerOptions} value={p.insurerName || ""} onChange={(e) => setPort(i, { insurerName: e.target.value })} className={inputCls(err[k("insurerName")])} />
                  </Field>
                  <Field label="Policy Number" required error={err[k("policyNumber")]}>
                    <input data-field={k("policyNumber")} type="text" value={p.policyNumber || ""} onChange={(e) => setPort(i, { policyNumber: e.target.value })} className={inputCls(err[k("policyNumber")])} />
                  </Field>
                  <Field label="Active From" required error={err[k("policyActiveFrom")]}>
                    <input data-field={k("policyActiveFrom")} type="date" max={todayStr()} value={p.policyActiveFrom || ""} onChange={(e) => setPort(i, { policyActiveFrom: e.target.value })} className={inputCls(err[k("policyActiveFrom")])} />
                  </Field>
                  <Field label="Till Date" required error={err[k("policyTillDate")]}>
                    <input data-field={k("policyTillDate")} type="date" value={p.policyTillDate || ""} onChange={(e) => setPort(i, { policyTillDate: e.target.value })} className={inputCls(err[k("policyTillDate")])} />
                  </Field>
                  <Field label="Sum Insured" required error={err[k("sumAssured")]}>
                    <Select data-field={k("sumAssured")} options={sumInsuredOptions.length ? sumInsuredOptions : PA_SUM_INSURED} value={p.sumAssured || ""} onChange={(e) => setPort(i, { sumAssured: e.target.value })} className={inputCls(err[k("sumAssured")])} />
                  </Field>
                  <Field label="Any Claim taken?">
                    <Select options={YES_NO} value={p.claimTaken || ""} onChange={(e) => setPort(i, { claimTaken: e.target.value })} className={inputCls()} />
                  </Field>
                  <FileInput label="Upload PYP (Mandatory)" required name={k("uploadPYP")} value={p.uploadPYP} error={err[k("uploadPYP")]} onChange={(file) => setPort(i, { uploadPYP: file })} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PAQuoteSection;
