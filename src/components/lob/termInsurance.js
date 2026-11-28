// src/components/lob/termInsurance.js  (logic + constants; the form sections are in TermInsuranceForm.jsx)
// ============================================================
// TERM INSURANCE (TERM BRD) — staged like Health / PA:
//   Quote module           -> <TermQuoteSection>     (Admin + Employee)
//   Policy Issuance module -> <TermIssuanceSection>  (Admin + Employee)
// Quote Work Flow, Payment, EMI Dues, Cashback and Arshyan Profit use the shared modules.
// The Term fields keep the lead's Paying Term / Tenure / Sum Insured in sync, so EMI dues,
// cashback and profit work exactly as for Health.
// ============================================================
import { validateAadhaar, validatePAN, maxAdultDob, fmtDate, stripFiles, hasFile } from "./LobShared";

// ---- option lists (TERM BRD) ----
export const TERM_OCCUPATIONS = ["Salaried", "Self Employed"];
export const TERM_QUALIFICATIONS = ["Matriculation", "Intermediate", "UG", "Graduate", "PG", "PhD", "Above PhD"];
export const TERM_COVER_TILL_AGES = Array.from({ length: 40 }, (_, i) => String(60 + i)); // 60 … 99
export const TERM_CUSTOM_SI = "Custom SI";
export const TERM_LIFE_COVERS = ["20 L", "25 L", "30 L", "35 L", "40 L", "45 L", "50 L", "60 L", "70 L", "80 L", "90 L", "1 CR", TERM_CUSTOM_SI];
export const TERM_PAY_TILL_COVER = "Pay till Age Covered";
export const TERM_PAYING_TERMS = ["One Time", "5 Years", "10 Years", "15 Years", TERM_PAY_TILL_COVER];
export const TERM_PREMIUM_MODES = ["Monthly", "Quarterly", "Half Yearly", "Yearly"];
export const TERM_MARITAL = ["Married", "Unmarried", "Live-in Relationship", "Widow", "Divorcee"];
export const TERM_NOMINEE_RELATIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"];
export const CHILD_COUNTS = Array.from({ length: 6 }, (_, i) => String(i));
const PREMIUMS_PER_YEAR = { Monthly: 12, Quarterly: 4, "Half Yearly": 2, Yearly: 1 };

// ============================================================
// CALCULATIONS (pure — also used by tests)
// ============================================================
/** Age in completed years on `asOf` (YYYY-MM-DD strings) */
export const ageOn = (dob, asOf = new Date().toISOString().slice(0, 10)) => {
  if (!dob) return null;
  const [y, m, d] = String(dob).slice(0, 10).split("-").map(Number);
  const [Y, M, D] = String(asOf).slice(0, 10).split("-").map(Number);
  if (!y || !Y) return null;
  return Y - y - (M < m || (M === m && D < d) ? 1 : 0);
};
/** "50 L" -> 5000000, "1 CR" -> 10000000, Custom SI -> the typed amount */
export const lifeCoverAmount = (d = {}) => {
  if (d.lifeCover === TERM_CUSTOM_SI) return Number(d.customLifeCover) || 0;
  const m = String(d.lifeCover || "").match(/^([\d.]+)\s*(L|CR)$/i);
  if (!m) return 0;
  return Math.round(Number(m[1]) * (m[2].toUpperCase() === "CR" ? 10000000 : 100000));
};
export const lifeCoverLabel = (d = {}) =>
  d.lifeCover === TERM_CUSTOM_SI ? (Number(d.customLifeCover) > 0 ? `₹${Number(d.customLifeCover).toLocaleString("en-IN")}` : "") : d.lifeCover || "";

/**
 * Covered Age   = Cover Till Age − current age   (the policy term, in years)
 * Paying years  = 5 / 10 / 15, or the covered years ("Pay till Age Covered"); One Time = a single premium
 * Premium count = paying years × premiums per year (by Premium Paying Mode)
 */
export const computeTerm = (d = {}, asOf) => {
  const age = ageOn(d.proposerDOB, asOf);
  const tillAge = Number(d.coverTillAge) || 0;
  const coveredYears = age !== null && tillAge ? tillAge - age : null;
  const oneTime = d.payingTerm === "One Time";
  let payingYears = null;
  if (oneTime) payingYears = 0;
  else if (d.payingTerm === TERM_PAY_TILL_COVER) payingYears = coveredYears;
  else if (/^\d+ Years$/.test(d.payingTerm || "")) payingYears = parseInt(d.payingTerm, 10);
  const perYear = PREMIUMS_PER_YEAR[d.premiumMode] || 0;
  const premiumCount = oneTime ? 1 : payingYears > 0 && perYear ? payingYears * perYear : null;
  return { age, coveredYears, oneTime, payingYears, premiumCount, sumInsured: lifeCoverAmount(d) };
};
/** Lead-level copies the shared modules read (EMI dues, cashback, profit, lists, reports) */
export const termLeadFields = (d = {}, asOf) => {
  const c = computeTerm(d, asOf);
  return {
    paymentTerm: c.oneTime ? "One Time" : d.premiumMode || "",
    policyTenure: c.oneTime ? (c.coveredYears > 0 ? `${c.coveredYears} Years` : "") : c.payingYears > 0 ? `${c.payingYears} Years` : "",
    sumInsured: lifeCoverLabel(d),
  };
};
/** Policy Expiry = Policy Start + Covered years − 1 day */
export const termExpiryDate = (startDate, d = {}) => {
  const c = computeTerm(d);
  if (!startDate || !(c.coveredYears > 0)) return "";
  const x = new Date(`${String(startDate).slice(0, 10)}T00:00:00Z`);
  x.setUTCFullYear(x.getUTCFullYear() + c.coveredYears);
  x.setUTCDate(x.getUTCDate() - 1);
  return x.toISOString().slice(0, 10);
};

// ============================================================
// STATE
// ============================================================
export const emptyTerm = () => ({
  // Quote
  proposerName: "", proposerDOB: "", occupation: "", qualification: "", annualIncome: "", tobacco: "",
  coverTillAge: "", lifeCover: "", customLifeCover: "", payingTerm: "", premiumMode: "",
  organisationName: "", designation: "", fatherSpouseName: "", motherName: "", pedRemarks: "",
  // Policy Issuance
  maritalStatus: "", sons: "", daughters: "",
  nomineeName: "", nomineeDOB: "", nomineeRelation: "", nomineeAadhaarFile: null,
  height: "", weight: "", aadhaarNumber: "", aadhaarFile: null, panNumber: "", panFile: null,
  salarySlipFile: null, bankStatementFile: null, itrFile: null, issuanceRemarks: "",
});
const str = (v) => (v === null || v === undefined ? "" : String(v));
export const hydrateTerm = (s, leadName = "") => {
  const base = { ...emptyTerm(), ...(s || {}) };
  return {
    ...base,
    proposerName: base.proposerName || leadName,
    proposerDOB: fmtDate(base.proposerDOB), nomineeDOB: fmtDate(base.nomineeDOB),
    annualIncome: str(base.annualIncome), coverTillAge: str(base.coverTillAge), customLifeCover: str(base.customLifeCover),
    sons: str(base.sons), daughters: str(base.daughters), weight: str(base.weight),
  };
};
/** Adds termDetails JSON + files to the FormData */
export const appendTerm = (fd, d) => {
  fd.append("termDetails", stripFiles(d));
  [["nomineeAadhaarFile", "termNomineeAadhaarFile"], ["aadhaarFile", "termAadhaarFile"], ["panFile", "termPanFile"],
    ["salarySlipFile", "termSalarySlipFile"], ["bankStatementFile", "termBankStatementFile"], ["itrFile", "termItrFile"]]
    .forEach(([k, field]) => { if (d[k] instanceof File) fd.append(field, d[k]); });
};
/** Documents section */
export const termDocuments = (d = {}) => [
  ["Nominee Aadhaar", d.nomineeAadhaarFile], ["Proposer Aadhaar", d.aadhaarFile], ["Proposer PAN", d.panFile],
  ["Salary Slips (last 3 months)", d.salarySlipFile], ["Bank Statement (last 3 months)", d.bankStatementFile], ["ITR Copy", d.itrFile],
].filter(([, v]) => typeof v === "string" && v);

// ============================================================
// VALIDATION
// ============================================================
const isPdf = (v) => !(v instanceof File) || /\.pdf$/i.test(v.name) || v.type === "application/pdf";
const isImageOrPdf = (v) => !(v instanceof File) || /\.(pdf|jpe?g)$/i.test(v.name);

/** Quote module */
export const validateTerm = (d = {}) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  const c = computeTerm(d);
  if (!String(d.proposerName || "").trim()) add("term_proposerName", "Term: Proposer Name is required");
  if (!d.proposerDOB) add("term_proposerDOB", "Term: Proposer DOB is required (Covered Age is calculated from it)");
  else if (d.proposerDOB > maxAdultDob()) add("term_proposerDOB", "Term: Proposer must be at least 18 years old");
  if (!d.occupation) add("term_occupation", "Term: Select your Occupation");
  if (!d.qualification) add("term_qualification", "Term: Qualification is required");
  if (!(Number(d.annualIncome) > 0)) add("term_annualIncome", "Term: Annual Income is required");
  if (!d.tobacco) add("term_tobacco", "Term: Do you smoke or chew tobacco? (Yes / No)");
  if (!d.coverTillAge) add("term_coverTillAge", "Term: Cover Till Age is required");
  else if (c.coveredYears !== null && c.coveredYears < 5) add("term_coverTillAge", `Term: Cover Till Age must be at least 5 years more than the current age (${c.age})`);
  if (!d.lifeCover) add("term_lifeCover", "Term: Life Cover / Sum Insured is required");
  else if (d.lifeCover === TERM_CUSTOM_SI && !(Number(d.customLifeCover) > 0)) add("term_customLifeCover", "Term: Enter the custom Sum Insured");
  if (!d.payingTerm) add("term_payingTerm", "Term: Paying Term is required");
  else if (!c.oneTime && c.payingYears && c.coveredYears !== null && c.payingYears > c.coveredYears) add("term_payingTerm", `Term: Paying Term (${c.payingYears} years) can't be longer than the cover (${c.coveredYears} years)`);
  if (d.payingTerm && !c.oneTime && !d.premiumMode) add("term_premiumMode", "Term: Premium Paying Mode is required");
  if (!String(d.organisationName || "").trim()) add("term_organisationName", "Term: Organisation Name is required");
  if (!String(d.designation || "").trim()) add("term_designation", "Term: Designation / Post is required");
  if (!String(d.fatherSpouseName || "").trim()) add("term_fatherSpouseName", "Term: Father's / Spouse Name is required");
  if (!String(d.motherName || "").trim()) add("term_motherName", "Term: Mother's Name is required");
  return out;
};

/** Policy Issuance module */
export const validateTermIssuance = (d = {}) => {
  const out = [];
  const add = (field, message) => out.push({ field, message });
  if (!d.maritalStatus) add("term_maritalStatus", "Term: Marital Status is required");
  if (d.maritalStatus === "Married") {
    if (d.sons === "") add("term_sons", "Term: Number of sons (0 if none)");
    if (d.daughters === "") add("term_daughters", "Term: Number of daughters (0 if none)");
  }
  if (!String(d.nomineeName || "").trim()) add("term_nomineeName", "Term: Nominee Name is required");
  if (!d.nomineeDOB) add("term_nomineeDOB", "Term: Nominee DOB is required");
  if (!d.nomineeRelation) add("term_nomineeRelation", "Term: Relationship with Nominee is required");
  if (!hasFile(d.nomineeAadhaarFile)) add("term_nomineeAadhaarFile", "Term: Upload the Nominee's Aadhaar");
  else if (!isImageOrPdf(d.nomineeAadhaarFile)) add("term_nomineeAadhaarFile", "Term: Nominee Aadhaar must be JPG, JPEG or PDF");
  if (!String(d.height || "").trim()) add("term_height", "Term: Height is required");
  if (!(Number(d.weight) > 0)) add("term_weight", "Term: Weight is required");
  if (!d.aadhaarNumber) add("term_aadhaarNumber", "Term: Aadhaar Number is required");
  else if (!validateAadhaar(d.aadhaarNumber)) add("term_aadhaarNumber", "Term: Aadhaar must be exactly 12 digits");
  if (!hasFile(d.aadhaarFile)) add("term_aadhaarFile", "Term: Upload Aadhaar (mandatory)");
  if (!d.panNumber) add("term_panNumber", "Term: PAN Number is required");
  else if (!validatePAN(d.panNumber)) add("term_panNumber", "Term: PAN format ABCDE1234F");
  if (!hasFile(d.panFile)) add("term_panFile", "Term: Upload PAN");
  if (d.occupation === "Salaried" && !hasFile(d.salarySlipFile)) add("term_salarySlipFile", "Term: Upload the last 3 months' Salary Slips (PDF)");
  if (!isPdf(d.salarySlipFile)) add("term_salarySlipFile", "Term: Salary Slips must be a PDF");
  if (!hasFile(d.bankStatementFile)) add("term_bankStatementFile", "Term: Upload the last 3 months' Bank Statement (PDF)");
  else if (!isPdf(d.bankStatementFile)) add("term_bankStatementFile", "Term: Bank Statement must be a PDF");
  if (!isPdf(d.itrFile)) add("term_itrFile", "Term: ITR Copy must be a PDF");
  return out;
};
