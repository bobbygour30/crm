// src/components/lob/bulkUpload.js
// ============================================================
// Bulk Upload (Lead table): templates depend on LOB + Section.
//   Section chosen = that section AND every section before it, e.g.
//     Lead      -> Lead columns only
//     Quote     -> Lead + Quote
//     Documents -> Lead + Quote + Quote Work Flow + Policy Issuance + Payment + EMI Dues + Cashback + Documents
//   Documents are links (OneDrive / Google Drive / any URL) pasted in the cells.
// buildTemplate() makes the .xlsx; parseUpload() reads a filled sheet back into leads.
// ============================================================
import * as XLSX from "xlsx";
import {
  LOB_OPTIONS, SOURCE_OPTIONS, GENDER_OPTIONS, POLICY_TYPE_OPTIONS, QUALIFICATION_OPTIONS, OCCUPATION_OPTIONS,
  RELATIONSHIP_OPTIONS, NCB_OPTIONS, VEHICLE_TYPE_OPTIONS, DEVICE_TYPE_OPTIONS, INSURER_OPTIONS, POLICY_TENURE_OPTIONS,
  PAYMENT_TERM_OPTIONS, SUM_INSURED_OPTIONS, computeEmiSchedule, PREVIOUS_POLICY_CASE_OPTIONS, ADD_ON_OPTIONS, PAYMENT_STATUS_OPTIONS,
  ISSUANCE_STATUS_OPTIONS, CASHBACK_STATUS_OPTIONS, CASHBACK_PAYEE_OPTIONS, PAYOUT_MODE_OPTIONS, PA_LOB, getTenureYears,
} from "./caseWorkflow";
import { MOTOR_POLICY_TYPES, MOTOR_FUEL_OPTIONS, OWNER_TYPE_OPTIONS, MOTOR_ISSUANCE_STATUS_OPTIONS, NO_ADDON, PREVIOUS_POLICY_ACTIVE, PREVIOUS_POLICY_NOT_ACTIVE } from "./motorInsurance";
import { MOBILE_TENURE_OPTIONS, MOBILE_INSURERS, INVOICE_HOLDER_RELATIONS, PAYMENT_TAKEN_MODES } from "./mobileInsurance";
import { PA_POLICY_TYPES, PA_SUM_INSURED, PA_MARITAL, PA_COVERS } from "./PersonalAccidentForm";
import { TRAVEL_REGIONS, TRAVEL_SUM_INSURED, TRAVEL_PLANS, TRAVEL_MARITAL, GST_STATES } from "./TravelInsuranceForm";

// ---- choices in the Bulk Upload window ----
export const BULK_LOBS = ["Health", "Motor", "Mobile", "Travel", "PA", "Other"];
export const BULK_SECTIONS = [
  { key: "Lead", label: "Lead" },
  { key: "Quote", label: "Quote" },
  { key: "QuoteWorkflow", label: "Quote Work Flow" },
  { key: "PolicyIssuance", label: "Policy Issuance" },
  { key: "Payment", label: "Payment for the Policy" },
  { key: "EmiDues", label: "EMI Dues" },
  { key: "Cashback", label: "Cashback / Payout" },
  { key: "Documents", label: "Documents" },
];
const LOB_VALUE = { Health: "Health Insurance", Motor: "Motor Insurance", Mobile: "Mobile Insurance", Travel: "Travel Insurance", PA: PA_LOB };
const OTHER_LOBS = LOB_OPTIONS.filter((l) => !Object.values(LOB_VALUE).includes(l) && !/health|motor|mobile|travel|personal accident/i.test(l));
const ONE_TIME = ["Motor", "Mobile", "Travel", "PA"]; // no EMI

// ============================================================
// COLUMNS — h: header, p: where it goes, t: type, o: allowed values, r: required, lobs: only for these LOBs
// p prefixes: health. motor. mobile. pa. travel. wf. cb. quote.(accepted quote) proposer.(Health proposer)
// ============================================================
const ALL = undefined;
const insurerList = (lob) => (lob === "Mobile" ? MOBILE_INSURERS : INSURER_OPTIONS);
const COLUMNS = {
  Lead: [
    { h: "Name", p: "name", t: "text", r: true },
    { h: "Mobile No", p: "mobileNo", t: "mobile", r: true },
    { h: "E-mail", p: "email", t: "email" },
    { h: "Gender", p: "gender", t: "list", o: GENDER_OPTIONS },
    { h: "PIN Code", p: "pinCode", t: "pin" },
    { h: "City", p: "city", t: "text" },
    { h: "State", p: "state", t: "text" },
    { h: "LOB", p: "lob", t: "list", o: OTHER_LOBS, r: true, lobs: ["Other"] },
    { h: "Vehicle Type", p: "motor.vehicleType", t: "list", o: VEHICLE_TYPE_OPTIONS, r: true, lobs: ["Motor"] },
    { h: "Motor Policy Type", p: "motor.policyType", t: "list", o: MOTOR_POLICY_TYPES, r: true, lobs: ["Motor"] },
    { h: "Source of Lead", p: "source", t: "list", o: SOURCE_OPTIONS, r: true },
    { h: "Lead Of (Source Name)", p: "sourceDependentValue", t: "text", note: "Who the lead came from, e.g. employee Hemant" },
    { h: "Remarks", p: "remarks", t: "text" },
  ],
  Quote: [
    // Health
    { h: "Active Previous Policy", p: "health.hasPreviousPolicy", t: "yesno", r: true, lobs: ["Health"] },
    { h: "Previous Policy Case", p: "health.previousPolicyCase", t: "list", o: PREVIOUS_POLICY_CASE_OPTIONS, lobs: ["Health"] },
    { h: "Previous Insurer", p: "health.renewalDetails.insurerName", t: "list", o: INSURER_OPTIONS, lobs: ["Health"] },
    { h: "Previous Policy No", p: "health.renewalDetails.policyNumber", t: "text", lobs: ["Health"] },
    { h: "Previous Policy Due Date", p: "health.renewalDetails.policyDueDate", t: "date", lobs: ["Health"] },
    { h: "Portability Experience (Years)", p: "health.experienceYears", t: "num", lobs: ["Health"] },
    { h: "Policy Type", p: "health.policyType", t: "list", o: POLICY_TYPE_OPTIONS, r: true, lobs: ["Health"] },
    { h: "Policy Tenure", p: "policyTenure", t: "list", o: POLICY_TENURE_OPTIONS, r: true, lobs: ["Health", "Other"] },
    { h: "Paying Term", p: "paymentTerm", t: "list", o: PAYMENT_TERM_OPTIONS, r: true, lobs: ["Health", "Other"] },
    { h: "Sum Insured", p: "sumInsured", t: "list", o: SUM_INSURED_OPTIONS, r: true, lobs: ["Health"] },
    { h: "Sum Insured", p: "sumInsured", t: "text", lobs: ["Other"] },
    { h: "Proposer Name", p: "health.proposerName", t: "text", lobs: ["Health"] },
    { h: "Proposer DOB", p: "health.proposerDOB", t: "date", r: true, lobs: ["Health"] },
    { h: "Senior Most Member DOB", p: "health.seniorOneDOB", t: "date", lobs: ["Health"] },
    { h: "Proposer is a Member", p: "health.proposerIsMember", t: "yesno", r: true, lobs: ["Health"] },
    { h: "No. of Adults", p: "health.numberOfAdults", t: "num", lobs: ["Health"] },
    { h: "No. of Children", p: "health.numberOfChildren", t: "num", lobs: ["Health"] },
    { h: "PED / Medical Remarks", p: "health.medicalRemarks", t: "text", lobs: ["Health"] },
    // Motor
    { h: "Registration No", p: "motor.registrationNumber", t: "regno", lobs: ["Motor"], note: "Not needed for Brand New" },
    { h: "Previous Insurance", p: "motor.previousInsuranceStatus", t: "list", o: [PREVIOUS_POLICY_ACTIVE, PREVIOUS_POLICY_NOT_ACTIVE], lobs: ["Motor"] },
    { h: "Previous Insurer", p: "motor.previousInsurerName", t: "list", o: INSURER_OPTIONS, lobs: ["Motor"] },
    { h: "Previous Policy No", p: "motor.policyNo", t: "text", lobs: ["Motor"] },
    { h: "IDV (as per previous policy)", p: "motor.idvAsPerPYP", t: "num", lobs: ["Motor"] },
    { h: "IDV Required", p: "motor.idvRequired", t: "num", lobs: ["Motor"] },
    { h: "OD Expiry Date", p: "motor.odDueDate", t: "date", lobs: ["Motor"] },
    { h: "TP Expiry Date", p: "motor.tpDueDate", t: "date", lobs: ["Motor"] },
    { h: "Claim Taken", p: "motor.claimTaken", t: "yesno", lobs: ["Motor"] },
    { h: "NCB", p: "motor.ncb", t: "list", o: NCB_OPTIONS, lobs: ["Motor"] },
    { h: "Add-ons Required", p: "motor.selectedAddOns", t: "multi", o: [NO_ADDON, ...ADD_ON_OPTIONS], lobs: ["Motor"] },
    { h: "RTO Code (Brand New)", p: "motor.rtoCode", t: "text", lobs: ["Motor"] },
    { h: "Manufacturer", p: "motor.manufacturer", t: "text", lobs: ["Motor"] },
    { h: "Model", p: "motor.model", t: "text", lobs: ["Motor"] },
    { h: "Fuel", p: "motor.fuelType", t: "list", o: MOTOR_FUEL_OPTIONS, lobs: ["Motor"] },
    { h: "Variant", p: "motor.variant", t: "text", lobs: ["Motor"] },
    { h: "Manufacturing Month (1-12)", p: "motor.monthOfManufacturing", t: "num", lobs: ["Motor"] },
    { h: "Manufacturing Year", p: "motor.yearOfManufacturing", t: "num", lobs: ["Motor"] },
    { h: "Owner Type", p: "motor.ownerType", t: "list", o: OWNER_TYPE_OPTIONS, lobs: ["Motor"] },
    { h: "IDV (as per Invoice)", p: "motor.idvAsPerInvoice", t: "num", lobs: ["Motor"] },
    // Mobile
    { h: "Policy Tenure", p: "policyTenure", t: "list", o: MOBILE_TENURE_OPTIONS, r: true, lobs: ["Mobile"] },
    { h: "Invoice Price incl. GST", p: "mobile.purchaseValue", t: "num", r: true, lobs: ["Mobile"] },
    { h: "Device Type", p: "mobile.deviceType", t: "list", o: DEVICE_TYPE_OPTIONS, r: true, lobs: ["Mobile"] },
    { h: "Date of Purchase", p: "mobile.dateOfPurchase", t: "date", r: true, lobs: ["Mobile"] },
    { h: "Company", p: "mobile.deviceBrand", t: "text", r: true, lobs: ["Mobile"] },
    { h: "Model", p: "mobile.deviceModel", t: "text", r: true, lobs: ["Mobile"] },
    { h: "RAM", p: "mobile.ram", t: "text", lobs: ["Mobile"] },
    { h: "Internal Storage", p: "mobile.storage", t: "text", lobs: ["Mobile"] },
    { h: "Address as per Aadhaar (with PIN)", p: "mobile.addressAsPerAadhaar", t: "text", r: true, lobs: ["Mobile"] },
    // Travel
    { h: "Travel to", p: "travel.region", t: "list", o: TRAVEL_REGIONS, r: true, lobs: ["Travel"] },
    { h: "Journey Start Date", p: "travel.journeyStartDate", t: "date", r: true, lobs: ["Travel"] },
    { h: "No. of Days", p: "travel.travelDays", t: "num", r: true, lobs: ["Travel"] },
    { h: "Journey End Date", p: "travel.journeyEndDate", t: "date", lobs: ["Travel"], note: "Blank = worked out from the days" },
    { h: "GST State", p: "travel.gstState", t: "list", o: GST_STATES, r: true, lobs: ["Travel"] },
    { h: "Proposer Name", p: "travel.proposerName", t: "text", lobs: ["Travel"] },
    { h: "Proposer DOB", p: "travel.proposerDOB", t: "date", r: true, lobs: ["Travel"] },
    { h: "Sum Insured", p: "travel.sumInsured", t: "list", o: TRAVEL_SUM_INSURED.map((x) => x.value), r: true, lobs: ["Travel"], note: "USD amount, e.g. 100000, or Modular" },
    { h: "Plan", p: "travel.plan", t: "list", o: TRAVEL_PLANS, r: true, lobs: ["Travel"] },
    { h: "Additional Covers", p: "travel.additionalCovers", t: "list", o: ["Not Required", "Required"], lobs: ["Travel"] },
    { h: "Additional Cover Remarks", p: "travel.addonRemarks", t: "text", lobs: ["Travel"] },
    { h: "Address as per Passport", p: "travel.addressAsPerPassport", t: "text", r: true, lobs: ["Travel"] },
    { h: "Passport No", p: "travel.passportNumber", t: "passport", r: true, lobs: ["Travel"] },
    { h: "Any PED", p: "travel.hasPED", t: "yesno", lobs: ["Travel"] },
    { h: "PED Details", p: "travel.pedDetails", t: "text", lobs: ["Travel"] },
    { h: "Indian Citizen", p: "travel.indianCitizen", t: "yesno", lobs: ["Travel"] },
    { h: "Aadhaar No", p: "travel.aadhaarNumber", t: "aadhaar", lobs: ["Travel"] },
    // PA
    { h: "Active Policy", p: "pa.hasPreviousPolicy", t: "yesno", r: true, lobs: ["PA"] },
    { h: "Previous Policy Case", p: "pa.previousPolicyCase", t: "list", o: PREVIOUS_POLICY_CASE_OPTIONS, lobs: ["PA"] },
    { h: "Previous Insurer", p: "pa.renewalDetails.insurerName", t: "list", o: INSURER_OPTIONS, lobs: ["PA"] },
    { h: "Previous Policy No", p: "pa.renewalDetails.policyNumber", t: "text", lobs: ["PA"] },
    { h: "Previous Policy Due Date", p: "pa.renewalDetails.policyDueDate", t: "date", lobs: ["PA"] },
    { h: "Portability Experience (Years)", p: "pa.experienceYears", t: "num", lobs: ["PA"] },
    { h: "Policy Type", p: "pa.policyType", t: "list", o: PA_POLICY_TYPES, r: true, lobs: ["PA"] },
    { h: "Policy Tenure", p: "policyTenure", t: "list", o: POLICY_TENURE_OPTIONS, r: true, lobs: ["PA"] },
    { h: "Sum Insured", p: "sumInsured", t: "list", o: PA_SUM_INSURED, r: true, lobs: ["PA"] },
    { h: "Proposer Name", p: "pa.proposerName", t: "text", lobs: ["PA"] },
    { h: "Proposer DOB", p: "pa.proposerDOB", t: "date", r: true, lobs: ["PA"] },
    { h: "Family Income (yearly)", p: "pa.familyIncome", t: "num", lobs: ["PA"] },
    { h: "Gross Monthly Income", p: "pa.grossMonthlyIncome", t: "num", lobs: ["PA"] },
    { h: "Occupation", p: "pa.occupation", t: "list", o: OCCUPATION_OPTIONS, lobs: ["PA"] },
    { h: "Death SI", p: "pa.deathSI", t: "num1000", lobs: ["PA"] },
    { h: "Permanent Partial Disability SI", p: "pa.ppdSI", t: "num1000", lobs: ["PA"] },
    { h: "Permanent Total Disability SI", p: "pa.ptdSI", t: "num1000", lobs: ["PA"] },
    { h: "PED Remarks", p: "pa.pedRemarks", t: "text", lobs: ["PA"] },
    { h: "Additional Cover", p: "pa.wantAdditionalCover", t: "yesno", lobs: ["PA"] },
    { h: "Additional Covers (Cover=SI; ...)", p: "pa.covers", t: "covers", lobs: ["PA"], note: "e.g. Air Ambulance Cover=1000000; Road Ambulance Cover" },
    // all LOBs
    { h: "Insurers Requested", p: "wf.selectedInsurers", t: "multi", o: (lob) => insurerList(lob), note: "Comma-separated" },
    { h: "Quote Remarks", p: "wf.quoteRemarks", t: "text" },
  ],
  QuoteWorkflow: [
    { h: "Accepted Insurer", p: "quote.insurerName", t: "list", o: (lob) => insurerList(lob), r: true },
    { h: "Quote No", p: "quote.quoteNumber", t: "text" },
    { h: "Quote Net Premium", p: "quote.netPremium", t: "num", r: true },
    { h: "Quote GST %", p: "quote.gstPercent", t: "num", note: "Blank = 18" },
    { h: "Pay Out %", p: "quote.payoutPercent", t: "num" },
    { h: "IDV (Insurer)", p: "quote.idv", t: "num", lobs: ["Motor"] },
  ],
  PolicyIssuance: [
    // Health (proposer)
    { h: "Proposer Aadhaar No", p: "proposer.aadhaarNumber", t: "aadhaar", lobs: ["Health"] },
    { h: "Proposer PAN", p: "proposer.panNumber", t: "pan", lobs: ["Health"] },
    { h: "Proposer Height", p: "proposer.height", t: "text", lobs: ["Health"] },
    { h: "Proposer Weight (kg)", p: "proposer.weight", t: "num", lobs: ["Health"] },
    { h: "Proposer Qualification", p: "proposer.qualification", t: "list", o: QUALIFICATION_OPTIONS, lobs: ["Health"] },
    { h: "Proposer Occupation", p: "proposer.occupation", t: "list", o: OCCUPATION_OPTIONS, lobs: ["Health"] },
    { h: "Nominee Name", p: "health.nomineeName", t: "text", lobs: ["Health"] },
    { h: "Nominee DOB", p: "health.nomineeDOB", t: "date", lobs: ["Health"] },
    { h: "Nominee Relation", p: "health.nomineeRelationship", t: "list", o: RELATIONSHIP_OPTIONS, lobs: ["Health"] },
    // Motor
    { h: "Proposer Name", p: "motor.proposerName", t: "text", lobs: ["Motor"] },
    { h: "Proposer DOB", p: "motor.proposerDOB", t: "date", lobs: ["Motor"] },
    { h: "Proposer Aadhaar No", p: "motor.aadhaarNumber", t: "aadhaar", lobs: ["Motor"] },
    { h: "Proposer PAN", p: "motor.panNumber", t: "pan", lobs: ["Motor"] },
    { h: "Engine No", p: "motor.engineNo", t: "text", lobs: ["Motor"] },
    { h: "Chassis No", p: "motor.chesisNo", t: "text", lobs: ["Motor"] },
    { h: "Owner Name", p: "motor.ownerName", t: "text", lobs: ["Motor"] },
    { h: "Owner DOB", p: "motor.ownerDOB", t: "date", lobs: ["Motor"] },
    { h: "Nominee Name", p: "motor.nomineeName", t: "text", lobs: ["Motor"] },
    { h: "Nominee DOB", p: "motor.nomineeDOB", t: "date", lobs: ["Motor"] },
    { h: "Nominee Relation", p: "motor.nomineeRelationship", t: "list", o: RELATIONSHIP_OPTIONS, lobs: ["Motor"] },
    { h: "Add-ons in the Policy", p: "motor.finalAddOns", t: "multi", o: ADD_ON_OPTIONS, lobs: ["Motor"] },
    // Mobile
    { h: "IMEI / Serial No", p: "mobile.imeiNumber", t: "text", lobs: ["Mobile"] },
    { h: "Invoice in Proposer's Name", p: "mobile.invoiceInProposerName", t: "yesno", lobs: ["Mobile"] },
    { h: "Relation with Invoice Holder", p: "mobile.invoiceHolderRelation", t: "list", o: INVOICE_HOLDER_RELATIONS, lobs: ["Mobile"] },
    { h: "Aadhaar No", p: "mobile.aadhaarNumber", t: "aadhaar", lobs: ["Mobile"] },
    { h: "PAN", p: "mobile.panNumber", t: "pan", lobs: ["Mobile"] },
    // Travel
    { h: "Marital Status", p: "travel.maritalStatus", t: "list", o: TRAVEL_MARITAL, lobs: ["Travel"] },
    // PA
    { h: "Marital Status", p: "pa.maritalStatus", t: "list", o: PA_MARITAL, lobs: ["PA"] },
    { h: "Height", p: "pa.height", t: "text", lobs: ["PA"] },
    { h: "Weight (kg)", p: "pa.weight", t: "num", lobs: ["PA"] },
    { h: "Qualification", p: "pa.qualification", t: "list", o: QUALIFICATION_OPTIONS, lobs: ["PA"] },
    { h: "Aadhaar No", p: "pa.aadhaarNumber", t: "aadhaar", lobs: ["PA"] },
    { h: "PAN", p: "pa.panNumber", t: "pan", lobs: ["PA"] },
  ],
  Payment: [
    { h: "Final Net Premium", p: "wf.finalNetPremium", t: "num" },
    { h: "Final GST %", p: "wf.finalGstPercent", t: "num", note: "Blank = 18" },
    { h: "EMI Net Premium", p: "wf.emiNetPremium", t: "num", lobs: ["Health", "Other"], note: "Only when Paying Term is not One Time" },
    { h: "Payment Taken Mode", p: "wf.paymentTakenMode", t: "list", o: PAYMENT_TAKEN_MODES, lobs: ["Mobile"] },
    { h: "Payment Status", p: "wf.paymentStatus", t: "list", o: PAYMENT_STATUS_OPTIONS, r: true },
    { h: "UTR No", p: "wf.utrNumber", t: "text" },
    { h: "Status", p: "wf.issuanceStatus", t: "list", o: (lob) => (lob === "Motor" ? [...MOTOR_ISSUANCE_STATUS_OPTIONS, "Rejected"] : ISSUANCE_STATUS_OPTIONS), note: "Only after Payment Done" },
    { h: "Policy Number", p: "wf.policyNumber", t: "text" },
    { h: "Policy Issued On", p: "wf.policyIssuedOn", t: "date" },
    { h: "Policy Start Date", p: "wf.policyStartDate", t: "date" },
    { h: "Policy Expiry Date", p: "wf.policyExpiryDate", t: "date", note: "Blank = start + tenure − 1 day" },
  ],
  EmiDues: [
    { h: "EMI Received Count", p: "wf.emiReceivedCount", t: "num", lobs: ["Health", "Other"] },
    { h: "Last EMI Paid On", p: "wf.lastEmiPaidOn", t: "date", lobs: ["Health", "Other"] },
  ],
  Cashback: [
    { h: "PayOut To", p: "cb.payoutTo", t: "list", o: CASHBACK_PAYEE_OPTIONS },
    { h: "PayOut Mode", p: "cb.payoutMode", t: "list", o: PAYOUT_MODE_OPTIONS, lobs: ["Health", "Motor", "Travel", "PA", "Other"] },
    { h: "PayOut Amount per Payment", p: "cb.amountPerPayment", t: "num", lobs: ["Health", "Motor", "Travel", "PA", "Other"] },
    { h: "Store PayOut", p: "cb.storePayout", t: "num", lobs: ["Mobile"] },
    { h: "Promoter PayOut", p: "cb.promoterPayout", t: "num", lobs: ["Mobile"] },
    { h: "PayOut Status", p: "cb.status", t: "list", o: CASHBACK_STATUS_OPTIONS },
    { h: "Amount Settled", p: "cb.settledAmount", t: "num", note: "Only for Partial Settled" },
  ],
  Documents: [
    { h: "Quote Copy (URL)", p: "quote.quoteUpload", t: "url" },
    { h: "Payment Snapshot (URL)", p: "wf.paymentSnapshot", t: "url" },
    { h: "Policy Copy (URL)", p: "wf.policyCopy", t: "url" },
    { h: "Proposer Aadhaar (URL)", p: "proposer.aadhaarFile", t: "url", lobs: ["Health"] },
    { h: "Proposer PAN (URL)", p: "proposer.panFile", t: "url", lobs: ["Health"] },
    { h: "Previous Policy (URL)", p: "health.renewalDetails.uploadPolicy", t: "url", lobs: ["Health"] },
    { h: "RC Front (URL)", p: "motor.rcFrontFile", t: "url", lobs: ["Motor"] },
    { h: "RC Back (URL)", p: "motor.rcBackFile", t: "url", lobs: ["Motor"] },
    { h: "Previous Policy (URL)", p: "motor.pypFile", t: "url", lobs: ["Motor"] },
    { h: "Invoice (URL)", p: "motor.invoiceCopy", t: "url", lobs: ["Motor"] },
    { h: "Aadhaar (URL)", p: "motor.aadhaarFile", t: "url", lobs: ["Motor"] },
    { h: "PAN (URL)", p: "motor.panFile", t: "url", lobs: ["Motor"] },
    { h: "Invoice (URL)", p: "mobile.purchaseInvoice", t: "url", lobs: ["Mobile"] },
    { h: "Device Photos (URLs, comma-separated)", p: "mobile.devicePhotos", t: "urls", lobs: ["Mobile"] },
    { h: "IMEI Screenshot (URL)", p: "mobile.imeiImage", t: "url", lobs: ["Mobile"] },
    { h: "Aadhaar (URL)", p: "mobile.aadhaarFile", t: "url", lobs: ["Mobile"] },
    { h: "PAN (URL)", p: "mobile.panFile", t: "url", lobs: ["Mobile"] },
    { h: "Passport Front (URL)", p: "travel.passportFront", t: "url", lobs: ["Travel"] },
    { h: "Passport Back (URL)", p: "travel.passportBack", t: "url", lobs: ["Travel"] },
    { h: "Aadhaar (URL)", p: "travel.aadhaarFile", t: "url", lobs: ["Travel"] },
    { h: "Aadhaar (URL)", p: "pa.aadhaarFile", t: "url", lobs: ["PA"] },
    { h: "PAN (URL)", p: "pa.panFile", t: "url", lobs: ["PA"] },
    { h: "Previous Policy (URL)", p: "pa.renewalDetails.uploadPolicy", t: "url", lobs: ["PA"] },
  ],
};

/** Columns for a LOB + section (that section and every one before it) */
export const columnsFor = (lob, section) => {
  const upto = BULK_SECTIONS.findIndex((s) => s.key === section);
  const out = [];
  BULK_SECTIONS.slice(0, upto + 1).forEach((s) => {
    if (s.key === "EmiDues" && ONE_TIME.includes(lob)) return; // no EMI for one-time LOBs
    COLUMNS[s.key].forEach((c) => {
      if (c.lobs && !c.lobs.includes(lob)) return;
      out.push({ ...c, section: s.label, o: typeof c.o === "function" ? c.o(lob) : c.o });
    });
  });
  return out;
};

const TYPE_HELP = {
  text: "Text", num: "Number", num1000: "Number in multiples of 1000", date: "Date (DD-MM-YYYY)", mobile: "10 digits",
  email: "E-mail", pin: "6 digits", yesno: "Yes / No", list: "One of the allowed values", multi: "Allowed values, comma-separated",
  url: "Link (https://…) e.g. OneDrive share link", urls: "Links, comma-separated", aadhaar: "12 digits", pan: "ABCDE1234F",
  passport: "e.g. A1234567", regno: "e.g. BR01AB1234", covers: "Cover name=SI; …",
};

/** Downloads the .xlsx template: sheet "Leads" (headers) + sheet "Instructions" */
export const buildTemplate = (lob, section) => {
  const cols = columnsFor(lob, section);
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([cols.map((c) => c.h)]);
  sheet["!cols"] = cols.map((c) => ({ wch: Math.max(14, Math.min(40, c.h.length + 4)) }));
  XLSX.utils.book_append_sheet(wb, sheet, "Leads");
  const help = [
    [`Bulk upload template — LOB: ${lob}${LOB_VALUE[lob] ? ` (${LOB_VALUE[lob]})` : ""} — Section: ${BULK_SECTIONS.find((s) => s.key === section).label}`],
    ["Fill one row per lead on the 'Leads' sheet. Keep the header row as it is. Documents are links (OneDrive / Google Drive)."],
    [],
    ["Column", "Section", "Required", "Format", "Allowed values / notes"],
    ...cols.map((c) => [c.h, c.section, c.r ? "Yes" : "", TYPE_HELP[c.t] || c.t, [c.o ? c.o.join(", ") : "", c.note || ""].filter(Boolean).join(" — ")]),
  ];
  const hs = XLSX.utils.aoa_to_sheet(help);
  hs["!cols"] = [{ wch: 34 }, { wch: 18 }, { wch: 9 }, { wch: 30 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, hs, "Instructions");
  XLSX.writeFile(wb, `Bulk_Template_${lob}_${section}.xlsx`);
  return cols;
};

// ============================================================
// READING A FILLED SHEET
// ============================================================
const pad = (n) => String(n).padStart(2, "0");
/** Excel date / "dd-mm-yyyy" / "dd/mm/yyyy" / "yyyy-mm-dd" -> "yyyy-mm-dd" */
export const toISODate = (v) => {
  if (v === null || v === undefined || v === "") return "";
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  if (typeof v === "number") { // Excel serial date
    const d = new Date(Math.round((v - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  return null; // not a date
};
const canonical = (options, v) => options.find((o) => String(o).toLowerCase() === String(v).trim().toLowerCase());
const isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s).trim());

/** One cell -> [value, error] */
const readCell = (c, raw) => {
  const blank = raw === null || raw === undefined || String(raw).trim() === "";
  if (blank) return [undefined, c.r ? `${c.h} is required` : null];
  const s = String(raw).trim();
  switch (c.t) {
    case "num": case "num1000": {
      const n = Number(s.replace(/[,₹$\s]/g, ""));
      if (!isFinite(n) || n < 0) return [undefined, `${c.h}: "${s}" is not a number`];
      if (c.t === "num1000" && n % 1000 !== 0) return [undefined, `${c.h}: must be in multiples of 1000`];
      return [n, null];
    }
    case "date": { const d = toISODate(raw); return d ? [d, null] : [undefined, `${c.h}: "${s}" is not a date (use DD-MM-YYYY)`]; }
    case "mobile": { const d = s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""); return /^\d{10}$/.test(d) ? [d, null] : [undefined, `${c.h}: must be 10 digits`]; }
    case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? [s.toLowerCase(), null] : [undefined, `${c.h}: "${s}" is not a valid e-mail`];
    case "pin": return /^\d{6}$/.test(s) ? [s, null] : [undefined, `${c.h}: must be 6 digits`];
    case "aadhaar": { const d = s.replace(/\s/g, ""); return /^\d{12}$/.test(d) ? [d, null] : [undefined, `${c.h}: must be 12 digits`]; }
    case "pan": return /^[A-Z]{5}\d{4}[A-Z]$/.test(s.toUpperCase()) ? [s.toUpperCase(), null] : [undefined, `${c.h}: format ABCDE1234F`];
    case "passport": return /^[A-PR-WY][1-9]\d{5}[1-9]$/.test(s.toUpperCase()) ? [s.toUpperCase(), null] : [undefined, `${c.h}: not a valid passport number`];
    case "regno": return [s.toUpperCase().replace(/[^A-Z0-9]/g, ""), null];
    case "yesno": { const v = canonical(["Yes", "No"], s); return v ? [v, null] : [undefined, `${c.h}: use Yes or No`]; }
    case "list": { const v = canonical(c.o || [], s); return v ? [v, null] : [undefined, `${c.h}: "${s}" is not an allowed value`]; }
    case "multi": {
      const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
      const bad = parts.filter((p) => !canonical(c.o || [], p));
      return bad.length ? [undefined, `${c.h}: not allowed — ${bad.join(", ")}`] : [parts.map((p) => canonical(c.o, p)), null];
    }
    case "url": return isUrl(s) ? [s, null] : [undefined, `${c.h}: must be a link starting with https://`];
    case "urls": {
      const parts = s.split(/[,\s]+/).filter(Boolean);
      const bad = parts.filter((p) => !isUrl(p));
      return bad.length ? [undefined, `${c.h}: not a link — ${bad[0]}`] : [parts, null];
    }
    case "covers": {
      const out = {};
      const bad = [];
      s.split(";").map((x) => x.trim()).filter(Boolean).forEach((part) => {
        const [label, si] = part.split("=").map((x) => x.trim());
        const cover = PA_COVERS.find((pc) => pc.label.toLowerCase() === String(label).toLowerCase());
        if (!cover) bad.push(label);
        else out[cover.key] = { selected: true, ...(cover.type === "fixed" ? {} : si ? { value: si.replace(/[,₹\s]/g, "") } : {}) };
      });
      return bad.length ? [undefined, `${c.h}: unknown cover — ${bad.join(", ")}`] : [out, null];
    }
    default: return [s, null];
  }
};

const setPath = (obj, path, value) => {
  const keys = path.split(".");
  let o = obj;
  keys.slice(0, -1).forEach((k) => { o[k] = o[k] || {}; o = o[k]; });
  o[keys[keys.length - 1]] = value;
};
const ROOT = { health: "healthDetails", motor: "motorDetails", mobile: "electronicDetails", pa: "paDetails", travel: "travelDetails", wf: "workflowDetails", cb: "cashbackDetails" };
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().split("T")[0]; };

/** Turns one row of values into a lead the server can save */
const buildLead = (lob, section, values) => {
  const lead = { lob: LOB_VALUE[lob] || "", bulkSection: section };
  const quote = {};
  const proposer = {};
  Object.entries(values).forEach(([path, v]) => {
    if (v === undefined) return;
    const [head, ...rest] = path.split(".");
    if (head === "quote") quote[rest.join(".")] = v;
    else if (head === "proposer") proposer[rest.join(".")] = v;
    else if (ROOT[head]) setPath(lead, `${ROOT[head]}.${rest.join(".")}`, v);
    else setPath(lead, path, v);
  });
  if (ONE_TIME.includes(lob)) lead.paymentTerm = "One Time";
  const wf = (lead.workflowDetails = lead.workflowDetails || {});
  if (quote.insurerName) {
    wf.acceptedInsurer = quote.insurerName;
    wf.insurerQuotes = [{ gstPercent: 18, ...quote, quoteStatus: "Accepted", ...(lob === "Mobile" ? { roundGst: true } : {}) }];
    wf.selectedInsurers = [...new Set([...(wf.selectedInsurers || []), quote.insurerName])];
  }
  if (lob === "Health") {
    const h = (lead.healthDetails = lead.healthDetails || {});
    Object.assign(h, proposer); // proposer KYC lives on the health details…
    if (h.proposerIsMember === "Yes") h.members = [{ type: "proposer", relationship: "Self", name: h.proposerName || lead.name, dob: h.proposerDOB, ...proposer }]; // …and on Adult 1
  }
  if (lob === "Travel" && lead.travelDetails) {
    const t = lead.travelDetails;
    if (t.journeyStartDate && t.travelDays && !t.journeyEndDate) t.journeyEndDate = addDays(t.journeyStartDate, Number(t.travelDays) - 1);
  }
  if (lob === "Mobile" && lead.electronicDetails) {
    const e = lead.electronicDetails;
    e.makeModel = [e.deviceBrand, e.deviceModel, e.ram, e.storage].filter(Boolean).join("_");
  }
  // expiry from tenure (Travel: from the journey days)
  if (wf.policyStartDate && !wf.policyExpiryDate) {
    const days = Number((lead.travelDetails || {}).travelDays);
    if (lob === "Travel" && days > 0) wf.policyExpiryDate = addDays(wf.policyStartDate, days - 1);
    else {
      const d = new Date(wf.policyStartDate + "T00:00:00Z");
      d.setUTCFullYear(d.getUTCFullYear() + (getTenureYears(lead.policyTenure) || 1));
      d.setUTCDate(d.getUTCDate() - 1);
      wf.policyExpiryDate = d.toISOString().split("T")[0];
    }
  }
  // EMI totals + next due date, worked out the same way the case form does
  if (wf.policyStartDate && lead.paymentTerm && lead.paymentTerm !== "One Time") {
    const sch = computeEmiSchedule({ paymentTerm: lead.paymentTerm, policyTenure: lead.policyTenure, policyStartDate: wf.policyStartDate, emiReceivedCount: wf.emiReceivedCount || 0 });
    if (sch && sch.total) { wf.emiTotalCount = sch.total; if (sch.nextDue) wf.nextDueDate = sch.nextDue; }
  }
  if (wf.finalNetPremium === undefined && quote.netPremium !== undefined) { wf.finalNetPremium = quote.netPremium; wf.finalGstPercent = wf.finalGstPercent ?? quote.gstPercent ?? 18; }
  if (wf.issuanceStatus && wf.paymentStatus !== "Payment Done") wf.issuanceStatus = undefined; // a Status needs Payment Done
  return lead;
};

/**
 * Reads a filled template.
 * @returns {{ rows: [{ rowNo, lead, errors }], missingHeaders: string[], unknownHeaders: string[] }}
 */
export const parseUpload = async (file, lob, section) => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets.Leads || wb.Sheets[wb.SheetNames[0]];
  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
  const headers = (grid[0] || []).map((h) => String(h).trim());
  const cols = columnsFor(lob, section);
  const missingHeaders = cols.filter((c) => c.r && !headers.includes(c.h)).map((c) => c.h);
  const unknownHeaders = headers.filter((h) => h && !cols.some((c) => c.h === h));
  const rows = [];
  grid.slice(1).forEach((cells, i) => {
    if (!cells.some((v) => String(v).trim() !== "")) return; // empty row
    const values = {};
    const errors = [];
    cols.forEach((c) => {
      const idx = headers.indexOf(c.h);
      const [v, err] = readCell(c, idx === -1 ? "" : cells[idx]);
      if (err) errors.push(err);
      if (v !== undefined) values[c.p] = v;
    });
    rows.push({ rowNo: i + 2, lead: buildLead(lob, section, values), errors });
  });
  return { rows, missingHeaders, unknownHeaders };
};
