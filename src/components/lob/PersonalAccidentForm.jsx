import { useState } from "react";
import { FaShieldAlt, FaPlus, FaTrash } from "react-icons/fa";
import {
  YES_NO, GENDERS, MARITAL, QUALIFICATIONS, OCCUPATIONS, NOMINEE_RELATIONS, TENURES,
  Field, FileInput, Select, inputCls, inr, rupeeOptions, range,
  validateAadhaar, validatePAN, validatePIN, fetchPinInfo, addYearsStr,
  maxAdultDob, todayStr, fmtDate, stripFiles, hasFile,
} from "./LobShared";

const HEALTH_PRIME = [
  ...Array.from({ length: 8 }, (_, i) => `Individual Option ${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `Floater Option ${i + 1}`),
];

const COVERS = [
  { key: "accidentalHospitalization", label: "Accidental Hospitalization Expenses", type: "select", options: rupeeOptions(range(200000, 2500000, 100000)) },
  { key: "adventureSports", label: "Adventure Sports Benefit (Death)", type: "number" },
  { key: "airAmbulance", label: "Air Ambulance Cover", type: "select", options: rupeeOptions([500000, 1000000, 1500000, 2000000, 2500000]) },
  { key: "coma", label: "COMA due to Accidental Bodily Injury", type: "select", options: rupeeOptions(range(100000, 1000000, 100000)) },
  { key: "fractureCare", label: "Fracture Care", type: "select", options: rupeeOptions([50000, 75000, 100000, 200000, 300000, 400000, 500000]) },
  { key: "roadAmbulance", label: "Road Ambulance Cover", type: "fixed", value: 25000 },
  { key: "healthPrime", label: "Health Prime Rider", type: "select", options: HEALTH_PRIME },
  { key: "hospitalCash", label: "Hospital Cash Benefit", type: "select", options: rupeeOptions(range(1000, 10000, 1000)) },
  { key: "lossOfIncome", label: "Loss of Income due to Disability from Accident", type: "select", options: rupeeOptions(range(1000, 50000, 1000)) },
  { key: "travelExpenses", label: "Travel Expenses Benefit", type: "fixed", value: 25000 },
];

const emptyMember = () => ({
  fullName: "", dob: "", grossMonthlyIncome: "", occupation: "",
  deathSI: "", ppdSI: "", ptdSI: "",
  wantAdditionalCover: "", covers: {},
  gender: "", height: "", weight: "",
  aadhaarNumber: "", aadhaarFront: null, aadhaarBack: null,
  panNumber: "", panFile: null, maritalStatus: "", qualification: "",
  nomineeName: "", nomineeDOB: "", nomineeRelation: "",
  hasPED: "", pedDetails: "",
});

export const emptyPA = () => ({
  policyCase: "",
  insurerName: "", policyStartDate: "", policyTenure: "", policyEndDate: "",
  prevInsurerName: "", prevPolicyNumber: "", prevPolicyDueDate: "", prevPolicyFile: null,
  pinCode: "", city: "", state: "", address: "", familyIncome: "",
  members: [emptyMember()],
});

// Use when loading a saved lead into the edit form
export const hydratePA = (s) => {
  if (!s) return emptyPA();
  return {
    ...emptyPA(), ...s,
    policyStartDate: fmtDate(s.policyStartDate),
    policyEndDate: fmtDate(s.policyEndDate),
    prevPolicyDueDate: fmtDate(s.prevPolicyDueDate),
    members: (s.members?.length ? s.members : [{}]).map((m) => ({
      ...emptyMember(), ...m,
      dob: fmtDate(m.dob), nomineeDOB: fmtDate(m.nomineeDOB), covers: m.covers || {},
    })),
  };
};

// Adds paDetails JSON + files to a FormData
export const appendPA = (fd, d) => {
  fd.append("paDetails", stripFiles(d));
  if (d.prevPolicyFile instanceof File) fd.append("paPrevPolicyFile", d.prevPolicyFile);
  d.members.forEach((m, i) => {
    if (m.aadhaarFront instanceof File) fd.append(`paAadhaarFront_${i}`, m.aadhaarFront);
    if (m.aadhaarBack instanceof File) fd.append(`paAadhaarBack_${i}`, m.aadhaarBack);
    if (m.panFile instanceof File) fd.append(`paPan_${i}`, m.panFile);
  });
};

export const validatePA = (d) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });

  if (!d.policyCase) add("pa_policyCase", "PA: Select New / Portability / Renew");
  if (d.policyCase === "New") {
    if (!d.insurerName) add("pa_insurerName", "PA: Insurer is required");
    if (!d.policyStartDate) add("pa_policyStartDate", "PA: Policy Start Date is required");
    if (!d.policyTenure) add("pa_policyTenure", "PA: Policy Tenure is required");
  } else if (d.policyCase) {
    if (!d.prevInsurerName) add("pa_prevInsurerName", "PA: Previous Insurer is required");
    if (!d.prevPolicyNumber) add("pa_prevPolicyNumber", "PA: Previous Policy No. is required");
    if (!d.prevPolicyDueDate) add("pa_prevPolicyDueDate", "PA: Policy Due Date is required");
  }
  if (!validatePIN(d.pinCode)) add("pa_pinCode", "PA: Enter a valid 6-digit PIN code");
  if (!d.address?.trim()) add("pa_address", "PA: Complete address (as per Aadhaar) is required");
  if (!d.familyIncome) add("pa_familyIncome", "PA: Family Income is required");

  d.members.forEach((m, i) => {
    const p = `pa_m${i}_`;
    const w = `PA Member ${i + 1}: `;
    if (!m.fullName?.trim()) add(p + "fullName", w + "Full name is required");
    if (!m.dob) add(p + "dob", w + "DOB is required");
    else if (m.dob > maxAdultDob()) add(p + "dob", w + "must be at least 18 years old");
    if (!m.grossMonthlyIncome) add(p + "grossMonthlyIncome", w + "Gross monthly income is required");
    if (!m.occupation) add(p + "occupation", w + "Occupation is required");
    if (!m.deathSI) add(p + "deathSI", w + "Death Sum Insured is required");
    if (!m.ppdSI) add(p + "ppdSI", w + "Permanent Partial Disability SI is required");
    if (!m.ptdSI) add(p + "ptdSI", w + "Permanent Total Disability SI is required");
    if (!m.wantAdditionalCover) add(p + "wantAdditionalCover", w + "Select whether additional cover is needed");
    if (m.wantAdditionalCover === "Yes") {
      const picked = COVERS.filter((c) => m.covers?.[c.key]?.selected);
      if (!picked.length) add(p + "wantAdditionalCover", w + "Select at least one additional cover");
      picked.forEach((c) => {
        if (!m.covers[c.key].value) add(p + "covers", `${w}${c.label}: value is required`);
      });
    }
    if (!m.gender) add(p + "gender", w + "Gender is required");
    if (!m.height) add(p + "height", w + "Height is required");
    if (!m.weight) add(p + "weight", w + "Weight is required");
    if (!validateAadhaar(m.aadhaarNumber)) add(p + "aadhaarNumber", w + "Aadhaar must be exactly 12 digits");
    if (!hasFile(m.aadhaarFront)) add(p + "aadhaarFront", w + "Aadhaar front is required");
    if (!hasFile(m.aadhaarBack)) add(p + "aadhaarBack", w + "Aadhaar back is required");
    if (!validatePAN(m.panNumber)) add(p + "panNumber", w + "PAN format: ABCDE1234F");
    if (!hasFile(m.panFile)) add(p + "panFile", w + "PAN upload is required");
    if (!m.maritalStatus) add(p + "maritalStatus", w + "Marital status is required");
    if (!m.qualification) add(p + "qualification", w + "Qualification is required");
    if (!m.nomineeName?.trim()) add(p + "nomineeName", w + "Nominee name is required");
    if (!m.nomineeDOB) add(p + "nomineeDOB", w + "Nominee DOB is required");
    else if (m.nomineeDOB > todayStr()) add(p + "nomineeDOB", w + "Nominee DOB cannot be in the future");
    if (!m.nomineeRelation) add(p + "nomineeRelation", w + "Nominee relation is required");
    if (!m.hasPED) add(p + "hasPED", w + "Select Pre-Existing Disability Yes/No");
    if (m.hasPED === "Yes" && !m.pedDetails?.trim()) add(p + "pedDetails", w + "Enter PED details");
  });
  return out;
};

export default function PersonalAccidentForm({ details, setDetails, errors = {}, insurerOptions = [] }) {
  const [pinMsg, setPinMsg] = useState("");
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const setMember = (i, patch) =>
    setDetails((p) => ({ ...p, members: p.members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) }));

  const setPolicy = (patch) =>
    setDetails((p) => {
      const n = { ...p, ...patch };
      n.policyEndDate =
        n.policyStartDate && n.policyTenure ? addYearsStr(n.policyStartDate, parseInt(n.policyTenure, 10)) : "";
      return n;
    });

  const onPin = async (raw) => {
    const val = raw.replace(/\D/g, "").slice(0, 6);
    set({ pinCode: val, ...(val.length < 6 ? { city: "", state: "" } : {}) });
    setPinMsg("");
    if (val.length === 6) {
      const info = await fetchPinInfo(val);
      if (info) set(info);
      else { set({ city: "", state: "" }); setPinMsg("Invalid PIN code"); }
    }
  };

  const setCover = (i, c, patch) =>
    setMember(i, {
      covers: { ...details.members[i].covers, [c.key]: { ...(details.members[i].covers?.[c.key] || {}), ...patch } },
    });

  const f = (name) => ({ "data-field": name, className: inputCls(errors[name]) });

  return (
    <div className="border-t-2 border-indigo-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
        <FaShieldAlt /> Personal Accident Details
      </h3>

      {/* Policy case */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Policy Type" required error={errors.pa_policyCase}>
          <Select {...f("pa_policyCase")} value={details.policyCase} options={["New", "Portability", "Renew"]}
            onChange={(e) => set({ policyCase: e.target.value })} />
        </Field>

        {details.policyCase === "New" && (
          <>
            <Field label="Insurer" required error={errors.pa_insurerName}>
              <Select {...f("pa_insurerName")} value={details.insurerName} options={insurerOptions}
                onChange={(e) => set({ insurerName: e.target.value })} />
            </Field>
            <Field label="Policy Start Date" required error={errors.pa_policyStartDate}>
              <input {...f("pa_policyStartDate")} type="date" value={details.policyStartDate}
                onChange={(e) => setPolicy({ policyStartDate: e.target.value })} />
            </Field>
            <Field label="Policy Tenure" required error={errors.pa_policyTenure}>
              <Select {...f("pa_policyTenure")} value={details.policyTenure} options={TENURES}
                onChange={(e) => setPolicy({ policyTenure: e.target.value })} />
            </Field>
            <Field label="Policy End Date (auto)">
              <input type="date" readOnly value={details.policyEndDate} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
            </Field>
          </>
        )}

        {(details.policyCase === "Portability" || details.policyCase === "Renew") && (
          <>
            <Field label="Previous Insurer" required error={errors.pa_prevInsurerName}>
              <Select {...f("pa_prevInsurerName")} value={details.prevInsurerName} options={insurerOptions}
                onChange={(e) => set({ prevInsurerName: e.target.value })} />
            </Field>
            <Field label="Previous Policy No." required error={errors.pa_prevPolicyNumber}>
              <input {...f("pa_prevPolicyNumber")} value={details.prevPolicyNumber}
                onChange={(e) => set({ prevPolicyNumber: e.target.value })} />
            </Field>
            <Field label="Policy Due Date" required error={errors.pa_prevPolicyDueDate}>
              <input {...f("pa_prevPolicyDueDate")} type="date" value={details.prevPolicyDueDate}
                onChange={(e) => set({ prevPolicyDueDate: e.target.value })} />
            </Field>
            <FileInput label="Upload Previous Policy (Not Mandatory)" name="pa_prevPolicyFile"
              value={details.prevPolicyFile} onChange={(file) => set({ prevPolicyFile: file })} accept=".pdf" />
          </>
        )}
      </div>

      {/* Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Field label="Area PIN Code" required error={errors.pa_pinCode || pinMsg}>
          <input {...f("pa_pinCode")} value={details.pinCode} maxLength={6} onChange={(e) => onPin(e.target.value)} placeholder="6 digit PIN" />
        </Field>
        <Field label="City"><input readOnly value={details.city} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50" /></Field>
        <Field label="State"><input readOnly value={details.state} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50" /></Field>
        <Field label="Complete Address (as per Aadhaar)" required error={errors.pa_address} className="lg:col-span-2">
          <textarea {...f("pa_address")} rows={2} value={details.address} onChange={(e) => set({ address: e.target.value })} />
        </Field>
        <Field label="Family Income (₹)" required error={errors.pa_familyIncome}>
          <input {...f("pa_familyIncome")} type="number" min="0" value={details.familyIncome}
            onChange={(e) => set({ familyIncome: e.target.value })} />
        </Field>
      </div>

      {/* Members */}
      <h4 className="text-md font-semibold text-indigo-600 mt-6 mb-3">Members</h4>
      {details.members.map((m, i) => {
        const p = `pa_m${i}_`;
        return (
          <div key={i} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">Member {i + 1}</h5>
              {details.members.length > 1 && (
                <button type="button" onClick={() => set({ members: details.members.filter((_, idx) => idx !== i) })}
                  className="text-red-600 text-xs flex items-center gap-1"><FaTrash /> Remove</button>
              )}
            </div>

            <p className="text-xs font-semibold text-gray-600 mb-2">Member Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Full Name (as per Aadhaar)" required error={errors[p + "fullName"]}>
                <input {...f(p + "fullName")} className={inputCls(errors[p + "fullName"]) + " uppercase"} value={m.fullName}
                  onChange={(e) => setMember(i, { fullName: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="DOB (min. 18 years)" required error={errors[p + "dob"]}>
                <input {...f(p + "dob")} type="date" max={maxAdultDob()} value={m.dob} onChange={(e) => setMember(i, { dob: e.target.value })} />
              </Field>
              <Field label="Gross Monthly Income (₹)" required error={errors[p + "grossMonthlyIncome"]}>
                <input {...f(p + "grossMonthlyIncome")} type="number" min="0" value={m.grossMonthlyIncome}
                  onChange={(e) => setMember(i, { grossMonthlyIncome: e.target.value })} />
              </Field>
              <Field label="Occupation" required error={errors[p + "occupation"]}>
                <Select {...f(p + "occupation")} value={m.occupation} options={OCCUPATIONS} onChange={(e) => setMember(i, { occupation: e.target.value })} />
              </Field>
              <Field label="Death Sum Insured (₹)" required error={errors[p + "deathSI"]}>
                <input {...f(p + "deathSI")} type="number" min="0" value={m.deathSI} onChange={(e) => setMember(i, { deathSI: e.target.value })} />
              </Field>
              <Field label="Permanent Partial Disability SI (₹)" required error={errors[p + "ppdSI"]}>
                <input {...f(p + "ppdSI")} type="number" min="0" value={m.ppdSI} onChange={(e) => setMember(i, { ppdSI: e.target.value })} />
              </Field>
              <Field label="Permanent Total Disability SI (₹)" required error={errors[p + "ptdSI"]}>
                <input {...f(p + "ptdSI")} type="number" min="0" value={m.ptdSI} onChange={(e) => setMember(i, { ptdSI: e.target.value })} />
              </Field>
              <Field label="Do you want any additional cover?" required error={errors[p + "wantAdditionalCover"]}>
                <Select {...f(p + "wantAdditionalCover")} value={m.wantAdditionalCover} options={YES_NO}
                  onChange={(e) => setMember(i, { wantAdditionalCover: e.target.value, ...(e.target.value === "No" ? { covers: {} } : {}) })} />
              </Field>
            </div>

            {m.wantAdditionalCover === "Yes" && (
              <div data-field={p + "covers"} className="mt-3 border rounded-lg p-3 bg-white">
                <p className="text-xs font-semibold text-pink-600 mb-2">Additional Covers</p>
                {errors[p + "covers"] && <p className="text-red-500 text-xs mb-2">{errors[p + "covers"]}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COVERS.map((c) => {
                    const cv = m.covers?.[c.key] || {};
                    return (
                      <div key={c.key} className="border rounded p-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                          <input type="checkbox" checked={!!cv.selected}
                            onChange={(e) =>
                              setCover(i, c, {
                                selected: e.target.checked,
                                value: e.target.checked ? (c.type === "fixed" ? String(c.value) : cv.value || "") : "",
                              })} />
                          {c.label}
                        </label>
                        {cv.selected && c.type === "fixed" && <p className="text-xs text-green-700 mt-1">{inr(c.value)} (auto)</p>}
                        {cv.selected && c.type === "number" && (
                          <input type="number" min="0" placeholder="Enter amount (₹)" value={cv.value || ""}
                            onChange={(e) => setCover(i, c, { value: e.target.value })} className={inputCls(false) + " mt-1"} />
                        )}
                        {cv.selected && c.type === "select" && (
                          <Select value={cv.value || ""} options={c.options} onChange={(e) => setCover(i, c, { value: e.target.value })}
                            className={inputCls(false) + " mt-1"} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">IP Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Gender" required error={errors[p + "gender"]}>
                <Select {...f(p + "gender")} value={m.gender} options={GENDERS} onChange={(e) => setMember(i, { gender: e.target.value })} />
              </Field>
              <Field label="Height" required error={errors[p + "height"]}>
                <input {...f(p + "height")} value={m.height} placeholder={`e.g. 5'8"`} onChange={(e) => setMember(i, { height: e.target.value })} />
              </Field>
              <Field label="Weight (kg)" required error={errors[p + "weight"]}>
                <input {...f(p + "weight")} type="number" min="0" value={m.weight} onChange={(e) => setMember(i, { weight: e.target.value })} />
              </Field>
              <Field label="Aadhaar No." required error={errors[p + "aadhaarNumber"]}>
                <input {...f(p + "aadhaarNumber")} value={m.aadhaarNumber} maxLength={12} placeholder="12 digits"
                  onChange={(e) => setMember(i, { aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} />
              </Field>
              <FileInput label="Upload Aadhaar - Front" required name={p + "aadhaarFront"} error={errors[p + "aadhaarFront"]}
                value={m.aadhaarFront} onChange={(file) => setMember(i, { aadhaarFront: file })} />
              <FileInput label="Upload Aadhaar - Back" required name={p + "aadhaarBack"} error={errors[p + "aadhaarBack"]}
                value={m.aadhaarBack} onChange={(file) => setMember(i, { aadhaarBack: file })} />
              <Field label="PAN No." required error={errors[p + "panNumber"]}>
                <input {...f(p + "panNumber")} className={inputCls(errors[p + "panNumber"]) + " uppercase"} value={m.panNumber} maxLength={10} placeholder="ABCDE1234F"
                  onChange={(e) => setMember(i, { panNumber: e.target.value.toUpperCase().slice(0, 10) })} />
              </Field>
              <FileInput label="Upload PAN" required name={p + "panFile"} error={errors[p + "panFile"]}
                value={m.panFile} onChange={(file) => setMember(i, { panFile: file })} />
              <Field label="Marital Status" required error={errors[p + "maritalStatus"]}>
                <Select {...f(p + "maritalStatus")} value={m.maritalStatus} options={MARITAL} onChange={(e) => setMember(i, { maritalStatus: e.target.value })} />
              </Field>
              <Field label="Educational Qualification" required error={errors[p + "qualification"]}>
                <Select {...f(p + "qualification")} value={m.qualification} options={QUALIFICATIONS} onChange={(e) => setMember(i, { qualification: e.target.value })} />
              </Field>
            </div>

            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">Nominee Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Nominee Full Name (as per Aadhaar)" required error={errors[p + "nomineeName"]}>
                <input {...f(p + "nomineeName")} className={inputCls(errors[p + "nomineeName"]) + " uppercase"} value={m.nomineeName}
                  onChange={(e) => setMember(i, { nomineeName: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Nominee DOB" required error={errors[p + "nomineeDOB"]}>
                <input {...f(p + "nomineeDOB")} type="date" max={todayStr()} value={m.nomineeDOB} onChange={(e) => setMember(i, { nomineeDOB: e.target.value })} />
              </Field>
              <Field label="Relation" required error={errors[p + "nomineeRelation"]}>
                <Select {...f(p + "nomineeRelation")} value={m.nomineeRelation} options={NOMINEE_RELATIONS} onChange={(e) => setMember(i, { nomineeRelation: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <Field label="Do you have any Pre-Existing Disability?" required error={errors[p + "hasPED"]}>
                <Select {...f(p + "hasPED")} value={m.hasPED} options={YES_NO}
                  onChange={(e) => setMember(i, { hasPED: e.target.value, ...(e.target.value === "No" ? { pedDetails: "" } : {}) })} />
              </Field>
              {m.hasPED === "Yes" && (
                <Field label="PED Details" required error={errors[p + "pedDetails"]} className="lg:col-span-2">
                  <textarea {...f(p + "pedDetails")} rows={2} value={m.pedDetails} onChange={(e) => setMember(i, { pedDetails: e.target.value })} />
                </Field>
              )}
            </div>
          </div>
        );
      })}

      <button type="button" onClick={() => set({ members: [...details.members, emptyMember()] })}
        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-100">
        <FaPlus /> Add Member
      </button>
    </div>
  );
}