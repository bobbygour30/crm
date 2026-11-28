// src/components/lob/TravelInsuranceForm.jsx
// ============================================================
// TRAVEL INSURANCE (Travel BRD) — staged like Health / Motor / Mobile:
//   Quote module           -> <TravelQuoteSection>     (Admin + Employee)
//   Policy Issuance module -> <TravelIssuanceSection>  (Admin + Employee)
// The proposer travels; extra travellers go in `companions`.
// Leads saved with the older single-page Travel form are converted on load.
// ============================================================
import { useEffect } from "react";
import { FaPlane, FaPlus, FaTrash } from "react-icons/fa";
import {
  YES_NO, Field, FileInput, Select, inputCls,
  validateAadhaar, validatePassport, addDaysStr, todayStr, fmtDate, stripFiles, hasFile,
} from "./LobShared";

// ---- option lists (Travel BRD) ----
export const TRAVEL_REGIONS = [
  "Worldwide Including USA and Canada",
  "Worldwide Excluding USA and Canada",
  "Asia Excluding Japan",
  "Schengen",
  "Within India - Domestic",
];
export const TRAVEL_SUM_INSURED = [
  ...[50000, 100000, 200000, 500000, 750000, 1000000].map((n) => ({ label: `$${n.toLocaleString("en-US")}`, value: String(n) })),
  { label: "Modular", value: "Modular" },
];
export const TRAVEL_PLANS = ["Travel Ace Standard", "Travel Prime Individual Silver", "Travel Companion Care", "Travel Elite Silver", "Travel Assist Classic"];
export const TRAVEL_MARITAL = ["Married", "Unmarried", "Live-in Relationship", "Widow", "Divorcee"];
const COMPANION_RELATIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Friend", "Other"];
export const GST_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const sumInsuredLabel = (v) => (TRAVEL_SUM_INSURED.find((o) => o.value === String(v)) || {}).label || v || "";

// days between two yyyy-mm-dd dates, inclusive (start == end -> 1 day)
const daysInclusive = (start, end) => {
  if (!start || !end) return "";
  const n = Math.round((new Date(end + "T00:00:00Z") - new Date(start + "T00:00:00Z")) / 86400000) + 1;
  return n > 0 ? String(n) : "";
};

// ============================================================
// STATE
// ============================================================
const emptyCompanion = () => ({ fullName: "", dob: "", relationship: "", passportNumber: "", passportFront: null, passportBack: null });

export const emptyTravel = () => ({
  // Quote
  region: "", journeyStartDate: "", journeyEndDate: "", travelDays: "", gstState: "",
  proposerName: "", proposerDOB: "", sumInsured: "", plan: "", additionalCovers: "", addonRemarks: "",
  addressAsPerPassport: "", passportNumber: "", passportFront: null, passportBack: null,
  hasPED: "", pedDetails: "", indianCitizen: "", aadhaarNumber: "", aadhaarFile: null,
  companions: [],
  // Policy Issuance
  maritalStatus: "", issuanceRemarks: "",
});

/** Load a saved lead; older single-page Travel leads (travelers[]) are mapped onto the staged fields */
export const hydrateTravel = (s, leadName = "") => {
  if (!s) return { ...emptyTravel(), proposerName: leadName };
  const base = { ...emptyTravel(), ...s };
  const legacy = !s.proposerName && s.travelers?.length;
  if (legacy) {
    const [p, ...rest] = s.travelers;
    Object.assign(base, {
      proposerName: p.fullName || leadName, proposerDOB: p.dob, sumInsured: p.sumInsured ? String(p.sumInsured) : "",
      plan: p.product || "", additionalCovers: p.addon ? "Required" : "", addonRemarks: p.addon || "",
      addressAsPerPassport: p.address || "", passportNumber: p.passportNumber || "", passportFront: p.passportFile || null,
      aadhaarNumber: p.aadhaarNumber || "", aadhaarFile: p.aadhaarFile || null,
      companions: rest.map((t) => ({ ...emptyCompanion(), fullName: t.fullName || "", dob: t.dob, relationship: t.relationship || "", passportNumber: t.passportNumber || "", passportFront: t.passportFile || null })),
    });
  }
  return {
    ...base,
    proposerName: base.proposerName || leadName,
    region: base.region === "World Wide Including USA and Canada" ? TRAVEL_REGIONS[0] : base.region === "World Wide Excluding USA and Canada" ? TRAVEL_REGIONS[1] : base.region || "",
    travelDays: base.travelDays ? String(base.travelDays) : "",
    sumInsured: base.sumInsured ? String(base.sumInsured) : "",
    journeyStartDate: fmtDate(base.journeyStartDate),
    journeyEndDate: fmtDate(base.journeyEndDate),
    proposerDOB: fmtDate(base.proposerDOB),
    companions: (base.companions || []).map((c) => ({ ...emptyCompanion(), ...c, dob: fmtDate(c.dob) })),
  };
};

/** Adds travelDetails JSON + files to the FormData */
export const appendTravel = (fd, d) => {
  fd.append("travelDetails", stripFiles(d));
  if (d.passportFront instanceof File) fd.append("travelPassportFront", d.passportFront);
  if (d.passportBack instanceof File) fd.append("travelPassportBack", d.passportBack);
  if (d.aadhaarFile instanceof File) fd.append("travelAadhaarFile", d.aadhaarFile);
  (d.companions || []).forEach((c, i) => {
    if (c.passportFront instanceof File) fd.append(`travelCompanionPassportFront_${i}`, c.passportFront);
    if (c.passportBack instanceof File) fd.append(`travelCompanionPassportBack_${i}`, c.passportBack);
  });
};

// ============================================================
// VALIDATION
// ============================================================
/** Quote module */
export const validateTravel = (d) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  const today = todayStr();
  if (!d.region) add("tr_region", "Travel: 'Travel to' is required");
  if (!d.journeyStartDate) add("tr_journeyStartDate", "Travel: Journey Start Date is required");
  else if (d.journeyStartDate < today) add("tr_journeyStartDate", "Travel: Journey Start Date must be today or a future date");
  if (!(Number(d.travelDays) >= 1)) add("tr_travelDays", "Travel: No. of Days is required");
  if (!d.journeyEndDate) add("tr_journeyEndDate", "Travel: Journey End Date is required");
  else if (d.journeyStartDate && d.journeyEndDate < d.journeyStartDate) add("tr_journeyEndDate", "Travel: Journey End Date cannot be before the start date");
  if (!d.gstState) add("tr_gstState", "Travel: Select the GST State");
  if (!String(d.proposerName || "").trim()) add("tr_proposerName", "Travel: Proposer Name is required");
  if (!d.proposerDOB) add("tr_proposerDOB", "Travel: Proposer DOB is required");
  else if (d.proposerDOB > today) add("tr_proposerDOB", "Travel: DOB cannot be in the future");
  if (!d.sumInsured) add("tr_sumInsured", "Travel: Sum Insured is required");
  if (!d.plan) add("tr_plan", "Travel: Select the Plan / Product");
  if (!d.additionalCovers) add("tr_additionalCovers", "Travel: Choose Additional Covers (Required / Not Required)");
  if (d.additionalCovers === "Required" && !String(d.addonRemarks || "").trim()) add("tr_addonRemarks", "Travel: Describe the additional covers required");
  if (!String(d.addressAsPerPassport || "").trim()) add("tr_addressAsPerPassport", "Travel: Address as per Passport is required");
  if (!d.passportNumber) add("tr_passportNumber", "Travel: Passport No is required");
  else if (!validatePassport(String(d.passportNumber).toUpperCase())) add("tr_passportNumber", "Travel: Enter a valid passport number (e.g. A1234567)");
  if (!hasFile(d.passportFront)) add("tr_passportFront", "Travel: Upload Passport Front (mandatory)");
  if (!hasFile(d.passportBack)) add("tr_passportBack", "Travel: Upload Passport Back (mandatory)");
  if (!d.hasPED) add("tr_hasPED", "Travel: Any pre-existing disease? (Yes / No)");
  if (d.hasPED === "Yes" && !String(d.pedDetails || "").trim()) add("tr_pedDetails", "Travel: Enter the pre-existing disease details");
  if (!d.indianCitizen) add("tr_indianCitizen", "Travel: Indian Citizen? (Yes / No)");
  if (d.aadhaarNumber && !validateAadhaar(d.aadhaarNumber)) add("tr_aadhaarNumber", "Travel: Aadhaar must be exactly 12 digits");
  (d.companions || []).forEach((c, i) => {
    const w = `Traveller ${i + 2}: `;
    const k = (f) => `tr_c${i}_${f}`;
    if (!String(c.fullName || "").trim()) add(k("fullName"), w + "Name is required");
    if (!c.dob) add(k("dob"), w + "DOB is required");
    if (!c.relationship) add(k("relationship"), w + "Relationship is required");
    if (!c.passportNumber) add(k("passportNumber"), w + "Passport No is required");
    else if (!validatePassport(String(c.passportNumber).toUpperCase())) add(k("passportNumber"), w + "Enter a valid passport number");
    if (!hasFile(c.passportFront)) add(k("passportFront"), w + "Upload Passport Front (mandatory)");
    if (!hasFile(c.passportBack)) add(k("passportBack"), w + "Upload Passport Back (mandatory)");
  });
  return out;
};

/** Policy Issuance module */
export const validateTravelIssuance = (d) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  if (!d.maritalStatus) add("tr_maritalStatus", "Travel: Marital Status is required");
  if (!hasFile(d.passportFront) || !hasFile(d.passportBack)) add("tr_passportFront", "Travel: Upload the Passport (front and back)");
  if (d.aadhaarNumber && !validateAadhaar(d.aadhaarNumber)) add("tr_aadhaarNumber", "Travel: Aadhaar must be exactly 12 digits");
  return out;
};

// ============================================================
// QUOTE MODULE
// ============================================================
export function TravelQuoteSection({ details: d, setDetails, errors: err = {} }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const setCompanion = (i, patch) => setDetails((p) => ({ ...p, companions: p.companions.map((c, k) => (k === i ? { ...c, ...patch } : c)) }));
  // start / days / end stay in step: changing days or start recalculates the end, changing the end recalculates days
  const setStart = (v) => setDetails((p) => {
    const days = parseInt(p.travelDays, 10);
    if (v && days > 0) return { ...p, journeyStartDate: v, journeyEndDate: addDaysStr(v, days - 1) };
    return { ...p, journeyStartDate: v, travelDays: daysInclusive(v, p.journeyEndDate) || p.travelDays };
  });
  const setDays = (v) => setDetails((p) => {
    const days = parseInt(v, 10);
    return { ...p, travelDays: v, journeyEndDate: p.journeyStartDate && days > 0 ? addDaysStr(p.journeyStartDate, days - 1) : "" };
  });
  const setEnd = (v) => setDetails((p) => ({ ...p, journeyEndDate: v, travelDays: daysInclusive(p.journeyStartDate, v) }));
  const today = todayStr();
  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2"><FaPlane /> Travel Insurance — Quote Details</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Travel to" required error={err.tr_region}>
          <Select data-field="tr_region" options={TRAVEL_REGIONS} value={d.region} onChange={(e) => set({ region: e.target.value })} className={inputCls(err.tr_region)} />
        </Field>
        <Field label="Journey Start Date" required error={err.tr_journeyStartDate} hint="Today or a future date">
          <input data-field="tr_journeyStartDate" type="date" min={today} value={d.journeyStartDate} onChange={(e) => setStart(e.target.value)} className={inputCls(err.tr_journeyStartDate)} />
        </Field>
        <Field label="No. of Days" required error={err.tr_travelDays} hint="Type the days, or pick the end date">
          <input data-field="tr_travelDays" type="text" inputMode="numeric" value={d.travelDays} onChange={(e) => setDays(e.target.value.replace(/\D/g, "").slice(0, 3))} className={inputCls(err.tr_travelDays)} />
        </Field>
        <Field label="Journey End Date" required error={err.tr_journeyEndDate}>
          <input data-field="tr_journeyEndDate" type="date" min={d.journeyStartDate || today} value={d.journeyEndDate} onChange={(e) => setEnd(e.target.value)} className={inputCls(err.tr_journeyEndDate)} />
        </Field>
        <Field label="GST State" required error={err.tr_gstState}>
          <Select data-field="tr_gstState" options={GST_STATES} value={d.gstState} onChange={(e) => set({ gstState: e.target.value })} className={inputCls(err.tr_gstState)} />
        </Field>
        <div />
        <Field label="Proposer Name" required error={err.tr_proposerName} hint="Taken from the lead — you can change it">
          <input data-field="tr_proposerName" type="text" value={d.proposerName} onChange={(e) => set({ proposerName: e.target.value.toUpperCase() })} className={`${inputCls(err.tr_proposerName)} uppercase`} />
        </Field>
        <Field label="Proposer DOB" required error={err.tr_proposerDOB}>
          <input data-field="tr_proposerDOB" type="date" max={today} value={d.proposerDOB} onChange={(e) => set({ proposerDOB: e.target.value })} className={inputCls(err.tr_proposerDOB)} />
        </Field>
        <Field label="Relationship"><input type="text" readOnly value="Self" className={`${inputCls()} bg-gray-100`} /></Field>
        <Field label="Sum Insured" required error={err.tr_sumInsured}>
          <Select data-field="tr_sumInsured" options={TRAVEL_SUM_INSURED} value={d.sumInsured} onChange={(e) => set({ sumInsured: e.target.value })} className={inputCls(err.tr_sumInsured)} />
        </Field>
        <Field label="Plan / Product" required error={err.tr_plan}>
          <Select data-field="tr_plan" options={TRAVEL_PLANS} value={d.plan} onChange={(e) => set({ plan: e.target.value })} className={inputCls(err.tr_plan)} />
        </Field>
        <Field label="Additional Covers" required error={err.tr_additionalCovers}>
          <Select data-field="tr_additionalCovers" options={["Not Required", "Required"]} value={d.additionalCovers} onChange={(e) => set({ additionalCovers: e.target.value, addonRemarks: e.target.value === "Required" ? d.addonRemarks : "" })} className={inputCls(err.tr_additionalCovers)} />
        </Field>
        {d.additionalCovers === "Required" && (
          <Field label="Additional Covers Required (Remarks)" required error={err.tr_addonRemarks} className="sm:col-span-2 lg:col-span-3">
            <textarea data-field="tr_addonRemarks" rows="2" value={d.addonRemarks} onChange={(e) => set({ addonRemarks: e.target.value })} className={inputCls(err.tr_addonRemarks)} />
          </Field>
        )}
        <Field label="Address as per Passport (or Other)" required error={err.tr_addressAsPerPassport} className="sm:col-span-2 lg:col-span-3">
          <textarea data-field="tr_addressAsPerPassport" rows="2" value={d.addressAsPerPassport} onChange={(e) => set({ addressAsPerPassport: e.target.value })} className={inputCls(err.tr_addressAsPerPassport)} />
        </Field>
        <Field label="Passport No" required error={err.tr_passportNumber}>
          <input data-field="tr_passportNumber" type="text" maxLength="8" value={d.passportNumber} onChange={(e) => set({ passportNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} className={`${inputCls(err.tr_passportNumber)} uppercase`} placeholder="A1234567" />
        </Field>
        <FileInput label="Upload Passport Front (Mandatory)" required name="tr_passportFront" value={d.passportFront} error={err.tr_passportFront} onChange={(file) => set({ passportFront: file })} />
        <FileInput label="Upload Passport Back (Mandatory)" required name="tr_passportBack" value={d.passportBack} error={err.tr_passportBack} onChange={(file) => set({ passportBack: file })} />
        <Field label="Any pre-existing disease(s)?" required error={err.tr_hasPED}>
          <Select data-field="tr_hasPED" options={YES_NO} value={d.hasPED} onChange={(e) => set({ hasPED: e.target.value, pedDetails: e.target.value === "Yes" ? d.pedDetails : "" })} className={inputCls(err.tr_hasPED)} />
        </Field>
        {d.hasPED === "Yes" && (
          <Field label="Pre-existing disease details" required error={err.tr_pedDetails} className="sm:col-span-2">
            <input data-field="tr_pedDetails" type="text" value={d.pedDetails} onChange={(e) => set({ pedDetails: e.target.value })} className={inputCls(err.tr_pedDetails)} />
          </Field>
        )}
        <Field label="Indian Citizen?" required error={err.tr_indianCitizen}>
          <Select data-field="tr_indianCitizen" options={YES_NO} value={d.indianCitizen} onChange={(e) => set({ indianCitizen: e.target.value })} className={inputCls(err.tr_indianCitizen)} />
        </Field>
        {d.indianCitizen === "Yes" && (
          <>
            <Field label="Aadhaar Number" error={err.tr_aadhaarNumber}>
              <input data-field="tr_aadhaarNumber" type="text" inputMode="numeric" maxLength="12" value={d.aadhaarNumber} onChange={(e) => set({ aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} className={inputCls(err.tr_aadhaarNumber)} />
            </Field>
            <FileInput label="Upload Aadhaar (Not Mandatory)" name="tr_aadhaarFile" value={d.aadhaarFile} onChange={(file) => set({ aadhaarFile: file })} />
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Other Travellers ({(d.companions || []).length})</p>
          <button type="button" onClick={() => set({ companions: [...(d.companions || []), emptyCompanion()] })} className="text-xs px-3 py-1 rounded-md border border-indigo-300 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1">
            <FaPlus /> Add Traveller
          </button>
        </div>
        {(d.companions || []).map((c, i) => {
          const k = (f) => `tr_c${i}_${f}`;
          return (
            <div key={i} className="border rounded-lg p-3 mb-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-700 text-sm">Traveller {i + 2}</h5>
                <button type="button" aria-label={`Remove traveller ${i + 2}`} onClick={() => set({ companions: d.companions.filter((_, x) => x !== i) })} className="text-red-500 hover:text-red-700"><FaTrash /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Field label="Name (as per Passport)" required error={err[k("fullName")]}>
                  <input data-field={k("fullName")} type="text" value={c.fullName} onChange={(e) => setCompanion(i, { fullName: e.target.value.toUpperCase() })} className={`${inputCls(err[k("fullName")])} uppercase`} />
                </Field>
                <Field label="DOB" required error={err[k("dob")]}>
                  <input data-field={k("dob")} type="date" max={today} value={c.dob} onChange={(e) => setCompanion(i, { dob: e.target.value })} className={inputCls(err[k("dob")])} />
                </Field>
                <Field label="Relationship" required error={err[k("relationship")]}>
                  <Select data-field={k("relationship")} options={COMPANION_RELATIONS} value={c.relationship} onChange={(e) => setCompanion(i, { relationship: e.target.value })} className={inputCls(err[k("relationship")])} />
                </Field>
                <Field label="Passport No" required error={err[k("passportNumber")]}>
                  <input data-field={k("passportNumber")} type="text" maxLength="8" value={c.passportNumber} onChange={(e) => setCompanion(i, { passportNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} className={`${inputCls(err[k("passportNumber")])} uppercase`} />
                </Field>
                <FileInput label="Passport Front (Mandatory)" required name={k("passportFront")} value={c.passportFront} error={err[k("passportFront")]} onChange={(file) => setCompanion(i, { passportFront: file })} />
                <FileInput label="Passport Back (Mandatory)" required name={k("passportBack")} value={c.passportBack} error={err[k("passportBack")]} onChange={(file) => setCompanion(i, { passportBack: file })} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// POLICY ISSUANCE MODULE
// ============================================================
export function TravelIssuanceSection({ details: d, setDetails, errors: err = {} }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  // remarks start from the PED noted at the Quote
  useEffect(() => {
    if (!d.issuanceRemarks && d.hasPED === "Yes" && d.pedDetails) set({ issuanceRemarks: d.pedDetails });
  }, [d.pedDetails]); // eslint-disable-line react-hooks/exhaustive-deps
  const ro = `${inputCls()} bg-gray-100`;
  return (
    <div>
      <h4 className="text-md font-semibold text-indigo-600 mb-3">Proposer Details</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Name" hint="From the Quote"><input type="text" readOnly value={d.proposerName} className={ro} /></Field>
        <Field label="DOB" hint="From the Quote"><input type="date" readOnly value={d.proposerDOB} className={ro} /></Field>
        <Field label="Relationship"><input type="text" readOnly value="Self" className={ro} /></Field>
        <Field label="Marital Status" required error={err.tr_maritalStatus}>
          <Select data-field="tr_maritalStatus" options={TRAVEL_MARITAL} value={d.maritalStatus} onChange={(e) => set({ maritalStatus: e.target.value })} className={inputCls(err.tr_maritalStatus)} />
        </Field>
        <Field label="Passport Number" hint="From the Quote"><input type="text" readOnly value={d.passportNumber} className={`${ro} uppercase`} /></Field>
        <FileInput label="Passport Front (Mandatory)" required name="tr_passportFront" value={d.passportFront} error={err.tr_passportFront} onChange={(file) => set({ passportFront: file })} />
        <FileInput label="Passport Back (Mandatory)" required name="tr_passportBack" value={d.passportBack} onChange={(file) => set({ passportBack: file })} />
        <Field label="Aadhaar Number" error={err.tr_aadhaarNumber}>
          <input data-field="tr_aadhaarNumber" type="text" inputMode="numeric" maxLength="12" value={d.aadhaarNumber} onChange={(e) => set({ aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} className={inputCls(err.tr_aadhaarNumber)} />
        </Field>
        <FileInput label="Upload Aadhaar (Not Mandatory)" name="tr_aadhaarFile" value={d.aadhaarFile} onChange={(file) => set({ aadhaarFile: file })} />
        <Field label="Any Additional Cover?" className="sm:col-span-2 lg:col-span-3">
          <div className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 min-h-[38px]">
            {d.additionalCovers === "Required" ? `Required — ${d.addonRemarks}` : d.additionalCovers || "—"}
            {d.plan ? ` · Plan: ${d.plan}` : ""}{d.sumInsured ? ` · Sum Insured: ${sumInsuredLabel(d.sumInsured)}` : ""}
          </div>
        </Field>
        <Field label="Remarks (PED / Treatment)" className="sm:col-span-2 lg:col-span-3">
          <textarea rows="2" value={d.issuanceRemarks} onChange={(e) => set({ issuanceRemarks: e.target.value })} className={inputCls()} />
        </Field>
      </div>
      {(d.companions || []).length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          Also travelling: {d.companions.map((c) => `${c.fullName} (${c.relationship})`).join(", ")}
        </p>
      )}
    </div>
  );
}

export default TravelQuoteSection;
