import { FaPlane, FaPlus, FaTrash } from "react-icons/fa";
import {
  GENDERS, NOMINEE_RELATIONS, Field, FileInput, Select, inputCls, rupeeOptions,
  validateAadhaar, validatePAN, validatePIN, validatePassport, validateMobile, validateEmail,
  addDaysStr, todayStr, fmtDate, stripFiles, hasFile,
} from "./LobShared";

const REGIONS = ["World Wide Including USA and Canada", "World Wide Excluding USA and Canada"];
const SUM_INSURED = [50000, 100000, 200000, 500000, 750000, 1000000].map((n) => ({
  label: `$ ${n.toLocaleString("en-US")}`,
  value: String(n),
}));
const PRODUCTS = [
  "Travel Ace Standard", "Travel Prime Individual Silver", "Travel Elite Silver",
  "Travel Assist Classic", "Travel Companion Care",
];
const RELATIONS = ["Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Other"];

const emptyTraveler = () => ({
  relationship: "", fullName: "", dob: "", sumInsured: "", product: "", addon: "",
  panNumber: "", panFile: null, aadhaarNumber: "", aadhaarFile: null,
  passportNumber: "", passportFile: null,
  pinCode: "", address: "", mobile: "", email: "", gender: "",
  nomineeName: "", nomineeRelation: "", nomineeDOB: "",
});

export const emptyTravel = () => ({
  region: "", journeyStartDate: "", travelDays: "", journeyEndDate: "",
  travelers: [emptyTraveler()],
});

export const hydrateTravel = (s) => {
  if (!s) return emptyTravel();
  return {
    ...emptyTravel(), ...s,
    journeyStartDate: fmtDate(s.journeyStartDate),
    journeyEndDate: fmtDate(s.journeyEndDate),
    travelers: (s.travelers?.length ? s.travelers : [{}]).map((t) => ({
      ...emptyTraveler(), ...t, dob: fmtDate(t.dob), nomineeDOB: fmtDate(t.nomineeDOB),
    })),
  };
};

export const appendTravel = (fd, d) => {
  fd.append("travelDetails", stripFiles(d));
  d.travelers.forEach((t, i) => {
    if (t.panFile instanceof File) fd.append(`travelPan_${i}`, t.panFile);
    if (t.aadhaarFile instanceof File) fd.append(`travelAadhaar_${i}`, t.aadhaarFile);
    if (t.passportFile instanceof File) fd.append(`travelPassport_${i}`, t.passportFile);
  });
};

export const validateTravel = (d) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  if (!d.region) add("tr_region", "Travel: Select the travel region");
  if (!d.journeyStartDate) add("tr_journeyStartDate", "Travel: Journey start date is required");
  if (!d.travelDays || Number(d.travelDays) < 1) add("tr_travelDays", "Travel: No. of travel days is required");

  d.travelers.forEach((t, i) => {
    const p = `tr_t${i}_`;
    const w = `Traveler ${i + 1}: `;
    if (!t.relationship) add(p + "relationship", w + "Relationship is required");
    if (!t.fullName?.trim()) add(p + "fullName", w + "Name as per passport is required");
    if (!t.dob) add(p + "dob", w + "DOB is required");
    else if (t.dob > todayStr()) add(p + "dob", w + "DOB cannot be in the future");
    if (!t.sumInsured) add(p + "sumInsured", w + "Sum Insured is required");
    if (!t.product) add(p + "product", w + "Product is required");
    if (t.panNumber && !validatePAN(t.panNumber)) add(p + "panNumber", w + "PAN format: ABCDE1234F");
    if (t.aadhaarNumber && !validateAadhaar(t.aadhaarNumber)) add(p + "aadhaarNumber", w + "Aadhaar must be exactly 12 digits");
    if (!validatePassport(t.passportNumber)) add(p + "passportNumber", w + "Enter a valid passport number (e.g. A1234567)");
    if (!hasFile(t.passportFile)) add(p + "passportFile", w + "Passport upload is required");
    if (!validatePIN(t.pinCode)) add(p + "pinCode", w + "Enter a valid 6-digit PIN code");
    if (!t.address?.trim()) add(p + "address", w + "Address as per passport is required");
    if (!validateMobile(t.mobile)) add(p + "mobile", w + "Enter a valid 10-digit mobile number");
    if (!validateEmail(t.email)) add(p + "email", w + "Enter a valid email");
    if (!t.gender) add(p + "gender", w + "Gender is required");
    if (!t.nomineeName?.trim()) add(p + "nomineeName", w + "Nominee name is required");
    if (!t.nomineeRelation) add(p + "nomineeRelation", w + "Nominee relation is required");
    if (!t.nomineeDOB) add(p + "nomineeDOB", w + "Nominee DOB is required");
    else if (t.nomineeDOB > todayStr()) add(p + "nomineeDOB", w + "Nominee DOB cannot be in the future");
  });
  return out;
};

// `lead` = the main lead form data (name, mobileNo, email, gender, pinCode) for the "Self" auto-fill
export default function TravelInsuranceForm({ details, setDetails, errors = {}, lead = {} }) {
  const set = (patch) => setDetails((p) => ({ ...p, ...patch }));
  const setJourney = (patch) =>
    setDetails((p) => {
      const n = { ...p, ...patch };
      const days = parseInt(n.travelDays, 10);
      n.journeyEndDate = n.journeyStartDate && days > 0 ? addDaysStr(n.journeyStartDate, days - 1) : "";
      return n;
    });
  const setTraveler = (i, patch) =>
    setDetails((p) => ({ ...p, travelers: p.travelers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }));

  const onRelation = (i, v) => {
    if (v === "Self") {
      setTraveler(i, {
        relationship: v,
        fullName: lead.name || "",
        mobile: lead.mobileNo || "",
        email: lead.email || "",
        gender: lead.gender || "",
        pinCode: lead.pinCode || "",
      });
    } else setTraveler(i, { relationship: v });
  };

  const f = (name) => ({ "data-field": name, className: inputCls(errors[name]) });

  return (
    <div className="border-t-2 border-indigo-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
        <FaPlane /> Travel Insurance Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Travel Region" required error={errors.tr_region} className="lg:col-span-3">
          <Select {...f("tr_region")} value={details.region} options={REGIONS} onChange={(e) => set({ region: e.target.value })} />
        </Field>
        <Field label="Journey Start Date (as per ticket)" required error={errors.tr_journeyStartDate}>
          <input {...f("tr_journeyStartDate")} type="date" value={details.journeyStartDate}
            onChange={(e) => setJourney({ journeyStartDate: e.target.value })} />
        </Field>
        <Field label="No. of Travel Days" required error={errors.tr_travelDays}>
          <input {...f("tr_travelDays")} type="number" min="1" value={details.travelDays}
            onChange={(e) => setJourney({ travelDays: e.target.value })} />
        </Field>
        <Field label="Journey End Date (auto)">
          <input type="date" readOnly value={details.journeyEndDate} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
        </Field>
      </div>

      <h4 className="text-md font-semibold text-indigo-600 mt-6 mb-3">Traveler's Details</h4>
      {details.travelers.map((t, i) => {
        const p = `tr_t${i}_`;
        return (
          <div key={i} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">Traveler {i + 1}</h5>
              {details.travelers.length > 1 && (
                <button type="button" onClick={() => set({ travelers: details.travelers.filter((_, idx) => idx !== i) })}
                  className="text-red-600 text-xs flex items-center gap-1"><FaTrash /> Remove</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Relationship with Proposer" required error={errors[p + "relationship"]}
                hint={t.relationship === "Self" ? "Details filled from the lead" : undefined}>
                <Select {...f(p + "relationship")} value={t.relationship} options={RELATIONS} onChange={(e) => onRelation(i, e.target.value)} />
              </Field>
              <Field label="Name (as per Passport)" required error={errors[p + "fullName"]}>
                <input {...f(p + "fullName")} className={inputCls(errors[p + "fullName"]) + " uppercase"} value={t.fullName}
                  onChange={(e) => setTraveler(i, { fullName: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="DOB" required error={errors[p + "dob"]}>
                <input {...f(p + "dob")} type="date" max={todayStr()} value={t.dob} onChange={(e) => setTraveler(i, { dob: e.target.value })} />
              </Field>
              <Field label="Sum Insured" required error={errors[p + "sumInsured"]}>
                <Select {...f(p + "sumInsured")} value={t.sumInsured} options={SUM_INSURED} onChange={(e) => setTraveler(i, { sumInsured: e.target.value })} />
              </Field>
              <Field label="Select Product" required error={errors[p + "product"]}>
                <Select {...f(p + "product")} value={t.product} options={PRODUCTS} onChange={(e) => setTraveler(i, { product: e.target.value })} />
              </Field>
              <Field label="Add-on (manual)">
                <input className={inputCls(false)} value={t.addon} onChange={(e) => setTraveler(i, { addon: e.target.value })} />
              </Field>
              <Field label="PAN No. (Not Mandatory)" error={errors[p + "panNumber"]}>
                <input {...f(p + "panNumber")} className={inputCls(errors[p + "panNumber"]) + " uppercase"} value={t.panNumber} maxLength={10} placeholder="ABCDE1234F"
                  onChange={(e) => setTraveler(i, { panNumber: e.target.value.toUpperCase().slice(0, 10) })} />
              </Field>
              <FileInput label="Upload PAN (Not Mandatory)" name={p + "panFile"} value={t.panFile} onChange={(file) => setTraveler(i, { panFile: file })} />
              <Field label="Aadhaar No. (Not Mandatory)" error={errors[p + "aadhaarNumber"]}>
                <input {...f(p + "aadhaarNumber")} value={t.aadhaarNumber} maxLength={12} placeholder="12 digits"
                  onChange={(e) => setTraveler(i, { aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} />
              </Field>
              <FileInput label="Upload Aadhaar (Not Mandatory)" name={p + "aadhaarFile"} value={t.aadhaarFile} onChange={(file) => setTraveler(i, { aadhaarFile: file })} />
              <Field label="Passport No." required error={errors[p + "passportNumber"]}>
                <input {...f(p + "passportNumber")} className={inputCls(errors[p + "passportNumber"]) + " uppercase"} value={t.passportNumber} maxLength={8} placeholder="A1234567"
                  onChange={(e) => setTraveler(i, { passportNumber: e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 8) })} />
              </Field>
              <FileInput label="Upload Passport" required name={p + "passportFile"} error={errors[p + "passportFile"]}
                value={t.passportFile} onChange={(file) => setTraveler(i, { passportFile: file })} />
              <Field label="Area PIN Code" required error={errors[p + "pinCode"]}>
                <input {...f(p + "pinCode")} value={t.pinCode} maxLength={6}
                  onChange={(e) => setTraveler(i, { pinCode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
              </Field>
              <Field label="Address (as per Passport)" required error={errors[p + "address"]} className="lg:col-span-2">
                <textarea {...f(p + "address")} rows={2} value={t.address} onChange={(e) => setTraveler(i, { address: e.target.value })} />
              </Field>
              <Field label="Mobile No." required error={errors[p + "mobile"]}>
                <input {...f(p + "mobile")} value={t.mobile} maxLength={10}
                  onChange={(e) => setTraveler(i, { mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
              </Field>
              <Field label="e-Mail ID" required error={errors[p + "email"]}>
                <input {...f(p + "email")} type="email" value={t.email} onChange={(e) => setTraveler(i, { email: e.target.value })} />
              </Field>
              <Field label="Gender" required error={errors[p + "gender"]}>
                <Select {...f(p + "gender")} value={t.gender} options={GENDERS} onChange={(e) => setTraveler(i, { gender: e.target.value })} />
              </Field>
              <Field label="Nominee Name" required error={errors[p + "nomineeName"]}>
                <input {...f(p + "nomineeName")} className={inputCls(errors[p + "nomineeName"]) + " uppercase"} value={t.nomineeName}
                  onChange={(e) => setTraveler(i, { nomineeName: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Nominee Relation with IP" required error={errors[p + "nomineeRelation"]}>
                <Select {...f(p + "nomineeRelation")} value={t.nomineeRelation} options={NOMINEE_RELATIONS} onChange={(e) => setTraveler(i, { nomineeRelation: e.target.value })} />
              </Field>
              <Field label="Nominee DOB" required error={errors[p + "nomineeDOB"]}>
                <input {...f(p + "nomineeDOB")} type="date" max={todayStr()} value={t.nomineeDOB} onChange={(e) => setTraveler(i, { nomineeDOB: e.target.value })} />
              </Field>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={() => set({ travelers: [...details.travelers, emptyTraveler()] })}
        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-100">
        <FaPlus /> Add Traveler
      </button>
    </div>
  );
}