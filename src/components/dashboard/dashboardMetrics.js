// src/components/dashboard/dashboardMetrics.js
// ============================================================
// Admin Dashboard (TERM LOB & Dashboard BRD) — pure logic, no React.
//   • filters      Date Range (lead created) · LOB · Insurer · Source of Business · Booking Month (Payment Date)
//   • tiles        every number on the Dashboard, each with the rows behind it (drill-down)
//   • reports      column layouts for each drill-down + Excel export
// The rows are the Reports tab's rows, so a Dashboard number always matches its report.
// ============================================================
export const CATEGORIES = ["Motor", "Health", "PA", "Term", "Mobile", "Travel", "Other"];
export const CATEGORY_LABEL = { Motor: "Motor Insurance", Health: "Health Insurance", PA: "Personal Accident", Term: "Term Insurance", Mobile: "Mobile Insurance", Travel: "Travel Insurance", Other: "Other" };
export const RENEWAL_WINDOW_DAYS = 30;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---- dates (India) ----
export const todayIst = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
export const addDays = (ymd, n) => { const d = new Date(`${ymd}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const defaultFilters = () => ({ from: addDays(todayIst(), -89), to: todayIst(), category: "", insurer: "", leadOf: "", bookingMonth: "" });
export const monthLabel = (ym) => (ym ? `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}` : "");
export const fmtDate = (v) => (v ? `${v.slice(8, 10)}-${MONTHS[Number(v.slice(5, 7)) - 1]}-${v.slice(0, 4)}` : "");
export const money = (v) => `₹${Math.round(Number(v) || 0).toLocaleString("en-IN")}`;
const n = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? 0 : Number(v));

// ---- filter options (from the data) ----
export const filterOptions = (rows = []) => {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return {
    categories: CATEGORIES.filter((c) => rows.some((r) => r.category === c)),
    insurers: uniq(rows.map((r) => r.insurer)),
    leadOf: uniq(rows.map((r) => r.leadOf)),
    bookingMonths: uniq(rows.map((r) => (r.bookingDate || "").slice(0, 7))).reverse(),
  };
};

/** Rows inside the filters. Date Range = lead created date; Booking Month = Payment Date. */
export const applyFilters = (rows = [], f = {}) => rows.filter((r) => {
  const created = r.createdAt || "";
  if (f.from && (!created || created < f.from)) return false;
  if (f.to && (!created || created > f.to)) return false;
  if (f.category && r.category !== f.category) return false;
  if (f.insurer && r.insurer !== f.insurer) return false;
  if (f.leadOf && r.leadOf !== f.leadOf) return false;
  if (f.bookingMonth && (r.bookingDate || "").slice(0, 7) !== f.bookingMonth) return false;
  return true;
});

export const describeFilters = (f = {}) => [
  f.from || f.to ? `Lead created ${fmtDate(f.from) || "…"} to ${fmtDate(f.to) || "…"}` : "All dates",
  f.category ? `LOB: ${CATEGORY_LABEL[f.category] || f.category}` : "",
  f.insurer ? `Insurer: ${f.insurer}` : "",
  f.leadOf ? `Source of Business: ${f.leadOf}` : "",
  f.bookingMonth ? `Booking Month: ${monthLabel(f.bookingMonth)}` : "",
].filter(Boolean).join(" · ");

// ============================================================
// REPORT FORMATS (drill-down columns)
// ============================================================
const c = (key, label, get, type = "text", total = false) => ({ key, label, get: get || ((r) => r[key]), type, total });
const LEAD_BASE = [c("leadCode", "Lead Code"), c("name", "Customer"), c("mobileNo", "Mobile"), c("lob", "LOB"), c("leadOf", "Lead Of"), c("submittedBy", "Submitted By")];
const stageText = (r) => (r.issued ? "Converted into Policy" : r.lost ? "Lost" : r.quoted ? "Quote under process" : "Lead");
export const REPORT_COLUMNS = {
  leads: [...LEAD_BASE, c("stageText", "Stage", stageText), c("status", "Status"), c("createdAt", "Created On", null, "date")],
  policies: [c("leadCode", "Lead Code"), c("name", "Customer"), c("lob", "LOB"), c("insurer", "Insurer"), c("policyNumber", "Policy No"), c("policyType", "Policy Type"),
    c("policyStartDate", "Start Date", null, "date"), c("policyExpiryDate", "Expiry Date", null, "date"), c("policyStatus", "Policy Status"), c("grossPremium", "Gross Premium", null, "money", true)],
  emi: [c("leadCode", "Lead Code"), c("name", "Customer"), c("lob", "LOB"), c("insurer", "Insurer"), c("policyNumber", "Policy No"), c("paymentTerm", "Paying Term"),
    c("emiAmount", "EMI (incl. GST)", null, "money"), c("emiCount", "EMIs Received / Total", (r) => `${r.emiReceived || 0} / ${r.emiTotal || 0}`),
    c("emiPendingAmount", "Pending Amount", null, "money", true), c("nextDueDate", "Next Due", null, "date"), c("lastEmiPaidOn", "Last Paid", null, "date")],
  turnover: [c("leadCode", "Lead Code"), c("name", "Customer"), c("lob", "LOB"), c("insurer", "Insurer"), c("policyNumber", "Policy No"), c("bookingDate", "Booking Date", null, "date"),
    c("netPremium", "Net Premium", null, "money", true), c("gstAmount", "GST", null, "money", true), c("grossPremium", "Gross Premium", null, "money", true)],
  payout: [c("leadCode", "Lead Code"), c("name", "Customer"), c("lob", "LOB"), c("insurer", "Insurer"), c("policyNumber", "Policy No"), c("bookingDate", "Booking Date", null, "date"),
    c("netPremium", "Net Premium", null, "money", true), c("insurerPayout", "Net Insurer PayOut", null, "money", true), c("gstReturn", "GST Return", null, "money", true),
    c("tdsDeduction", "TDS Deduction", null, "money", true), c("cashbackPaid", "Cashback / PayOut", null, "money", true), c("arshyanProfit", "Arshyan Profit", null, "money", true)],
  mobile: [c("leadCode", "Lead Code"), c("name", "Customer"), c("insurer", "Insurer"), c("policyNumber", "Policy No"), c("bookingDate", "Booking Date", null, "date"),
    c("grossPremium", "Customer Premium (Chart)", null, "money", true), c("chartProfit", "Chart Profit", null, "money", true), c("insurerPayout", "Net Insurer PayOut", null, "money", true),
    c("gstReturn", "GST Return", null, "money", true), c("tdsDeduction", "TDS Deduction", null, "money", true), c("cashbackPaid", "Cashback / PayOut", null, "money", true),
    c("arshyanProfit", "Arshyan Profit", null, "money", true)],
  employees: [c("employeeCode", "Emp. Code"), c("name", "Name"), c("department", "Department"), c("designation", "Designation"), c("reportingManager", "Reporting Manager"),
    c("dateOfJoining", "Joined", null, "date"), c("todayStatus", "Today"), c("status", "Status")],
  notice: [c("employeeCode", "Emp. Code"), c("name", "Name"), c("department", "Department"), c("designation", "Designation"), c("reportingManager", "Reporting Manager"),
    c("exitStatus", "Exit Status"), c("exitDate", "Exit Date", null, "date"), c("exitReason", "Reason")],
  left: [c("employeeCode", "Emp. Code"), c("name", "Name"), c("department", "Department"), c("designation", "Designation"), c("dateOfJoining", "Joined", null, "date"), c("lastWorkingDay", "Last Working Day", null, "date")],
  assets: [c("employeeCode", "Emp. Code"), c("name", "Name"), c("department", "Department"), c("designation", "Designation"),
    c("assetCount", "Assets", (r) => (r.assets || []).length, "number", true),
    c("assetList", "Asset Details", (r) => (r.assets || []).map((a) => `${a.assetType}${a.brand ? ` ${a.brand}` : ""}${a.model ? ` ${a.model}` : ""} (${a.assetId})`).join("; "))],
  onboarding: [c("refId", "Offer Ref."), c("name", "Candidate"), c("designation", "Designation"), c("department", "Department"), c("dateOfJoining", "Joining", null, "date"),
    c("status", "Documentation Status"), c("sentAt", "Offer Sent", null, "date"), c("submittedAt", "Submitted", null, "date"), c("candidateEmail", "E-mail")],
};

// ============================================================
// TILES — every number on the Dashboard, with the rows behind it
// ============================================================
const sum = (rows, k) => Math.round(rows.reduce((t, r) => t + n(r[k]), 0) * 100) / 100;
export const computeDashboard = (rows = [], hr = {}, today = todayIst()) => {
  const issued = rows.filter((r) => r.issued);
  const t = {};
  const count = (key, label, list, report, extra = {}) => { t[key] = { key, label, kind: "count", value: list.length, rows: list, report, ...extra }; };
  const amount = (key, label, list, field, report, extra = {}) => { t[key] = { key, label, kind: "money", value: sum(list, field), field, rows: list, report, ...extra }; };
  // ---- Lead ----
  count("leadsTotal", "Total Leads", rows, "leads");
  count("lead", "Lead", rows.filter((r) => !r.quoted && !r.issued && !r.lost), "leads");
  count("quoteProcess", "Quote Under Process", rows.filter((r) => r.quoted && !r.issued && !r.lost), "leads");
  count("lost", "Lost Lead", rows.filter((r) => r.lost), "leads");
  count("converted", "Converted into Policy", issued, "policies");
  // ---- Policy ----
  const active = issued.filter((r) => r.policyStatus === "Active");
  count("policiesTotal", "Total Policies", issued, "policies");
  count("active", "Active Policy", active, "policies");
  count("renewal", `Renewal Alert Policy (${RENEWAL_WINDOW_DAYS} days)`, active.filter((r) => r.policyExpiryDate && r.policyExpiryDate >= today && r.policyExpiryDate <= addDays(today, RENEWAL_WINDOW_DAYS)), "policies");
  count("emi", "EMI Dues Policy", issued.filter((r) => r.instalment && n(r.emiPending) > 0 && !r.cancelled), "emi");
  count("expired", "Expired Policy", issued.filter((r) => r.policyStatus !== "Active"), "policies");
  // ---- TurnOver ----
  amount("turnover", "Sum of Net Premium", issued, "netPremium", "turnover");
  amount("netPremium", "Net Premium", issued, "netPremium", "turnover");
  amount("gst", "GST", issued, "gstAmount", "turnover");
  amount("gross", "Gross", issued, "grossPremium", "turnover");
  // ---- PayOut (all LOB except Mobile) ----
  const nonMobile = issued.filter((r) => r.category !== "Mobile");
  amount("profit", "Arshyan Profit", nonMobile, "arshyanProfit", "payout");
  amount("insurerPayout", "Net Insurer PayOut", nonMobile, "insurerPayout", "payout");
  amount("gstReturn", "GST Return", nonMobile, "gstReturn", "payout");
  amount("tds", "TDS Deduction", nonMobile, "tdsDeduction", "payout");
  amount("cashback", "Cashback / PayOut", nonMobile, "cashbackPaid", "payout");
  // ---- PayOut (Mobile) ----
  const mobile = issued.filter((r) => r.category === "Mobile");
  amount("mProfit", "Arshyan Profit (Total Profit @Mobile)", mobile, "arshyanProfit", "mobile", { hint: "Chart Profit + Insurer PayOut after all deductions − PayOut / Cashback" });
  amount("mChart", "Specific Profit (Chart Profit)", mobile, "chartProfit", "mobile", { hint: "Customer chart premium − premium paid to the insurer" });
  amount("mInsurerPayout", "Net Insurer PayOut", mobile, "insurerPayout", "mobile");
  amount("mGstReturn", "GST Return", mobile, "gstReturn", "mobile");
  amount("mTds", "TDS Deduction", mobile, "tdsDeduction", "mobile");
  amount("mCashback", "Cashback / PayOut", mobile, "cashbackPaid", "mobile");
  // ---- Employee Records ----
  const emps = hr.employees || [];
  const activeEmps = emps.filter((e) => e.active);
  count("empActiveTotal", "Active Employees Count", activeEmps, "employees");
  count("present", "Present", activeEmps.filter((e) => e.todayStatus === "Present" || e.todayStatus === "Half Day"), "employees", { hint: "Includes Half Day" });
  count("onLeave", "On Leave", activeEmps.filter((e) => e.todayStatus === "On Leave"), "employees");
  count("absent", "Absent", activeEmps.filter((e) => e.todayStatus === "Absent"), "employees");
  count("empTotal", "Total Employees Count", emps, "employees");
  count("empActive", "Active", activeEmps, "employees");
  count("onNotice", "On-Notice Period", emps.filter((e) => e.onNotice), "notice");
  count("left", "Left", emps.filter((e) => e.left), "left");
  count("assets", "Assets Assigned to", emps.filter((e) => (e.assets || []).length > 0), "assets");
  count("onboarding", "On-Boarding Count", hr.onboarding || [], "onboarding");
  // payout figures exist once Arshyan Profit is worked out on a case
  t._payoutCoverage = { nonMobile: nonMobile.filter((r) => r.arshyanProfit !== null && r.arshyanProfit !== undefined).length, nonMobileTotal: nonMobile.length,
    mobile: mobile.filter((r) => r.arshyanProfit !== null && r.arshyanProfit !== undefined).length, mobileTotal: mobile.length };
  return t;
};

// ============================================================
// DRILL-DOWN TABLE + EXCEL
// ============================================================
export const cellValue = (col, row) => { const v = col.get(row); return v === null || v === undefined ? "" : v; };
export const displayCell = (col, row) => {
  const v = cellValue(col, row);
  if (v === "") return col.type === "money" ? "—" : "";
  if (col.type === "money") return money(v);
  if (col.type === "date") return fmtDate(String(v));
  return String(v);
};
export const totalsFor = (cols, rows) => Object.fromEntries(cols.filter((col) => col.total).map((col) => [col.key, Math.round(rows.reduce((t, r) => t + n(cellValue(col, r)), 0) * 100) / 100]));
export const searchRows = (rows, cols, q) => {
  const s = String(q || "").trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((r) => cols.some((col) => String(cellValue(col, r)).toLowerCase().includes(s)));
};

/** Excel: title, filters, generated time, header, rows (numbers stay numbers), totals */
export const buildWorkbookAoa = ({ title, filtersText, cols, rows, generatedAt = new Date() }) => {
  const head = ["Sr. No.", ...cols.map((col) => col.label)];
  const body = rows.map((r, i) => [i + 1, ...cols.map((col) => {
    const v = cellValue(col, r);
    if (col.type === "money" || col.type === "number") return v === "" ? "" : Number(v);
    if (col.type === "date") return v ? fmtDate(String(v)) : "";
    return v;
  })]);
  const totals = totalsFor(cols, rows);
  const totalRow = Object.keys(totals).length ? ["Total", ...cols.map((col) => (col.key in totals ? totals[col.key] : ""))] : null;
  const stamp = generatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return [[title], ["Arshyan Insurance Marketing & Services Pvt Ltd"], [`Filters: ${filtersText || "None"}`], [`Generated: ${stamp} · ${rows.length} record(s)`], [], head, ...body, ...(totalRow ? [totalRow] : [])];
};
export const fileNameFor = (title) => `${String(title).replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${todayIst()}.xlsx`;
