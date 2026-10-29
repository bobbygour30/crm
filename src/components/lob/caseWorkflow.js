// src/lob/caseWorkflow.js
// ============================================================
// Single source of truth for the staged lead workflow (BRD: HEALTH sheet),
// shared by LeadTable.jsx and EmployeeLeads.jsx through useLeadCase.js.
//
//   Lead -> Quote -> Quote Workflow -> Policy Issuance -> Payment
//        -> EMI Dues (only if Paying Term is not One Time)
//        -> Cashback / PayOut -> Arshyan Profit        (+ Documents list)
//
// Everything in this file is plain JavaScript (no React) so it can be tested.
// ============================================================
import {
  isMotorLob, validateMotorPayout, computeMotorPayout, OTHER_MANUFACTURER, MOTOR_ISSUANCE_STATUS_OPTIONS,
  PREVIOUS_POLICY_ACTIVE, PREVIOUS_POLICY_NOT_ACTIVE, NO_ADDON,
} from "./motorInsurance";
import {
  MOBILE_LOB, MOBILE_INSURERS, getChartPremium, checkPurchaseDate, usesImei, computeMobileProfit, MOBILE_MIN_PHOTOS,
  composeMakeModel, productForInsurer,
} from "./mobileInsurance";

// ============================================================
// CONSTANTS
// ============================================================
// Motor BRD: LOB "Motor Insurance" -> Vehicle Type -> Policy Type (Brand New / SAOD / Comprehensive / TP).
// The older per-vehicle motor LOBs are no longer offered; leads saved with them still open
// (their vehicle + policy type are worked out by motorDefaultsFromLob).
export const LEGACY_MOBILE_LOBS = ["Mobile/Electronic Equipment Insurance"];
export const PA_LOB = "Personal Accident (PA)";
export const LEGACY_PA_LOBS = ["PERSONAL ACCIDENT"];
export const LEGACY_MOTOR_LOBS = [
  "Private Car-OD", "Private Car-SOD", "Private Car-Comprehensive", "Private Car-TP",
  "Taxi-Comprehensive", "Taxi-TP", "Commercial Vehicle-Comprehensive", "Commercial Vehicle-TP",
  "E-Rikshaw-TP", "E-Rikshaw-Comprehensive", "Two-Wheeler-TP", "New Vehicle Insurance", "New Two Wheeler Insurance",
];
export const LOB_OPTIONS = [
  "Health Insurance", "Motor Insurance", MOBILE_LOB, "My Home",
  "Mediclaim Health Insurance", "Bharat Sookshma Udyam Suraksha", "Bharat Laghu Udyam Suraksha",
  "Bharat Grih Raksha", "Burglary", "MARINE-OPEN", "MARINE-SPECIFIC", "MARINE-STOP",
  PA_LOB, "Employee Compensation", "Group Health Insurance", "Terms Insurance",
  "Ulip Plan", "Traditional Plan", "Travel Insurance", "Other Insurance",
];
export const SOURCE_OPTIONS = ["Employee", "Channel Partner", "Direct Client", "Social Media", "Store", "Other"];
export const GENDER_OPTIONS = ["Male", "Female", "Other"];
export const POLICY_TYPE_OPTIONS = ["Individual", "Floater"];
export const QUALIFICATION_OPTIONS = ["10th", "12th", "Graduate", "Post Graduate", "Professional", "Other"];
export const OCCUPATION_OPTIONS = ["Salaried", "Business", "Professional", "Student", "Retired", "Housewife", "Other"];
export const RELATIONSHIP_OPTIONS = ["Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Other"];
export const YES_NO_OPTIONS = ["Yes", "No"];
export const NCB_OPTIONS = ["0%", "20%", "25%", "35%", "45%", "50%"];
export const VEHICLE_TYPE_OPTIONS = ["Two Wheeler", "Private Car", "Taxi", "School Bus", "e-Rickshaw", "Auto Rickshaw", "Truck", "Tractor", "Commercial Vehicle"];
export const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "LPG", "Electric", "Hybrid", "Ethanol", "Bio-Diesel"];
export const PREVIOUS_INSURANCE_STATUS_OPTIONS = ["Active", "Expired", "New"];
export const INSURANCE_TYPE_OPTIONS = [
  "Bundle Package (1 Yr OD + 1 Yr TP)", "Bundle Package (1 Yr OD + 3 Yr TP)", "Bundle Package (1 Yr OD + 5 Yr TP)",
  "Comprehensive (OD+TP)", "SAOD (On Damage)", "TP (Third Party)",
];
export const DEVICE_TYPE_OPTIONS = ["Mobile", "Tablet", "Laptop", "Other"];
export const INSURER_OPTIONS = [
  "TATA AIG GENERAL INSURANCE CO LTD", "BAJAJ GENERAL INSURANCE LTD", "HDFC ERGO GENERAL INSURANCE CO LTD",
  "INDUSIND GENERAL INSURANCE CO LTD", "Generali Central Insurance Co Ltd", "DIGIT GENERAL INSURANCE CO LTD",
  "KOTAK GENERAL INSURANCE CO LTD", "CHOLA GENERAL INSURANCE CO LTD", "SHRIRAM GENERAL INSURANCE CO LTD",
  "MAGMA GENERAL INSURANCE CO LTD", "ROYAL SUNDARAM GENERAL INSURANCE CO LTD", "SBI GENERAL INSURANCE CO LTD",
  "NATIONAL GENERAL INSURANCE LTD", "UNITED INDIA GENERAL INSURANCE CO LTD", "The New India Assurance Co. Ltd.",
  "The Oriental Insurance Co. Ltd", "IFFCO TOKIO GENERAL INSURANCE LTD", "LIBERTY GENERAL INSURANCE CO LTD",
  "UNIVERSAL SOMPO GENERAL INSURANCE LTD", "Navi General Insurance Ltd", "Raheja QBE General Insurance Co. Ltd",
  "Acko General Insurance Ltd", "Zuno General Insurance Ltd", "Kshema General Insurance Ltd",
  "ICICI LOMBARD GENERAL INSURANCE LTD", "Niva Bupa Health Insurance Co Ltd", "Care Health Insurance Co Ltd",
  "Aditya Birla Health Insurance Co Ltd", "Star Health and Allied Insurance", "Indusind Nippon Life Insurance Co Ltd",
  "Bharti Axa Life Insurance", "Tata AIA Life Insurance",
];
export const POLICY_TENURE_OPTIONS = ["1 Year", "2 Years", "3 Years"];
export const PAYMENT_TERM_OPTIONS = ["One Time", "Monthly", "Quarterly", "Half Quarterly", "Half Yearly", "Yearly"];
export const SUM_INSURED_OPTIONS = [
  "3 Lakh", "4 Lakh", "5 Lakh", "7.5 Lakh", "10 Lakh", "15 Lakh", "20 Lakh", "25 Lakh", "30 Lakh", "35 Lakh",
  "40 Lakh", "45 Lakh", "50 Lakh", "75 Lakh", "1 Crore", "2 Crore", "3 Crore", "4 Crore", "5 Crore",
];
export const RIDER_OPTIONS = [
  "Insta Shield", "Fetal Flourish", "NRInsure", "Loss of Income (Any Illness excluding Infection)",
  "Major Illness and Accident Multiplier", "International Cover-Emergency Care",
];
export const PREVIOUS_POLICY_CASE_OPTIONS = ["Renew Case", "Portability Case", "Fresh Case"];
export const EXPERIENCE_YEARS_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);
export const ADD_ON_OPTIONS = [
  "Zero Depreciation", "Engine Protection", "Return to Invoice", "Key Replacement", "Consumables Cover",
  "Daily Allowance", "Hospital Cash Benefit", "Personal Accident Cover", "Legal Liability to Driver",
  "Loss of Personal Belongings", "Emergency Assistance & Towing", "No Claim Bonus Protection",
  "Electrical/Electronic Items Cover", "Hydraulic System Cover", "CNG/LPG Kit Cover", "Driver Assistant Cover",
  "Road Side Assistance", "Garage Cover", "Medical Expenses Cover",
];

// Workflow option lists (BRD)
export const QUOTE_STATUS_OPTIONS = ["Pending", "Accepted", "Rejected"];
// Payment: two states only. The policy "Status" is asked only once payment is Done.
export const PAYMENT_DONE = "Payment Done";
export const PAYMENT_STATUS_OPTIONS = ["Payment Done", "Payment Pending"];
// e-Mandate statuses apply to EMI (instalment) policies only
export const EMANDATE_ISSUANCE_STATUSES = ["e-Mandate Link Shared", "e-Mandate Done", "e-Mandate Pending"];
export const ISSUANCE_STATUS_OPTIONS = [...EMANDATE_ISSUANCE_STATUSES, "Referred to UW", "Policy Issued", "Rejected"]; // health & others
export { MOTOR_ISSUANCE_STATUS_OPTIONS };
export { MOBILE_INSURERS, getChartPremium, composeMakeModel, productForInsurer };
/** Status options after Payment Done: motor = inspection statuses; others = e-Mandate (EMI only), UW, Issued, Rejected */
export const getIssuanceStatusOptions = (sections = {}, instalment = false) => {
  if (sections.motor) return [...MOTOR_ISSUANCE_STATUS_OPTIONS, "Rejected"];
  return instalment ? ISSUANCE_STATUS_OPTIONS : ISSUANCE_STATUS_OPTIONS.filter((x) => !EMANDATE_ISSUANCE_STATUSES.includes(x));
};
/** Older saved values -> current ones */
export const LEGACY_ISSUANCE_STATUS = { "At UW": "Referred to UW", "Pending for e-Mandate": "e-Mandate Pending" };
export const LEGACY_PAYMENT_STATUS = {
  Pending: "Payment Pending", "URL Shared": "Payment Pending", "Payment Failed": "Payment Pending", "Quote Under Discussion": "Payment Pending",
  "e-Mandate Status Pending": "Payment Done", "e-Mandate Status Done": "Payment Done", "Policy Issued": "Payment Done",
};
export const PAYOUT_BASIS_OPTIONS = ["Net Premium", "OD/TP Split"];
export const CASHBACK_STATUS_OPTIONS = ["Pending", "Partial Settled", "Settled"];
export const CASHBACK_PAYEE_OPTIONS = ["Customer", "Employee", "Channel Partner"];
export const DEFAULT_GST_PAYOUT_PERCENT = 11.5;
export const DEFAULT_TDS_PERCENT = 2;
export const DEFAULT_QUOTE_GST_PERCENT = "18";

// Top-level lead status (derived from the stage) - used by lists, filters, renewal alerts
export const CASE_STATUS_LIST = [
  "Open", "Quote Requested", "Quotation Generated", "Payment Link Generated", "Payment Done",
  "e-Mandate Link Shared", "e-Mandate Done", "e-Mandate Pending", "Referred to UW",
  "Awaited for Inspection", "Inspection Done - Waiting for Policy",
  "Policy Issued", "Rejected", "Closed Without Issuance",
];
// issuance statuses that become the lead status as-is (older values kept so old leads still show)
const PENDING_ISSUANCE_STATUSES = [
  ...EMANDATE_ISSUANCE_STATUSES, "Referred to UW", "Awaited for Inspection", "Inspection Done - Waiting for Policy", "Rejected",
  "At UW", "Pending for e-Mandate",
];

// Badge colours for the derived status (lists + status cards)
export const statusBadgeClass = (status) =>
  ({
    Open: "bg-yellow-100 text-yellow-800",
    "Quote Requested": "bg-sky-100 text-sky-800",
    "Quotation Generated": "bg-blue-100 text-blue-800",
    "Payment Link Generated": "bg-purple-100 text-purple-800",
    "Payment Done": "bg-green-100 text-green-800",
    "At UW": "bg-orange-100 text-orange-800",
    "Pending for e-Mandate": "bg-amber-100 text-amber-800",
    "Awaited for Inspection": "bg-orange-100 text-orange-800",
    "e-Mandate Link Shared": "bg-violet-100 text-violet-800",
    "e-Mandate Done": "bg-lime-100 text-lime-800",
    "e-Mandate Pending": "bg-amber-100 text-amber-800",
    "Referred to UW": "bg-orange-100 text-orange-800",
    Rejected: "bg-red-100 text-red-800",
    "Inspection Done - Waiting for Policy": "bg-teal-100 text-teal-800",
    "Policy Issued": "bg-emerald-100 text-emerald-800",
    "Closed Without Issuance": "bg-red-100 text-red-800",
  }[status] || "bg-gray-100 text-gray-700");

// ============================================================
// SMALL HELPERS
// ============================================================
export const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};
export const isBlank = (v) => v === "" || v === null || v === undefined;
export const round2 = (v) => Math.round((num(v) + Number.EPSILON) * 100) / 100;
export const fmt = (v) => num(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const toUpperCase = (v) => (v ? v.toUpperCase() : v);

export const validateMobile = (m) => /^[0-9]{10}$/.test(m);
export const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const validateAadhaar = (a) => /^[0-9]{12}$/.test(a);
export const validatePAN = (p) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(p);
export const validatePIN = (p) => /^[0-9]{6}$/.test(p);
// Indian registration: BR01AB1234 / DL1CAB1234 / BR01Q1234, or BH series 22BH1234AA
export const normalizeRegistration = (v) => String(v || "").toUpperCase().replace(/[\s-]/g, "");
export const validateRegistration = (v) => {
  const r = normalizeRegistration(v);
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/.test(r) || /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/.test(r);
};
export const validateRtoCode = (v) => /^[A-Z]{2}[0-9]{1,2}[A-Z]?$/.test(String(v || "").toUpperCase());

export const getMaxDate = () => new Date().toISOString().split("T")[0];
export const getODDueDateRestrictions = () => {
  const today = new Date();
  const min = new Date(today); min.setDate(today.getDate() - 90);
  const max = new Date(today); max.setDate(today.getDate() + 60);
  return { min: min.toISOString().split("T")[0], max: max.toISOString().split("T")[0] };
};
export const formatDateForInput = (value) => {
  if (!value) return "";
  try {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};
const isFutureDate = (v) => !!v && new Date(v) > new Date();
const withinDays = (v, before, after) => {
  if (!v) return false;
  const d = new Date(v);
  const lo = new Date(); lo.setDate(lo.getDate() - before);
  const hi = new Date(); hi.setDate(hi.getDate() + after);
  return d >= lo && d <= hi;
};

// ============================================================
// LOB DETECTION
// ============================================================
export const isHealthLob = (lob) =>
  !!lob && (lob.toLowerCase().includes("health") || lob === "Mediclaim Health Insurance" || lob === "Group Health Insurance");
export const isElectronicLob = (lob) => {
  const l = (lob || "").toLowerCase();
  return ["mobile", "electronic", "equipment", "tablet", "laptop"].some((k) => l.includes(k));
};
export const detectSections = (lob) => ({
  health: isHealthLob(lob),
  motor: isMotorLob(lob),
  electronic: isElectronicLob(lob),
  pa: isPaLob(lob),
  travel: isTravelLob(lob),
});
// EMI (instalment) premium is only offered for these LOBs
export const isPaLob = (lob) => !!lob && (lob === "PERSONAL ACCIDENT" || /personal accident/i.test(lob) || /\(PA\)/.test(lob));
export const isTravelLob = (lob) => !!lob && /travel/i.test(lob);
/** Premium paid once (no Paying Term / EMI): Motor, Mobile, PA, Travel */
export const isOneTimeLob = (lob) => isMotorLob(lob) || isElectronicLob(lob) || isPaLob(lob) || isTravelLob(lob);
export const isEmiEligibleLob = (lob) => {
  const l = (lob || "").toLowerCase();
  return l.includes("health") || l.includes("term");
};

// ============================================================
// STAGES
// ============================================================
export const STAGES = [
  { key: "Lead", label: "Lead", access: "all", next: "Request for Quote" },
  { key: "Quote", label: "Quote", access: "all", next: "Request Quote Insurer-wise" },
  // premiums / files / payout are Admin-only; the quote STATUS (and proceeding) is open to Employee + Admin
  { key: "QuoteWorkflow", label: "Quote Workflow", access: "all", next: "Proceed with Accepted Quote" },
  { key: "PolicyIssuance", label: "Policy Issuance", access: "all", next: "Request for Payment URL" },
  // Admin + Employee: payment status, policy status and policy details; pricing stays Admin-only
  { key: "Payment", label: "Payment", access: "all", next: "EMI / Premium Details" },
  { key: "EmiDues", label: "EMI Dues", access: "admin", next: "PayOut & Cashback" },
  // Mobile BRD only: Arshyan buys the policy from the insurer — insurer premium, payout, insurer copy
  { key: "InsurerCalc", label: "Arshyan Calculation", access: "admin", next: "PayOut & Cashback" },
  { key: "Cashback", label: "Cashback / PayOut", access: "admin", next: "Arshyan Profit" },
  { key: "Profit", label: "Arshyan Profit", access: "admin", next: null },
];
export const STAGE_KEYS = STAGES.map((s) => s.key);
export const IDX = Object.fromEntries(STAGE_KEYS.map((k, i) => [k, i]));
export const stageIndex = (key) => (key in IDX ? IDX[key] : 0);
/** Button text for moving on from a module (Mobile: Payment -> Arshyan Calculation) */
export const nextActionLabel = (current, nextKey) => {
  if (current === "Payment" && nextKey === "InsurerCalc") return "Arshyan Calculation";
  if (current === "Payment" && nextKey === "Cashback") return "PayOut & Cashback";
  return getStage(current).next;
};
export const getStage = (key) => STAGES[stageIndex(key)];

// ============================================================
// EMI
// ============================================================
export const EMI_FREQUENCY_PER_YEAR = { Monthly: 12, Quarterly: 4, "Half Quarterly": 8, "Half Yearly": 2, Yearly: 1 };
// BRD: EMI Dues apply "whenever the Paying Term is not One Time"
export const isInstalment = (term) => !!term && term !== "One Time";
export const getTenureYears = (tenure) => {
  const m = String(tenure || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 1;
};
export const getEmiTotalCount = (term, tenure) =>
  isInstalment(term) ? (EMI_FREQUENCY_PER_YEAR[term] || 1) * getTenureYears(tenure) : 0;

const addMonths = (date, months) => {
  const d = new Date(date);
  const whole = Math.floor(months);
  d.setMonth(d.getMonth() + whole);
  const frac = months - whole;
  if (frac > 0) d.setDate(d.getDate() + Math.round(frac * 30));
  return d;
};
const toISO = (d) => (d && !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "");

/** EMI Received Till / Next Due, from Policy Start Date + Paying Term + EMIs received */
export const computeEmiSchedule = ({ paymentTerm, policyTenure, policyStartDate, emiReceivedCount }) => {
  const total = getEmiTotalCount(paymentTerm, policyTenure);
  const received = Math.min(Math.max(0, parseInt(emiReceivedCount, 10) || 0), total);
  const monthsPerEmi = total ? 12 / (EMI_FREQUENCY_PER_YEAR[paymentTerm] || 1) : 0;
  let receivedTill = "";
  let nextDue = "";
  const allReceived = total > 0 && received >= total;
  if (policyStartDate && total) {
    const start = new Date(policyStartDate);
    if (!isNaN(start.getTime())) {
      if (received > 0) {
        const till = addMonths(start, received * monthsPerEmi);
        till.setDate(till.getDate() - 1); // covered up to the day before the next instalment
        receivedTill = toISO(till);
      }
      if (!allReceived) nextDue = toISO(addMonths(start, received * monthsPerEmi));
    }
  }
  return { total, received, receivedTill, nextDue, renewalAlert: allReceived };
};

// ============================================================
// INSURER NAMES (fixes duplicate entities like "Bajaj Allianz" + "BAJAJ GENERAL")
// ============================================================
const clean = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const INSURER_ALIASES = {
  bajajallianzgeneralinsurancecoltd: "BAJAJ GENERAL INSURANCE LTD",
  bajajallianzgeneralinsurancecompanyltd: "BAJAJ GENERAL INSURANCE LTD",
  bajajallianz: "BAJAJ GENERAL INSURANCE LTD",
  bajajgeneral: "BAJAJ GENERAL INSURANCE LTD",
  futuregeneraliindiainsurancecoltd: "Generali Central Insurance Co Ltd",
  futuregenerali: "Generali Central Insurance Co Ltd",
  reliancegeneralinsurancecoltd: "INDUSIND GENERAL INSURANCE CO LTD",
  reliancegeneral: "INDUSIND GENERAL INSURANCE CO LTD",
  godigitgeneralinsuranceltd: "DIGIT GENERAL INSURANCE CO LTD",
  godigit: "DIGIT GENERAL INSURANCE CO LTD",
  kotakmahindrageneralinsurancecoltd: "KOTAK GENERAL INSURANCE CO LTD",
  cholamandalammsgeneralinsurancecoltd: "CHOLA GENERAL INSURANCE CO LTD",
  magmahdigeneralinsurancecoltd: "MAGMA GENERAL INSURANCE CO LTD",
  edelweissgeneralinsurancecoltd: "Zuno General Insurance Ltd",
  maxbupahealthinsurancecoltd: "Niva Bupa Health Insurance Co Ltd",
  religarehealthinsurancecoltd: "Care Health Insurance Co Ltd",
  universalshampoogeneralinsuranceltd: "UNIVERSAL SOMPO GENERAL INSURANCE LTD",
  nationalinsurancecoltd: "NATIONAL GENERAL INSURANCE LTD",
  unitedindiainsurancecoltd: "UNITED INDIA GENERAL INSURANCE CO LTD",
};
const OPTION_BY_CLEAN = Object.fromEntries(INSURER_OPTIONS.map((o) => [clean(o), o]));

export const normalizeInsurerName = (name) => {
  if (!name) return name;
  const c = clean(name);
  return OPTION_BY_CLEAN[c] || INSURER_ALIASES[c] || String(name).trim();
};
export const isKnownInsurer = (name) => INSURER_OPTIONS.includes(name);

const hasValue = (v) => !isBlank(v) && !(typeof v === "number" && isNaN(v));

/**
 * Normalizes insurer names, removes duplicates and keys quotes by insurer name
 * (EmployeeLeads used to match quotes by position, which mixed data up).
 */
export const normalizeQuotes = ({ selectedInsurers = [], insurerQuotes = [], acceptedInsurer = "" }) => {
  const names = [];
  (selectedInsurers || []).forEach((n) => {
    const nn = normalizeInsurerName(n);
    if (nn && !names.includes(nn)) names.push(nn);
  });
  const byName = {};
  (insurerQuotes || []).forEach((q, i) => {
    if (!q) return;
    const name = normalizeInsurerName(q.insurerName || selectedInsurers?.[i]);
    if (!name) return;
    const legacyAccepted = acceptedInsurer && normalizeInsurerName(acceptedInsurer) === name;
    const mapped = {
      ...q,
      insurerName: name,
      // EmployeeLeads stored GST as `gst`, LeadTable as `gstPercent`
      gstPercent: hasValue(q.gstPercent) ? q.gstPercent : hasValue(q.gst) ? q.gst : DEFAULT_QUOTE_GST_PERCENT,
      payoutPercent: hasValue(q.payoutPercent) ? q.payoutPercent : hasValue(q.payoutSlab) && num(q.payoutSlab) ? q.payoutSlab : "",
      quoteStatus: q.quoteStatus || (legacyAccepted ? "Accepted" : "Pending"),
      acceptedAddOns: Array.isArray(q.acceptedAddOns) ? q.acceptedAddOns : [],
    };
    if (!byName[name]) byName[name] = mapped;
    else {
      // merge duplicates, keeping whichever value is filled
      Object.entries(mapped).forEach(([k, v]) => {
        if (!hasValue(byName[name][k]) && hasValue(v)) byName[name][k] = v;
      });
    }
    if (!names.includes(name) && (hasValue(q.netPremium) || hasValue(q.quoteNumber))) names.push(name);
  });
  const quotes = names.map((n) => byName[n] || newQuote(n));
  let accepted = acceptedInsurer ? normalizeInsurerName(acceptedInsurer) : "";
  const acceptedQuotes = quotes.filter((q) => q.quoteStatus === "Accepted");
  if (acceptedQuotes.length) accepted = acceptedQuotes[0].insurerName;
  // never leave two quotes accepted
  if (acceptedQuotes.length > 1) {
    quotes.forEach((q) => {
      if (q.quoteStatus === "Accepted" && q.insurerName !== accepted) q.quoteStatus = "Rejected";
    });
  }
  return { selectedInsurers: names, insurerQuotes: quotes, acceptedInsurer: accepted };
};

export const newQuote = (insurerName) => ({
  insurerName,
  quoteNumber: "",
  netPremium: "",
  gstPercent: DEFAULT_QUOTE_GST_PERCENT,
  payoutPercent: "",
  quoteStatus: "Pending",
  acceptedAddOns: [], // Motor BRD: add-ons this insurer accepted
});

// ============================================================
// QUOTE / PAYMENT AMOUNTS
// GST % = 0 now really means 0 (old code did `gst || 18`, turning 0 into 18)
// ============================================================
// roundToRupee: Mobile premium chart rounds GST to the whole rupee (e.g. 7414 x 18% = 1335)
export const computeAmount = (net, gstPercent, roundToRupee = false) => {
  const n = num(net);
  const g = num(gstPercent);
  const gstValue = roundToRupee ? Math.round((n * g) / 100) : round2((n * g) / 100);
  return { net: n, gstPercent: g, gstValue, gross: round2(n + gstValue) };
};
export const computeQuote = (q = {}) => {
  const { gstValue, gross } = computeAmount(q.netPremium, q.gstPercent, !!q.roundGst);
  return { gstValue, grossPremium: gross };
};
export const getAcceptedQuote = (wf = {}) =>
  (wf.insurerQuotes || []).find((q) => q.quoteStatus === "Accepted") ||
  (wf.insurerQuotes || []).find((q) => q.insurerName && q.insurerName === wf.acceptedInsurer) ||
  null;

// ============================================================
// CASHBACK / PAYOUT TO CUSTOMER / EMPLOYEE (BRD rows 106-114)
// ============================================================
export const computeCashback = ({ cashback = {}, paymentTerm, emiReceivedCount, mobile = false }) => {
  if (mobile) {
    const storePayout = round2(cashback.storePayout);
    const promoterPayout = round2(cashback.promoterPayout);
    const total = round2(storePayout + promoterPayout);
    const status = cashback.status || "Pending";
    const settledAmount = status === "Settled" ? total : status === "Partial Settled" ? num(cashback.settledAmount) : 0;
    return {
      payoutMode: "One Time", payoutCount: 1, amountPerPayment: total, storePayout, promoterPayout, payoutAmount: total, status,
      settledAmount: round2(settledAmount), pendingAmount: round2(Math.max(0, total - settledAmount)), totalPayout: total,
    };
  }
  const instalment = isInstalment(paymentTerm);
  const payoutMode = instalment ? "On Each Payment" : "One Time";
  const payoutCount = instalment ? Math.max(0, parseInt(emiReceivedCount, 10) || 0) : 1;
  const amountPerPayment = num(cashback.amountPerPayment);
  const payoutAmount = round2(amountPerPayment * payoutCount);
  const status = cashback.status || "Pending";
  const settledAmount = status === "Settled" ? payoutAmount : status === "Partial Settled" ? num(cashback.settledAmount) : 0;
  const pendingAmount = round2(Math.max(0, payoutAmount - settledAmount));
  return { payoutMode, payoutCount, amountPerPayment, payoutAmount, status, settledAmount: round2(settledAmount), pendingAmount, totalPayout: payoutAmount };
};

// ============================================================
// ARSHYAN PROFIT (BRD rows 115-127)
//   Insurer PayOut each = Slab % x Net premium of that payment (EMI net if instalment)
//   GST PayOut each     = Insurer PayOut x 11.5%
//   TDS each            = Insurer PayOut x 2%
//   Total each          = Insurer PayOut - TDS + GST
//   Grand Total         = Total each x payments received (EMIs received, or 1)
//   Arshyan Profit      = Grand Total - Total PayOut (cashback to customer/employee)
// Motor: Insurer PayOut each = OD premium x OD slab + TP premium x TP slab.
// ============================================================
export const computeProfit = ({ payout = {}, workflow = {}, paymentTerm, isMotor = false, insuranceType = "", cashbackTotal = 0, isMobile = false }) => {
  if (isMobile) {
    const chartGross = computeAmount(workflow.finalNetPremium, workflow.finalGstPercent, true).gross;
    return computeMobileProfit({ payout, chartGross, cashbackTotal });
  }
  const instalment = isInstalment(paymentTerm);
  const paymentCount = instalment ? Math.max(0, parseInt(workflow.emiReceivedCount, 10) || 0) : 1;
  const netPerPayment = instalment ? num(workflow.emiNetPremium) : num(workflow.finalNetPremium);
  const gstPayoutPercent = isBlank(payout.gstPayoutPercent) ? DEFAULT_GST_PAYOUT_PERCENT : num(payout.gstPayoutPercent);
  const tdsPercent = isBlank(payout.tdsPercent) ? DEFAULT_TDS_PERCENT : num(payout.tdsPercent);

  let insurerPayoutEach;
  let motor = null;
  if (isMotor) {
    motor = computeMotorPayout({
      insuranceType,
      odPremium: payout.odPremium,
      tpPremium: payout.tpPremium,
      odPayoutPercent: payout.odPayoutPercent,
      tpPayoutPercent: payout.tpPayoutPercent,
    });
    insurerPayoutEach = motor.totalPayoutToReceive;
  } else {
    insurerPayoutEach = (netPerPayment * num(payout.payoutSlabPercent)) / 100;
  }
  insurerPayoutEach = round2(insurerPayoutEach);
  const gstPayoutEach = round2((insurerPayoutEach * gstPayoutPercent) / 100);
  const tdsEach = round2((insurerPayoutEach * tdsPercent) / 100);
  const totalPayoutEach = round2(insurerPayoutEach - tdsEach + gstPayoutEach);
  const totalInsurerPayout = round2(insurerPayoutEach * paymentCount);
  const totalGstPayout = round2(gstPayoutEach * paymentCount);
  const totalTds = round2(tdsEach * paymentCount);
  const grandTotalPayout = round2(totalPayoutEach * paymentCount);
  const totalCashbackPayout = round2(cashbackTotal);
  const arshyanProfit = round2(grandTotalPayout - totalCashbackPayout);
  return {
    isMotor, instalment, paymentCount, netPerPayment, gstPayoutPercent, tdsPercent,
    insurerPayoutEach, gstPayoutEach, tdsEach, totalPayoutEach,
    totalInsurerPayout, totalGstPayout, totalTds, grandTotalPayout,
    totalCashbackPayout, arshyanProfit,
    odPayoutAmount: motor ? motor.odPayoutAmount : 0,
    tpPayoutAmount: motor ? motor.tpPayoutAmount : 0,
    hasOD: motor ? motor.hasOD : false,
    hasTP: motor ? motor.hasTP : false,
    premiumSplitTotal: motor ? motor.premiumSplitTotal : 0,
  };
};

// ============================================================
// STATUS (derived from stage, kept for list badges / filters / renewal alerts)
// ============================================================
export const isPaymentConfirmed = (wf = {}) => wf.paymentStatus === PAYMENT_DONE;
// Same rule the backend uses (a shared payment URL also counts) - for saving older cases
export const isPaymentConfirmedLoose = (wf = {}) => isPaymentConfirmed(wf);

export const deriveCaseStatus = (stage, wf = {}) => {
  if (wf.issuanceStatus === "Policy Issued") return "Policy Issued";
  if (PENDING_ISSUANCE_STATUSES.includes(wf.issuanceStatus)) return wf.issuanceStatus;
  const i = stageIndex(stage);
  if (i >= IDX.Payment) {
    if (wf.paymentStatus === "Payment Done") return "Payment Done";
    if (wf.paymentUrl || wf.paymentStatus === "URL Shared") return "Payment Link Generated";
    return "Quotation Generated";
  }
  if (i >= IDX.PolicyIssuance) return "Quotation Generated";
  if (i >= IDX.QuoteWorkflow) return "Quote Requested";
  return "Open";
};

/** Leads created before the staged flow have no caseStage - infer one so nothing is lost */
export const inferStage = (lead = {}) => {
  if (lead.caseStage && STAGE_KEYS.includes(lead.caseStage)) return lead.caseStage;
  const st = lead.workflowDetails?.status || lead.status;
  if (st === "Policy Issued") return "Profit";
  if (["Payment Done", "Payment Link Generated", ...PENDING_ISSUANCE_STATUSES].includes(st)) return "Payment";
  if (st === "Quotation Generated") return "QuoteWorkflow";
  if (st === "Quote Requested") return "QuoteWorkflow";
  const hasLobData = !!(lead.healthDetails || lead.motorDetails || lead.electronicDetails || lead.paDetails || lead.travelDetails);
  return hasLobData ? "Quote" : "Lead";
};

/** Stages shown in the stepper (EMI Dues hidden when Paying Term is One Time) */
export const getVisibleStages = (paymentTerm, lob) =>
  STAGES.filter(
    (s) => (s.key !== "EmiDues" || isInstalment(paymentTerm)) && (s.key !== "InsurerCalc" || isElectronicLob(lob))
  );

export const getNextStage = (current, paymentTerm, lob) => {
  const visible = getVisibleStages(paymentTerm, lob);
  const i = visible.findIndex((s) => s.key === current);
  if (i === -1) {
    // current stage hidden (e.g. EmiDues after Paying Term changed) -> next visible one
    return visible.find((s) => stageIndex(s.key) > stageIndex(current))?.key || null;
  }
  return visible[i + 1]?.key || null;
};

// ============================================================
// EMPTY STATE FACTORIES
// ============================================================
export const emptyFormData = () => ({
  name: "", email: "", mobileNo: "", gender: "", source: "", remarks: "", lob: "",
  pinCode: "", state: "", city: "", sourceDependentValue: "", policyTenure: "", paymentTerm: "", sumInsured: "",
});
export const emptyHealthDetails = () => ({
  policyType: "", numberOfAdults: 1, numberOfChildren: 0, proposerName: "", proposerDOB: "", seniorOneDOB: "",
  familyIncome: "", height: "", weight: "", qualification: "", occupation: "",
  nomineeName: "", nomineeDOB: "", nomineeRelationship: "",
  aadhaarNumber: "", aadhaarFile: null, panNumber: "", panFile: null,
  hasPreviousPolicy: "", previousPolicyCase: "", experienceYears: "",
  renewalDetails: { insurerName: "", policyNumber: "", policyDueDate: "", uploadPolicy: null },
  portabilityDetails: [], medicalRemarks: "", members: [], proposerIsMember: "",
});
export const emptyElectronicDetails = () => ({
  // Mobile BRD (Quote): make & model as Company_Model_RAM_Storage, address as per Aadhaar
  deviceBrand: "", deviceModel: "", ram: "", storage: "", makeModel: "", addressAsPerAadhaar: "",
  // Mobile BRD (Policy Issuance)
  invoiceInProposerName: "", invoiceHolderRelation: "", issuanceRemarks: "",
  deviceType: "", otherDeviceType: "", dateOfPurchase: "", purchaseValue: "", aadhaarNumber: "", aadhaarFile: null,
  panNumber: "", panFile: null, imeiNumber: "", imeiImage: null, devicePhotos: [], purchaseInvoice: null,
});
export const emptyWorkflow = () => ({
  status: "Open",
  selectedInsurers: [], quoteRemarks: "", insurerQuotes: [], acceptedInsurer: "",
  finalNetPremium: "", finalGstPercent: DEFAULT_QUOTE_GST_PERCENT, emiNetPremium: "",
  paymentUrl: "", paymentStatus: "", utrNumber: "", paymentSnapshot: null,
  issuanceStatus: "", notIssuedRemarks: "", eMandateUrl: "", uwQuery: "",
  paymentTakenMode: "", paymentQr: null, insurerPolicyCopy: null, // Mobile BRD
  policyNumber: "", policyIssuedOn: "", policyStartDate: "", policyExpiryDate: "", policyCopy: null,
  emiReceivedCount: "", lastEmiPaidOn: "",
  workflowRemarks: "",
});
export const emptyCashback = () => ({
  payoutTo: "Customer", amountPerPayment: "", status: "Pending", settledAmount: "",
  storePayout: "", promoterPayout: "", // Mobile BRD
});
export const emptyPayout = () => ({
  payoutBasis: "Net Premium", // Motor: "Net Premium" (BRD) or "OD/TP Split"
  insurerNetPremium: "", // Mobile: premium Arshyan pays the insurer
  payoutSlabPercent: "", gstPayoutPercent: String(DEFAULT_GST_PAYOUT_PERCENT), tdsPercent: String(DEFAULT_TDS_PERCENT),
  odPremium: "", tpPremium: "", odPayoutPercent: "", tpPayoutPercent: "",
});
export const buildMember = (id, type, extra = {}) => ({
  id, type, name: "", dob: "", relationship: "", height: "", weight: "", qualification: "", occupation: "",
  monthlyIncome: "", aadhaarNumber: "", aadhaarFile: null, panNumber: "", panFile: null, epicFile: null,
  birthCertificate: null, medicalRemarks: "", wantRider: "", selectedRider: "",
  riderDetails: { instaShield: "", asthma: "", diabetes: "", hypertension: "", hyperlipidaemia: "" },
  fetalFlourish: "", nrInsure: "", lossOfIncome: "", majorIllness: "", internationalCover: "",
  ...extra,
});

/** Member slots required at Policy Issuance, from the Quote answers */
export const getMemberSlots = (h = {}) => {
  const proposerIn = h.proposerIsMember === "Yes";
  if (h.policyType === "Individual") return [proposerIn ? { id: "proposer", type: "proposer" } : { id: "adult-1", type: "adult" }];
  const adults = Math.max(1, parseInt(h.numberOfAdults, 10) || 1);
  const children = Math.max(0, parseInt(h.numberOfChildren, 10) || 0);
  const slots = [];
  if (proposerIn) {
    slots.push({ id: "proposer", type: "proposer" });
    for (let i = 1; i < adults; i++) slots.push({ id: `adult-${i}`, type: "adult" });
  } else {
    for (let i = 1; i <= adults; i++) slots.push({ id: `adult-${i}`, type: "adult" });
  }
  for (let i = 1; i <= children; i++) slots.push({ id: `child-${i}`, type: "child" });
  return slots;
};
export const memberLabel = (m, idx, members) => {
  if (m.type === "proposer") return "Adult 1 — Proposer (Self)";
  if (m.type === "child") return `Child ${members.slice(0, idx + 1).filter((x) => x.type === "child").length}`;
  const adultNo = members.slice(0, idx + 1).filter((x) => x.type !== "child").length;
  return `Adult ${adultNo}`;
};

// ============================================================
// VALIDATION (per stage)
// ctx = { formData, healthDetails, motorDetails, electronicDetails, workflowDetails,
//         cashbackDetails, payoutDetails, sections, paDetails, travelDetails,
//         validatePA, validateTravel, advancing }
// returns [{ field, message }]
// ============================================================
const pushTo = (list) => (field, message) => list.push({ field, message });

const validateLeadStage = (ctx, e) => {
  const f = ctx.formData;
  if (!f.name) e("name", "Name is required");
  if (!f.mobileNo) e("mobileNo", "Mobile number is required");
  else if (!validateMobile(f.mobileNo)) e("mobileNo", "Enter valid 10-digit mobile number");
  if (f.email && !validateEmail(f.email)) e("email", "Invalid email format");
  if (f.pinCode && !validatePIN(f.pinCode)) e("pinCode", "Enter valid 6-digit PIN code");
  if (!f.lob) e("lob", "LOB is required");
  if (ctx.sections?.motor) {
    if (!ctx.motorDetails?.vehicleType) e("vehicleType", "Select the Vehicle Type");
    if (!ctx.motorDetails?.policyType) e("motorPolicyType", "Select the Motor Policy Type (Brand New / SAOD / Comprehensive / TP)");
  }
};

const validateHealthQuote = (ctx, e) => {
  const f = ctx.formData;
  const h = ctx.healthDetails;
  if (!h.hasPreviousPolicy) e("hasPreviousPolicy", "Select whether there is an Active Previous Policy");
  if (h.hasPreviousPolicy === "Yes") {
    if (!h.previousPolicyCase) e("previousPolicyCase", "Select the Previous Policy Case");
    if (h.previousPolicyCase === "Renew Case") {
      if (!h.renewalDetails?.insurerName) e("renewalInsurer", "Renewal: Insurer Name is required");
      if (!h.renewalDetails?.policyNumber) e("renewalPolicy", "Renewal: Policy Number is required");
      if (!h.renewalDetails?.policyDueDate) e("renewalDueDate", "Renewal: Policy Due Date is required");
    }
    if (h.previousPolicyCase === "Portability Case" && !(num(h.experienceYears) > 0)) {
      e("experienceYears", "Portability: select how many years old the policy is");
    }
  }
  if (!h.policyType) e("policyType", "Policy Type is required");
  if (!f.policyTenure) e("policyTenure", "Policy Tenure is required");
  if (!f.paymentTerm) e("paymentTerm", "Paying Term is required");
  if (!f.sumInsured) e("sumInsured", "Sum Insured is required");
  if (!String(h.proposerName || "").trim()) e("proposerName", "Proposer Name is required");
  if (!h.proposerDOB) e("proposerDOB", "Proposer DOB is required");
  else if (isFutureDate(h.proposerDOB)) e("proposerDOB", "Proposer DOB cannot be in the future");
  if (h.seniorOneDOB && isFutureDate(h.seniorOneDOB)) e("seniorOneDOB", "Senior Most DOB cannot be in the future");
  if (!h.proposerIsMember) e("proposerIsMember", "Select whether the Proposer is a member of the plan");
  if (h.policyType === "Floater") {
    if (!(parseInt(h.numberOfAdults, 10) >= 1)) e("numberOfAdults", "No. of Adults must be at least 1");
    if (!h.seniorOneDOB) e("seniorOneDOB", "Senior Most DOB is required for Floater");
  }
};

const validateMotorQuote = (ctx, e) => {
  const m = ctx.motorDetails;
  if (!m.vehicleType) e("vehicleType", "Vehicle Type is required");
  if (!m.policyType) e("motorPolicyType", "Motor Policy Type is required");
  if (m.policyType === "Brand New") {
    if (!m.rtoCode) e("rtoCode", "RTO is required (e.g. BR01)");
    else if (!validateRtoCode(m.rtoCode)) e("rtoCode", "RTO format: 2 letters + number, e.g. BR01 / DL11");
    if (!m.manufacturer) e("manufacturer", "Make / Manufacturer is required");
    if (m.manufacturer === OTHER_MANUFACTURER && !String(m.otherManufacturer || "").trim()) e("otherManufacturer", "Enter the Manufacturer Name (Other selected)");
    if (!String(m.model || "").trim()) e("model", "Model is required");
    if (!m.fuelType) e("fuelType", "Fuel is required");
    if (!m.monthOfManufacturing || !m.yearOfManufacturing) e("monthOfManufacturing", "Manufacturer Date (MM/YYYY) is required");
    if (!m.ownerType) e("ownerType", "Type of Owner is required");
    if (!(num(m.idvAsPerInvoice) > 0)) e("idvAsPerInvoice", "IDV is required (digits only)");
    if (!(m.selectedAddOns || []).length) e("selectedAddOns", `Choose the add-ons, or "${NO_ADDON}"`);
  } else if (m.policyType) {
    if (!m.registrationNumber) e("registrationNumber", "Registration No. is required");
    else if (!validateRegistration(m.registrationNumber)) e("registrationNumber", "Registration No. format, e.g. BR01BS6139");
    if (!m.previousInsuranceStatus) e("previousInsuranceStatus", "Previous Insurance Status (Active / Not Active) is required");
    const active = m.previousInsuranceStatus === PREVIOUS_POLICY_ACTIVE;
    const notActive = m.previousInsuranceStatus === PREVIOUS_POLICY_NOT_ACTIVE;
    if (m.policyType === "TP") {
      if (active) {
        if (!m.previousInsurerName) e("previousInsurerName", "Insurer Name is required");
        if (!m.tpDueDate) e("tpDueDate", "Policy Expiry Date TP is required");
      }
      if (!(m.selectedAddOns || []).length && m.addOnRequired !== "No") e("tpAddOn", "Choose Owner-Driver PA or Not Required");
    } else {
      // SAOD / Comprehensive
      if (active) {
        if (!m.previousInsurerName) e("previousInsurerName", "Insurer Name is required");
        if (!(num(m.idvAsPerPYP) > 0)) e("idvAsPerPYP", "IDV is required");
        if (!m.odDueDate) e("odDueDate", "Policy Expiry Date OD is required");
        if (!m.tpDueDate) e("tpDueDate", "Policy Expiry Date TP is required");
        if (!m.claimTaken) e("claimTaken", "Claim Taken in Active Policy is required");
        if (m.claimTaken === "No" && !m.ncb) e("ncb", "Select the NCB in current policy");
      }
      if (notActive && !(num(m.idvRequired) > 0)) e("idvRequired", "IDV Required for (digits) is required");
      if ((active || notActive) && !(m.selectedAddOns || []).length) e("selectedAddOns", `Choose the add-ons required, or "${NO_ADDON}"`);
    }
    if (active || notActive) {
      if (!m.rcFrontFile) e("rcFrontFile", "Upload RC — Front side");
      if (!m.rcBackFile) e("rcBackFile", "Upload RC — Back side");
    }
  }
};

const validateMotorIssuance = (ctx, e) => {
  const m = ctx.motorDetails;
  const corporate = m.ownerType === "Corporate";
  if (!String(m.proposerName || "").trim()) e("motorProposerName", "Proposer Name is required");
  if (!corporate) {
    if (!m.proposerDOB) e("motorProposerDOB", "Proposer DOB is required");
    else if (isFutureDate(m.proposerDOB)) e("motorProposerDOB", "Proposer DOB cannot be in the future");
    if (!m.aadhaarNumber) e("motorAadhaar", "Aadhaar Number is required");
    else if (!validateAadhaar(m.aadhaarNumber)) e("motorAadhaar", "Aadhaar must be 12 digits");
    if (!m.aadhaarFile) e("motorAadhaarFile", "Upload Aadhaar (mandatory)");
  }
  if (!m.panNumber) e("motorPan", "PAN Number is required");
  else if (!validatePAN(m.panNumber)) e("motorPan", "PAN format ABCDE1234F");
  if (!m.panFile) e("motorPanFile", "Upload PAN (mandatory)");
  if (m.policyType === "Brand New") {
    if (!m.invoiceCopy) e("invoiceCopy", "Upload Invoice (mandatory at Policy Issuance)");
    if (!String(m.engineNo || "").trim()) e("engineNo", "Engine No. (as per invoice) is required");
    if (!String(m.chesisNo || "").trim()) e("chesisNo", "Chassis No. (as per invoice) is required");
  } else if (m.policyType) {
    if (!m.rcFrontFile) e("rcFrontFile", "Upload RC — Front side (mandatory)");
    if (!m.rcBackFile) e("rcBackFile", "Upload RC — Back side (mandatory)");
  }
  if (!String(m.ownerName || "").trim()) e("ownerName", "Owner Name is required");
  if (!corporate) {
    if (m.ownerDOB && isFutureDate(m.ownerDOB)) e("ownerDOB", "Owner DOB cannot be in the future");
    if (!String(m.nomineeName || "").trim()) e("motorNomineeName", "Nominee Name is required");
    if (!m.nomineeDOB) e("motorNomineeDOB", "Nominee DOB is required");
    else if (isFutureDate(m.nomineeDOB)) e("motorNomineeDOB", "Nominee DOB cannot be in the future");
    if (!m.nomineeRelationship) e("motorNomineeRelationship", "Nominee Relation is required");
  }
};

const validateElectronicQuote = (ctx, e) => {
  const d = ctx.electronicDetails;
  const f = ctx.formData;
  if (!f.policyTenure) e("policyTenure", "Policy Tenure is required (1 / 2 / 3 Years)");
  if (!(num(d.purchaseValue) > 0)) e("purchaseValue", "Invoice Price incl. GST / Sum Insured is required (digits)");
  if (!d.deviceType) e("deviceType", "Device Type is required");
  if (d.deviceType === "Other" && !String(d.otherDeviceType || "").trim()) e("otherDeviceType", "Specify the device type");
  const dateErr = checkPurchaseDate(d.dateOfPurchase);
  if (dateErr) e("dateOfPurchase", dateErr);
  if (!String(d.deviceBrand || "").trim()) e("deviceBrand", "Company Name is required (Make & Model)");
  if (!String(d.deviceModel || "").trim()) e("deviceModel", "Model is required (Make & Model)");
  if (d.deviceType && d.deviceType !== "Other") {
    if (!String(d.ram || "").trim()) e("ram", "RAM is required (Make & Model)");
    if (!String(d.storage || "").trim()) e("storage", "Internal Storage is required (Make & Model)");
  }
  if (!String(d.addressAsPerAadhaar || "").trim()) e("addressAsPerAadhaar", "Full Address as per Aadhaar is required");
  else if (!/\b\d{6}\b/.test(d.addressAsPerAadhaar)) e("addressAsPerAadhaar", "Add the 6-digit PIN code to the address");
  const bad = (ctx.workflowDetails.selectedInsurers || []).filter((x) => !MOBILE_INSURERS.includes(x));
  if (bad.length) e("selectedInsurers", `Mobile Insurance quotes are from TATA AIG / Bajaj General only (remove ${bad.join(", ")})`);
};

const validateMobileIssuance = (ctx, e) => {
  const d = ctx.electronicDetails;
  if (!d.purchaseInvoice) e("purchaseInvoice", "Upload the Invoice (not uploaded in the Quote)");
  const photos = (d.devicePhotos || []).length;
  if (photos < MOBILE_MIN_PHOTOS) e("devicePhotos", `Upload at least ${MOBILE_MIN_PHOTOS} device photos (${photos} so far)`);
  if (usesImei(d.deviceType)) {
    if (!d.imeiNumber) e("imeiNumber", "IMEI Number is required");
    else if (!/^[0-9]{15}$/.test(d.imeiNumber)) e("imeiNumber", "IMEI Number must be 15 digits");
    if (!d.imeiImage) e("imeiImage", "Upload the IMEI screenshot (dial *#06#)");
  } else {
    if (!String(d.imeiNumber || "").trim()) e("imeiNumber", "Serial Number is required");
    if (!d.imeiImage) e("imeiImage", "Upload a photo of the serial number");
  }
  if (!d.invoiceInProposerName) e("invoiceInProposerName", "Is the invoice in the proposer's name?");
  if (d.invoiceInProposerName === "No" && !d.invoiceHolderRelation) e("invoiceHolderRelation", "Select the proposer's relation with the invoice holder");
  if (!d.aadhaarNumber) e("electronicAadhaar", "Aadhaar Number is required");
  else if (!validateAadhaar(d.aadhaarNumber)) e("electronicAadhaar", "Aadhaar must be exactly 12 digits");
  if (!d.aadhaarFile) e("electronicAadhaarFile", "Upload Aadhaar (mandatory)");
  if (d.panNumber && !validatePAN(d.panNumber)) e("electronicPan", "PAN format: ABCDE1234F");
};

const validateInsurerCalcStage = (ctx, e) => {
  const p = ctx.payoutDetails;
  if (!(num(p.insurerNetPremium) > 0)) e("insurerNetPremium", "Enter the Insurer Net Premium");
  ["payoutSlabPercent", "gstPayoutPercent", "tdsPercent"].forEach((k) => {
    if (!isBlank(p[k]) && (num(p[k]) < 0 || num(p[k]) > 100)) e(`profit_${k}`, "Percent must be between 0 and 100");
  });
  if (ctx.advancing && isBlank(p.payoutSlabPercent)) e("profit_payoutSlabPercent", "Enter the PayOut %");
};

const validateQuoteStage = (ctx, e) => {
  const s = ctx.sections;
  if (s.health) validateHealthQuote(ctx, e);
  if (s.motor) validateMotorQuote(ctx, e);
  if (s.electronic) validateElectronicQuote(ctx, e);
  if (s.pa && ctx.validatePA) ctx.validatePA(ctx.paDetails, ctx.formData).forEach(({ field, message }) => e(field, message));
  if (s.travel && ctx.validateTravel) ctx.validateTravel(ctx.travelDetails).forEach(({ field, message }) => e(field, message));
  if (!(ctx.workflowDetails.selectedInsurers || []).length) e("selectedInsurers", "Select at least one insurer to request quotes from");
};

const validateQuoteWorkflowStage = (ctx, e) => {
  const quotes = ctx.workflowDetails.insurerQuotes || [];
  quotes.forEach((q) => {
    if (!isBlank(q.gstPercent) && (num(q.gstPercent) < 0 || num(q.gstPercent) > 100)) e(`quote_${q.insurerName}_gst`, `${q.insurerName}: GST % must be 0-100`);
    if (!isBlank(q.payoutPercent) && (num(q.payoutPercent) < 0 || num(q.payoutPercent) > 100)) e(`quote_${q.insurerName}_payout`, `${q.insurerName}: Pay Out % must be 0-100`);
    if (!isBlank(q.idv) && !(num(q.idv) > 0)) e(`quote_${q.insurerName}_idv`, `${q.insurerName}: IDV must be a positive amount`);
  });
  const accepted = quotes.filter((q) => q.quoteStatus === "Accepted");
  if (accepted.length === 0) e("quoteStatus", "Mark one quote as Accepted to proceed");
  if (accepted.length > 1) e("quoteStatus", "Only one quote can be Accepted");
  accepted.forEach((q) => {
    if (!(num(q.netPremium) > 0)) e(`quote_${q.insurerName}_net`, `${q.insurerName}: Net Premium is required for the accepted quote`);
    if (!String(q.quoteNumber || "").trim()) e(`quote_${q.insurerName}_number`, `${q.insurerName}: Quote No. is required for the accepted quote`);
  });
};

const validateIssuanceStage = (ctx, e) => {
  if (ctx.sections.motor) validateMotorIssuance(ctx, e);
  if (ctx.sections.electronic) validateMobileIssuance(ctx, e);
  if (ctx.sections.pa && ctx.validatePAIssuance) ctx.validatePAIssuance(ctx.paDetails).forEach(({ field, message }) => e(field, message));
  if (ctx.sections.travel && ctx.validateTravelIssuance) ctx.validateTravelIssuance(ctx.travelDetails).forEach(({ field, message }) => e(field, message));
  if (!ctx.sections.health) return;
  const h = ctx.healthDetails;
  const members = h.members || [];
  const slots = getMemberSlots(h);
  if (members.length !== slots.length) e("members", "Member details are not ready yet — check No. of Adults/Children");
  members.forEach((m, i) => {
    const label = memberLabel(m, i, members);
    if (!String(m.name || "").trim()) e(`member_${i}_name`, `${label}: Name is required`);
    if (!m.dob) e(`member_${i}_dob`, `${label}: DOB is required`);
    else if (isFutureDate(m.dob)) e(`member_${i}_dob`, `${label}: DOB cannot be in the future`);
    if (!m.relationship) e(`member_${i}_relationship`, `${label}: Relationship is required`);
    // Adult 1 must give Aadhaar; others may give Aadhaar OR another birth-proof number
    if (m.aadhaarNumber && (i === 0 || /^\d+$/.test(m.aadhaarNumber)) && !validateAadhaar(m.aadhaarNumber)) e(`member_${i}_aadhaar`, `${label}: Aadhaar must be 12 digits`);
    if (m.panNumber && !validatePAN(m.panNumber)) e(`member_${i}_pan`, `${label}: PAN format ABCDE1234F`);
  });
  // BRD: Adult 1 Aadhaar upload is mandatory
  if (members[0]) {
    if (!members[0].aadhaarNumber) e("member_0_aadhaar", "Adult 1: Aadhaar Number is required");
    if (!members[0].aadhaarFile) e("member_0_aadhaarFile", "Adult 1: Aadhaar upload is mandatory");
  }
  // Proposer PAN Number + PAN upload are mandatory
  if (h.proposerIsMember === "Yes") {
    const pi = members.findIndex((m) => m.type === "proposer");
    if (pi !== -1) {
      if (!members[pi].panNumber) e(`member_${pi}_pan`, "Proposer: PAN Number is required");
      if (!members[pi].panFile) e(`member_${pi}_panFile`, "Proposer: PAN upload is mandatory");
    }
  } else {
    if (!h.panNumber) e("healthPan", "Proposer: PAN Number is required");
    else if (!validatePAN(h.panNumber)) e("healthPan", "Proposer: PAN format ABCDE1234F");
    if (!h.panFile) e("healthPanFile", "Proposer: PAN upload is mandatory");
  }
  if (h.policyType === "Individual") {
    if (!h.nomineeName) e("nomineeName", "Nominee Name is required");
    if (!h.nomineeDOB) e("nomineeDOB", "Nominee DOB is required");
    if (!h.nomineeRelationship) e("nomineeRelationship", "Nominee Relationship is required");
  }
  if (h.hasPreviousPolicy === "Yes" && h.previousPolicyCase === "Portability Case") {
    (h.portabilityDetails || []).forEach((d, i) => {
      const P = `Previous Policy ${i + 1}`;
      if (!d.insurerName) e(`portabilityInsurer_${i}`, `${P}: Insurer Name is required`);
      if (!d.policyNumber) e(`portabilityPolicy_${i}`, `${P}: Policy Number is required`);
      if (!d.policyActiveFrom) e(`portabilityActive_${i}`, `${P}: Active From is required`);
      if (!d.policyTillDate) e(`portabilityTill_${i}`, `${P}: Till Date is required`);
      if (!d.sumAssured) e(`portabilitySum_${i}`, `${P}: Sum Assured is required`);
      if (!d.uploadPYP) e(`portabilityUpload_${i}`, `${P}: Upload PYP is mandatory`);
    });
  }
};

/**
 * Step order rules for the Payment module — used by both "Save" and the next-module button,
 * so a wrong step can never be saved:
 *   Payment Status: Payment Done / Payment Pending
 *   Status (only after Payment Done): e-Mandate Link Shared* / e-Mandate Done* / e-Mandate Pending* (*EMI only),
 *   Referred to UW, Policy Issued, Rejected   (motor: inspection statuses instead of e-Mandate / UW)
 */
const checkPaymentSteps = (ctx, e) => {
  const w = ctx.workflowDetails;
  const instalment = isInstalment(ctx.formData.paymentTerm);
  if (!w.issuanceStatus) return;
  if (w.paymentStatus !== PAYMENT_DONE) {
    e("issuanceStatus", `Wrong step: "${w.issuanceStatus}" can only be set after Payment Status is "Payment Done"`);
    return;
  }
  if (!getIssuanceStatusOptions(ctx.sections, instalment).includes(w.issuanceStatus)) {
    e("issuanceStatus", EMANDATE_ISSUANCE_STATUSES.includes(w.issuanceStatus)
      ? `Wrong step: "${w.issuanceStatus}" applies to EMI payments only`
      : `"${w.issuanceStatus}" is not a valid status here — choose again`);
  }
  if (w.issuanceStatus === "e-Mandate Link Shared") {
    if (!String(w.eMandateUrl || "").trim()) e("eMandateUrl", "Enter the e-Mandate URL");
    else if (!/^https?:\/\/\S+$/i.test(String(w.eMandateUrl).trim())) e("eMandateUrl", "e-Mandate URL must start with http:// or https://");
  }
  if (w.issuanceStatus === "Referred to UW" && !String(w.uwQuery || "").trim()) e("uwQuery", "Write the UW query");
  if (w.issuanceStatus === "Rejected" && !String(w.notIssuedRemarks || "").trim()) e("notIssuedRemarks", "Enter the rejection reason");
};

const validatePaymentStage = (ctx, e) => {
  const w = ctx.workflowDetails;
  const term = ctx.formData.paymentTerm;
  // pricing is Admin's: tell an employee who to ask rather than asking them to fill a locked field
  const askAdmin = ctx.isAdmin === false ? " — Admin sets it; ask Admin before submitting" : "";
  if (!(num(w.finalNetPremium) > 0)) e("finalNetPremium", `Final Net Premium is required${askAdmin}`);
  if (num(w.finalGstPercent) < 0 || num(w.finalGstPercent) > 100) e("finalGstPercent", "GST % must be 0-100");
  if (isInstalment(term) && !(num(w.emiNetPremium) > 0)) e("emiNetPremium", `EMI Net Premium is required (Paying Term is not One Time)${askAdmin}`);
  if (!w.paymentStatus) e("paymentStatus", "Payment Status is required");
  if (ctx.sections.electronic && ctx.advancing) {
    if (!w.paymentTakenMode) e("paymentTakenMode", "Select the Payment Taken Mode (URL / QR)");
    else if (w.paymentTakenMode === "URL" && !String(w.paymentUrl || "").trim()) e("paymentUrl", "Paste the payment URL");
    else if (w.paymentTakenMode === "QR" && !w.paymentQr) e("paymentQr", "Upload the payment QR");
  }
  checkPaymentSteps(ctx, e);
  if (ctx.advancing) {
    if (w.paymentStatus !== PAYMENT_DONE) e("paymentStatus", "Payment must be Done before moving on");
    else if (!w.issuanceStatus) e("issuanceStatus", "Select the Status");
    else if (w.issuanceStatus === "Rejected") e("issuanceStatus", "This case is Rejected — it cannot move to EMI / PayOut");
    else if (w.issuanceStatus !== "Policy Issued") e("issuanceStatus", "The policy must be Issued before moving to EMI / PayOut");
  }
  if (w.issuanceStatus === "Policy Issued" && w.paymentStatus === PAYMENT_DONE) {
    if (!w.policyNumber) e("policyNumber", "Policy Number is required");
    if (!w.policyIssuedOn) e("policyIssuedOn", "Policy Issued On is required");
    if (!w.policyStartDate) e("policyStartDate", "Policy Start Date is required");
  }
};

const validateEmiStage = (ctx, e) => {
  const w = ctx.workflowDetails;
  const total = getEmiTotalCount(ctx.formData.paymentTerm, ctx.formData.policyTenure);
  const rc = parseInt(w.emiReceivedCount, 10) || 0;
  if (rc < 1) e("emiReceivedCount", "Select Received EMI Count");
  if (rc > total) e("emiReceivedCount", `Received EMI Count cannot exceed ${total}`);
  if (!w.lastEmiPaidOn) e("lastEmiPaidOn", "Last EMI Paid On is required");
};

const validateCashbackStage = (ctx, e) => {
  const c = ctx.cashbackDetails;
  if (ctx.sections.electronic) {
    ["storePayout", "promoterPayout"].forEach((k) => { if (num(c[k]) < 0) e(k, "Amount cannot be negative"); });
    if (!c.status) e("cashbackStatus", "Select the PayOut Status");
    if (c.status === "Partial Settled") {
      const total = num(c.storePayout) + num(c.promoterPayout);
      if (!(num(c.settledAmount) > 0)) e("cashbackSettled", "Enter the amount settled so far");
      else if (num(c.settledAmount) >= total) e("cashbackSettled", "Partially settled amount must be less than the Total Cashback / PayOut");
    }
    return;
  }
  if (isBlank(c.amountPerPayment)) e("cashbackAmount", "Enter PayOut Amt against each Payment (0 if none)");
  else if (num(c.amountPerPayment) < 0) e("cashbackAmount", "PayOut amount cannot be negative");
  if (!c.status) e("cashbackStatus", "Select the PayOut Status");
  if (c.status === "Partial Settled") {
    const { payoutAmount } = computeCashback({ cashback: c, paymentTerm: ctx.formData.paymentTerm, emiReceivedCount: ctx.workflowDetails.emiReceivedCount });
    if (!(num(c.settledAmount) > 0)) e("cashbackSettled", "Enter the amount settled so far");
    else if (num(c.settledAmount) >= payoutAmount) e("cashbackSettled", "Partially settled amount must be less than the Payout Amount");
  }
};

const validateProfitStage = (ctx, e) => {
  const p = ctx.payoutDetails;
  if (ctx.sections.electronic) return; // Mobile: inputs live in the Arshyan Calculation module
  ["payoutSlabPercent", "gstPayoutPercent", "tdsPercent"].forEach((k) => {
    if (!isBlank(p[k]) && (num(p[k]) < 0 || num(p[k]) > 100)) e(`profit_${k}`, "Percent must be between 0 and 100");
  });
  if (ctx.sections.motor && p.payoutBasis === "OD/TP Split") {
    const { errors } = validateMotorPayout(
      {
        insuranceType: ctx.motorDetails.insuranceType,
        netPremium: ctx.workflowDetails.finalNetPremium,
        odPremium: p.odPremium, tpPremium: p.tpPremium,
        odPayoutPercent: p.odPayoutPercent, tpPayoutPercent: p.tpPayoutPercent,
        gstReturnSlabPercent: p.gstPayoutPercent, tdsPercent: p.tdsPercent,
      },
      { fieldPrefix: "profit_" }
    );
    errors.forEach(({ field, message }) => e(field, message.replace("quote Net Premium", "Final Net Premium")));
  } else if (ctx.advancing && isBlank(p.payoutSlabPercent)) {
    e("profit_payoutSlabPercent", "Enter the PayOut Slab %");
  }
};

const STAGE_VALIDATORS = {
  Lead: validateLeadStage,
  Quote: validateQuoteStage,
  QuoteWorkflow: validateQuoteWorkflowStage,
  PolicyIssuance: validateIssuanceStage,
  Payment: validatePaymentStage,
  EmiDues: validateEmiStage,
  Cashback: validateCashbackStage,
  InsurerCalc: validateInsurerCalcStage,
  Profit: validateProfitStage,
};

export const validateStage = (stageKey, ctx) => {
  const list = [];
  const fn = STAGE_VALIDATORS[stageKey];
  if (fn) fn(ctx, pushTo(list));
  return list;
};

/**
 * Lightweight checks used by "Save" (draft) - formats only, so a case can be
 * saved half-filled. The strict checks run when moving to the next module.
 */
export const validateFormats = (ctx) => {
  const list = [];
  const e = pushTo(list);
  validateLeadStage(ctx, e);
  const h = ctx.healthDetails || {};
  if (ctx.sections.health) {
    if (h.proposerDOB && isFutureDate(h.proposerDOB)) e("proposerDOB", "Proposer DOB cannot be in the future");
    (h.members || []).forEach((m, i) => {
      if (m.aadhaarNumber && (i === 0 || /^\d+$/.test(m.aadhaarNumber)) && !validateAadhaar(m.aadhaarNumber)) e(`member_${i}_aadhaar`, `Member ${i + 1}: Aadhaar must be 12 digits`);
      if (m.panNumber && !validatePAN(m.panNumber)) e(`member_${i}_pan`, `Member ${i + 1}: PAN format ABCDE1234F`);
    });
  }
  if (ctx.sections.electronic) {
    const d = ctx.electronicDetails || {};
    if (d.aadhaarNumber && !validateAadhaar(d.aadhaarNumber)) e("electronicAadhaar", "Aadhaar must be exactly 12 digits");
    if (d.panNumber && !validatePAN(d.panNumber)) e("electronicPan", "PAN format: ABCDE1234F");
    if (d.dateOfPurchase && checkPurchaseDate(d.dateOfPurchase)) e("dateOfPurchase", checkPurchaseDate(d.dateOfPurchase));
    if (usesImei(d.deviceType) && d.imeiNumber && !/^[0-9]{15}$/.test(d.imeiNumber)) e("imeiNumber", "IMEI Number must be 15 digits");
  }
  if (ctx.stageIdx >= IDX.QuoteWorkflow) validateQuoteWorkflowStage({ ...ctx }, (f, m) => {
    if (!/Accepted|accepted quote/.test(m)) e(f, m);
  });
  if (ctx.stageIdx >= IDX.Payment) checkPaymentSteps(ctx, e);
  if (ctx.stageIdx >= IDX.Profit) validateProfitStage({ ...ctx, advancing: false }, e);
  return list;
};

// ============================================================
// DOCUMENTS (BRD: "List of Documents uploaded yet against the case")
// ============================================================
export const collectDocuments = (lead) => {
  if (!lead) return [];
  const docs = [];
  const add = (label, url, group) => {
    if (typeof url === "string" && url) docs.push({ label, url, group });
  };
  const m = lead.motorDetails || {};
  add("Previous Year Policy (PYP)", m.pypFile, "Motor");
  add("RC Front", m.rcFrontFile, "Motor");
  add("RC Back", m.rcBackFile, "Motor");
  add("Chassis No. Photo", m.chesisPhoto, "Motor");
  add("Vehicle Invoice", m.invoiceCopy, "Motor");
  add("Proposer Aadhaar", m.aadhaarFile, "Motor");
  add("Proposer PAN", m.panFile, "Motor");
  const h = lead.healthDetails || {};
  add("Proposer Aadhaar", h.aadhaarFile, "Health");
  add("Proposer PAN", h.panFile, "Health");
  add("Renewal — Previous Policy", h.renewalDetails?.uploadPolicy, "Health");
  (h.portabilityDetails || []).forEach((p, i) => add(`Portability PYP ${i + 1}`, p.uploadPYP, "Health"));
  (h.members || []).forEach((mem, i) => {
    const who = mem.name || `Member ${i + 1}`;
    add(`${who} — Aadhaar / Birth Proof`, mem.aadhaarFile, "Members");
    add(`${who} — PAN`, mem.panFile, "Members");
    add(`${who} — EPIC`, mem.epicFile, "Members");
    add(`${who} — Birth Certificate`, mem.birthCertificate, "Members");
  });
  const el = lead.electronicDetails || {};
  add("Aadhaar", el.aadhaarFile, "Device");
  add("PAN", el.panFile, "Device");
  add("IMEI Image", el.imeiImage, "Device");
  add("Purchase Invoice", el.purchaseInvoice, "Device");
  (el.devicePhotos || []).forEach((p, i) => add(`Device Photo ${i + 1}`, p, "Device"));
  const w = lead.workflowDetails || {};
  // Mobile: Quote + Policy Copy are auto-generated on the Vidhant letter head
  const LH = "Letter Head (Auto Generated)";
  const quotes = w.insurerQuotes || [];
  const accepted = quotes.find((q) => q.quoteStatus === "Accepted");
  quotes.forEach((q) => {
    if (q.autoQuote) {
      const showAll = !accepted; // before acceptance list every insurer's quote, afterwards only the accepted one
      if (showAll || q === accepted) add(`Quote (On Letter Head — Auto Generated)${showAll && quotes.length > 1 ? ` — ${q.insurerName}` : ""}`, q.quoteUpload, LH);
    } else {
      add(`Quote — ${q.insurerName}`, q.quoteUpload, "Quotes");
    }
  });
  add("Payment Snapshot", w.paymentSnapshot, "Payment");
  if (w.policyCopyAuto) add(`Policy Copy (On Letter Head — Auto Generated)${w.certificateNumber ? ` — ${w.certificateNumber}` : ""}`, w.policyCopy, LH);
  else add("Policy Copy", w.policyCopy, "Policy");
  add("Payment QR", w.paymentQr, "Payment");
  add("Insurer Policy Copy", w.insurerPolicyCopy, "Policy");
  const pa = lead.paDetails || {};
  add("Renewal — Previous Policy", pa.renewalDetails?.uploadPolicy, "Personal Accident");
  (pa.portabilityDetails || []).forEach((p, i) => add(`Portability PYP ${i + 1}`, p.uploadPYP, "Personal Accident"));
  add("Proposer Aadhaar", pa.aadhaarFile, "Personal Accident");
  add("Proposer PAN", pa.panFile, "Personal Accident");
  add("Previous Policy", pa.prevPolicyFile, "Personal Accident");
  (pa.members || []).forEach((m, i) => {
    add(`Member ${i + 1} Aadhaar (front)`, m.aadhaarFront, "Personal Accident");
    add(`Member ${i + 1} Aadhaar (back)`, m.aadhaarBack, "Personal Accident");
    add(`Member ${i + 1} PAN`, m.panFile, "Personal Accident");
  });
  const tr = lead.travelDetails || {};
  add("Passport (front)", tr.passportFront, "Travel");
  add("Passport (back)", tr.passportBack, "Travel");
  add("Aadhaar", tr.aadhaarFile, "Travel");
  (tr.companions || []).forEach((c, i) => {
    add(`${c.fullName || `Traveller ${i + 2}`} — Passport (front)`, c.passportFront, "Travel");
    add(`${c.fullName || `Traveller ${i + 2}`} — Passport (back)`, c.passportBack, "Travel");
  });
  (tr.travelers || []).forEach((t, i) => {
    add(`${t.fullName || `Traveller ${i + 1}`} — Passport`, t.passportFile, "Travel");
    add(`${t.fullName || `Traveller ${i + 1}`} — Aadhaar`, t.aadhaarFile, "Travel");
    add(`${t.fullName || `Traveller ${i + 1}`} — PAN`, t.panFile, "Travel");
  });
  return docs;
};