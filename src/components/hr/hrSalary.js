// src/components/hr/hrSalary.js — GENERATED from the backend's utils/hrSalary.js (keep them identical)
// ============================================================
//  Offer letter (Salary tab):   Per Annum = Per Month x 12
//  Deductions (multi-select):   NA / TDS / EPFO / EPFO & ESIC / ESIC / GPA / GMC
//     NA            -> every deduction line is 0
//     TDS           -> TDS @ tdsPercent of gross (or basic)
//     EPFO          -> Employee + Employer PF @ % of Basic (wage ceiling optional)
//     ESIC          -> Employee + Employer ESIC @ % of gross, only while gross <= ESIC ceiling
//     GPA / GMC     -> monthly premium entered on the offer
//  Total Deduction = employee side (TDS + employee PF + employee ESIC [+ GPA + GMC when recovered])
//  CTC             = Gross + employer PF + employer ESIC [+ GPA + GMC when the company pays them]
//  In-Hand         = Gross - Total Deduction
// ============================================================
const DEDUCTION_OPTIONS = ["NA", "TDS", "EPFO", "EPFO & ESIC", "ESIC", "GPA", "GMC"];
const EARNING_LINES = [["basic", "Basic Pay"], ["hra", "HRA"], ["medical", "Medical Allowance"], ["bonus", "Statutory Bonus"]];
const DEDUCTION_LINES = [
  ["tds", "TDS"], ["pfEmployee", "Employee Share PF"], ["pfEmployer", "Employer Share PF"],
  ["esicEmployee", "Employee Share ESIC"], ["esicEmployer", "Employer Share ESIC"], ["gpa", "GPA Premium"], ["gmc", "GMC Premium"],
];
const EMPLOYER_LINES = ["pfEmployer", "esicEmployer"];

const DEFAULT_SETTINGS = {
  tdsPercent: 10, tdsBase: "gross",
  pfEmployeePercent: 12, pfEmployerPercent: 12, pfApplyWageCeiling: true, pfWageCeiling: 15000,
  esicEmployeePercent: 0.75, esicEmployerPercent: 3.25, esicWageCeiling: 21000,
  insuranceRecoveredFromEmployee: true, prorationBasis: "calendar", paidLeavesPerMonth: 1,
};

const n = (v) => { const x = Number(v); return isFinite(x) && x > 0 ? x : 0; };
const r0 = (v) => Math.round(n(v));
const pa = (m) => ({ m: r0(m), a: r0(m) * 12 });

/** Which deduction lines apply for the chosen options */
const applicableLines = (selected = []) => {
  const s = new Set(selected);
  if (!s.size || s.has("NA")) return new Set();
  const out = new Set();
  if (s.has("TDS")) out.add("tds");
  if (s.has("EPFO") || s.has("EPFO & ESIC")) { out.add("pfEmployee"); out.add("pfEmployer"); }
  if (s.has("ESIC") || s.has("EPFO & ESIC")) { out.add("esicEmployee"); out.add("esicEmployer"); }
  if (s.has("GPA")) out.add("gpa");
  if (s.has("GMC")) out.add("gmc");
  return out;
};

/**
 * @param earnings   { basic, hra, medical, bonus }  per month
 * @param deductions ["TDS", "EPFO & ESIC", ...]
 * @param insurance  { gpa, gmc }  monthly premiums
 */
const computeSalary = ({ earnings = {}, deductions = [], insurance = {} }, settings = {}) => {
  const S = { ...DEFAULT_SETTINGS, ...settings };
  const e = {};
  EARNING_LINES.forEach(([k]) => { e[k] = pa(earnings[k]); });
  const gross = EARNING_LINES.reduce((t, [k]) => t + e[k].m, 0);
  const apply = applicableLines(deductions);
  const warnings = [];
  const pfBase = S.pfApplyWageCeiling ? Math.min(e.basic.m, n(S.pfWageCeiling)) : e.basic.m;
  const esicEligible = gross <= n(S.esicWageCeiling);
  if ((apply.has("esicEmployee")) && !esicEligible) warnings.push(`ESIC not applicable: gross ₹${gross} is above the ESIC ceiling ₹${S.esicWageCeiling}`);
  const raw = {
    tds: ((S.tdsBase === "basic" ? e.basic.m : gross) * n(S.tdsPercent)) / 100,
    pfEmployee: (pfBase * n(S.pfEmployeePercent)) / 100,
    pfEmployer: (pfBase * n(S.pfEmployerPercent)) / 100,
    esicEmployee: esicEligible ? (gross * n(S.esicEmployeePercent)) / 100 : 0,
    esicEmployer: esicEligible ? (gross * n(S.esicEmployerPercent)) / 100 : 0,
    gpa: n(insurance.gpa),
    gmc: n(insurance.gmc),
  };
  const lines = {};
  DEDUCTION_LINES.forEach(([k]) => { lines[k] = { ...pa(apply.has(k) ? raw[k] : 0), applicable: apply.has(k) }; });
  const insuranceKeys = ["gpa", "gmc"];
  const employeeKeys = ["tds", "pfEmployee", "esicEmployee", ...(S.insuranceRecoveredFromEmployee ? insuranceKeys : [])];
  const employerKeys = [...EMPLOYER_LINES, ...(S.insuranceRecoveredFromEmployee ? [] : insuranceKeys)];
  const sum = (keys) => keys.reduce((t, k) => t + lines[k].m, 0);
  const totalDeduction = sum(employeeKeys);
  const employerContribution = sum(employerKeys);
  return {
    earnings: e,
    gross: pa(gross),
    lines,
    totalDeduction: pa(totalDeduction),
    employerContribution: pa(employerContribution),
    ctc: pa(gross + employerContribution),
    inHand: pa(gross - totalDeduction),
    employeeKeys,
    warnings,
  };
};

// ============================================================
// PAYABLE DAYS (salary register)
//   paid:   Sunday (weekly off), holiday, Present, approved paid leave (quota / month)
//   unpaid: LWP, paid leave beyond the quota, unmarked past day, days before joining
//   future days of the current month count as paid (provisional)
// ============================================================
const pad = (x) => String(x).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
/** Calendar date in India for a stored Date */
const istYmd = (date) => {
  const d = new Date(new Date(date).getTime() + 330 * 60000);
  return d.toISOString().slice(0, 10);
};
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * @param attendance  { "YYYY-MM-DD": "Present" | "Absent" | "On Leave" }
 * @param holidays    Set of "YYYY-MM-DD"
 * @param leaves      [{ from, to, leaveType, status }]  (approved ones used)
 * @param joining     "YYYY-MM-DD"
 * @param today       "YYYY-MM-DD"
 */
const payableBreakdown = ({ year, month, attendance = {}, holidays = new Set(), leaves = [], joining, leaving, today }, settings = {}) => {
  const S = { ...DEFAULT_SETTINGS, ...settings };
  const total = daysInMonth(year, month);
  const leaveDay = {};
  leaves.filter((l) => l.status === "Approved").forEach((l) => {
    let d = new Date(istYmd(l.from) + "T00:00:00Z");
    const end = new Date(istYmd(l.to || l.from) + "T00:00:00Z");
    while (d <= end) { leaveDay[d.toISOString().slice(0, 10)] = l.leaveType || "Approved Leave"; d = new Date(d.getTime() + 86400000); }
  });
  const days = [];
  const count = { weeklyOff: 0, holiday: 0, present: 0, paidLeave: 0, lwp: 0, absent: 0, notJoined: 0, future: 0 };
  let paidLeaveUsed = 0;
  for (let d = 1; d <= total; d++) {
    const key = ymd(year, month, d);
    const dow = new Date(key + "T00:00:00Z").getUTCDay();
    let kind;
    if ((joining && key < joining) || (leaving && key > leaving)) kind = "notJoined";
    else if (dow === 0) kind = "weeklyOff";
    else if (holidays.has(key)) kind = "holiday";
    else if (attendance[key] === "Present") kind = "present";
    else if (leaveDay[key] === "LWP") kind = "lwp";
    else if (leaveDay[key]) {
      if (paidLeaveUsed < n(S.paidLeavesPerMonth)) { kind = "paidLeave"; paidLeaveUsed++; } else kind = "lwp";
    } else if (today && key > today) kind = "future";
    else kind = "absent";
    count[kind]++;
    days.push({ date: key, kind, paid: ["weeklyOff", "holiday", "present", "paidLeave", "future"].includes(kind) });
  }
  const paidDays = days.filter((x) => x.paid).length;
  const divisor = S.prorationBasis === "30" ? 30 : total;
  const payableDays = S.prorationBasis === "30" ? (paidDays === total ? 30 : Math.min(paidDays, 30)) : paidDays;
  return {
    days, count, daysInMonth: total, payableDays, divisor,
    lopDays: count.absent + count.lwp,
    factor: divisor ? Math.min(1, payableDays / divisor) : 0,
    provisional: count.future > 0,
  };
};

/** Salary structure in force on a date (versions sorted by effectiveFrom) */
const structureOn = (history = [], dateYmd) => {
  const sorted = [...history].sort((a, b) => istYmd(a.effectiveFrom).localeCompare(istYmd(b.effectiveFrom)));
  let cur = sorted[0];
  sorted.forEach((v) => { if (istYmd(v.effectiveFrom) <= dateYmd) cur = v; });
  return cur;
};

/**
 * One month of salary for an employee: earnings and deductions prorated by payable days.
 * If the structure changes inside the month (promotion), each paid day uses the structure of that day.
 */
const monthlySalary = ({ history, breakdown }, settings = {}) => {
  const paidDays = breakdown.days.filter((d) => d.paid);
  const units = {}; // structure index -> paid days
  const versions = [];
  paidDays.forEach((d) => {
    const v = structureOn(history, d.date);
    let i = versions.indexOf(v);
    if (i === -1) { versions.push(v); i = versions.length - 1; }
    units[i] = (units[i] || 0) + 1;
  });
  const scale = breakdown.payableDays && paidDays.length ? breakdown.payableDays / paidDays.length : 0; // 30-day basis adjustment
  const earned = {}; const ded = {};
  EARNING_LINES.forEach(([k]) => { earned[k] = 0; });
  DEDUCTION_LINES.forEach(([k]) => { ded[k] = 0; });
  let employeeKeys = [];
  versions.forEach((v, i) => {
    const calc = computeSalary(v || {}, settings);
    employeeKeys = calc.employeeKeys;
    const f = ((units[i] || 0) * scale) / breakdown.divisor;
    EARNING_LINES.forEach(([k]) => { earned[k] += calc.earnings[k].m * f; });
    DEDUCTION_LINES.forEach(([k]) => { ded[k] += calc.lines[k].m * f; });
  });
  EARNING_LINES.forEach(([k]) => { earned[k] = Math.round(earned[k]); });
  DEDUCTION_LINES.forEach(([k]) => { ded[k] = Math.round(ded[k]); });
  const grossEarned = EARNING_LINES.reduce((t, [k]) => t + earned[k], 0);
  const totalDeduction = employeeKeys.reduce((t, k) => t + ded[k], 0);
  const current = structureOn(history, breakdown.days[breakdown.days.length - 1].date) || {};
  const full = computeSalary(current, settings);
  return { earned, grossEarned, deductions: ded, totalDeduction, netPay: grossEarned - totalDeduction, ctc: full.ctc.m, monthlyGross: full.gross.m, employeeKeys };
};

// "Rupees Fifty Five Thousand Only" (Indian numbering)
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const two = (x) => (x < 20 ? ONES[x] : `${TENS[Math.floor(x / 10)]}${x % 10 ? " " + ONES[x % 10] : ""}`);
const three = (x) => (x >= 100 ? `${ONES[Math.floor(x / 100)]} Hundred${x % 100 ? " " + two(x % 100) : ""}` : two(x));
const rupeesInWords = (amount) => {
  let x = Math.round(Math.abs(Number(amount) || 0));
  if (!x) return "Rupees Zero Only";
  const parts = [];
  [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]].forEach(([d, w]) => {
    if (x >= d) { parts.push(`${three(Math.floor(x / d))} ${w}`); x %= d; }
  });
  if (x) parts.push(three(x));
  return `Rupees ${parts.join(" ")} Only`;
};

export {
  DEDUCTION_OPTIONS, EARNING_LINES, DEDUCTION_LINES, EMPLOYER_LINES, DEFAULT_SETTINGS, applicableLines, computeSalary, payableBreakdown, monthlySalary, structureOn, istYmd, daysInMonth, rupeesInWords,
};
