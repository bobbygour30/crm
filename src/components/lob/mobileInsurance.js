// src/lob/mobileInsurance.js
// ============================================================
// Mobile Insurance (Mobile BRD) — shared helpers.
// The case form treats "Mobile Insurance" as the `electronic` section
// (older leads used the LOB "Mobile/Electronic Equipment Insurance").
// ============================================================

// ---- option lists ----
export const MOBILE_LOB = "Mobile Insurance";
export const MOBILE_DEVICE_TYPES = ["Mobile", "Laptop", "Tablet", "Other"];
export const MOBILE_TENURE_OPTIONS = ["1 Year", "2 Years", "3 Years"];
// Quote Work Flow insurer dropdown (BRD): TATA AIG / Bajaj General
export const MOBILE_INSURERS = ["TATA AIG GENERAL INSURANCE CO LTD", "BAJAJ GENERAL INSURANCE LTD"];
export const INVOICE_HOLDER_RELATIONS = ["Friend", "Father", "Mother", "Brother In-law", "Sister In-law", "Spouse", "Other"];
export const PAYMENT_TAKEN_MODES = ["URL", "QR"];
export const MOBILE_GST_PERCENT = 18;
export const MOBILE_GST_PAYOUT_PERCENT = 11.3; // BRD: "11.3% GST on Insurer PayOut"
export const MOBILE_MAX_DEVICE_AGE_YEARS = 3;
export const MOBILE_MIN_PHOTOS = 3;

// Product name by insurer (BRD: Bajaj -> "My Home", TATA -> "Smart Home")
export const productForInsurer = (insurer = "") => {
  const i = String(insurer).toLowerCase();
  if (i.includes("bajaj")) return "My Home";
  if (i.includes("tata")) return "Smart Home";
  return "";
};

/** Devices identified by IMEI (15 digits); laptops / others use a serial number */
export const usesImei = (deviceType) => deviceType === "Mobile" || deviceType === "Tablet";

/** "Company_Model_RAM_Storage" (BRD format) */
export const composeMakeModel = (d = {}) =>
  [d.deviceBrand, d.deviceModel, d.ram, d.storage].map((x) => String(x || "").trim()).filter(Boolean).join("_");

// ============================================================
// PREMIUM CHART (BRD sheet "Mobile Insurance Premium Chart")
// [from, to, 1Y net, 1Y GST, 1Y gross, 2Y net, 2Y GST, 2Y gross, 3Y net, 3Y GST, 3Y gross]
// ============================================================
export const MOBILE_PREMIUM_CHART = [
  [0, 20000, 1695, 305, 2000, 3916, 705, 4621, 6473, 1165, 7638],
  [20001, 30000, 2390, 430, 2820, 4503, 811, 5314, 6720, 1210, 7930],
  [30001, 40000, 2649, 477, 3126, 5031, 906, 5937, 5592, 1007, 6599],
  [40001, 50000, 2966, 534, 3500, 5401, 972, 6373, 8042, 1448, 9490],
  [50001, 75000, 4503, 811, 5314, 7414, 1335, 8749, 9914, 1785, 11699],
  [75001, 100000, 5295, 953, 6248, 9109, 1640, 10749, 12117, 2181, 14298],
  [100001, 125000, 6110, 1100, 7210, 11618, 2091, 13709, 17242, 3104, 20346],
  [125001, 150000, 6825, 1229, 8054, 13220, 2380, 15600, 18728, 3371, 22099],
  [150001, 200000, 9914, 1785, 11699, 18122, 3262, 21384, 28643, 5156, 33799],
  [200001, 250000, 12117, 2181, 14298, 22032, 3966, 25998, 34151, 6147, 40298],
];
export const MOBILE_CHART_MAX = MOBILE_PREMIUM_CHART[MOBILE_PREMIUM_CHART.length - 1][1];

const tenureYears = (tenure) => {
  const m = String(tenure || "").match(/\d+/);
  const y = m ? parseInt(m[0], 10) : 0;
  return y >= 1 && y <= 3 ? y : 0;
};

/**
 * Chart premium for an invoice value + tenure.
 * @returns {{net, gst, gross, band}} or null when outside the chart (then Admin enters it manually)
 */
export const getChartPremium = (invoiceValue, tenure) => {
  const v = Number(invoiceValue);
  const y = tenureYears(tenure);
  if (!(v > 0) || !y) return null;
  const row = MOBILE_PREMIUM_CHART.find(([from, to]) => v >= from && v <= to);
  if (!row) return null;
  const k = 2 + (y - 1) * 3;
  return { net: row[k], gst: row[k + 1], gross: row[k + 2], band: `₹${row[0].toLocaleString("en-IN")} – ₹${row[1].toLocaleString("en-IN")}` };
};

/** Purchase date rule: not in the future and not older than 3 years */
export const checkPurchaseDate = (value) => {
  if (!value) return "Date of Purchase is required";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Invalid Date of Purchase";
  const today = new Date();
  if (d > today) return "Date of Purchase cannot be in the future";
  const oldest = new Date(today);
  oldest.setFullYear(oldest.getFullYear() - MOBILE_MAX_DEVICE_AGE_YEARS);
  if (d < oldest) return `Device must not be older than ${MOBILE_MAX_DEVICE_AGE_YEARS} years`;
  return "";
};
export const purchaseDateBounds = () => {
  const today = new Date();
  const oldest = new Date(today);
  oldest.setFullYear(oldest.getFullYear() - MOBILE_MAX_DEVICE_AGE_YEARS);
  return { min: oldest.toISOString().split("T")[0], max: today.toISOString().split("T")[0] };
};

// ============================================================
// ARSHYAN CALCULATION + PROFIT (Mobile BRD)
//   Insurer Gross        = Insurer Net + 18% GST
//   PayOut in Value      = PayOut % x Insurer Net Premium
//   GST on PayOut        = PayOut x 11.3% (editable)      TDS = PayOut x 2%
//   Total PayOut         = PayOut + GST - TDS
//   Premium margin       = Chart Gross (paid by customer) - Insurer Gross (paid to insurer)
//   Arshyan PayOut on Mobile = Premium margin + Total PayOut
//   Arshyan Profit       = Arshyan PayOut on Mobile - Total Cashback / PayOut (store + promoter)
// ============================================================
const n = (v) => {
  const x = parseFloat(v);
  return isNaN(x) ? 0 : x;
};
const r2 = (v) => Math.round((n(v) + Number.EPSILON) * 100) / 100;

export const computeMobileProfit = ({ payout = {}, chartGross = 0, cashbackTotal = 0 }) => {
  const insurerNetPremium = r2(payout.insurerNetPremium);
  const insurerGstValue = r2((insurerNetPremium * MOBILE_GST_PERCENT) / 100);
  const insurerGrossPremium = r2(insurerNetPremium + insurerGstValue);
  const slab = n(payout.payoutSlabPercent);
  const gstPayoutPercent = payout.gstPayoutPercent === "" || payout.gstPayoutPercent === undefined ? MOBILE_GST_PAYOUT_PERCENT : n(payout.gstPayoutPercent);
  const tdsPercent = payout.tdsPercent === "" || payout.tdsPercent === undefined ? 2 : n(payout.tdsPercent);
  const insurerPayout = r2((insurerNetPremium * slab) / 100);
  const gstPayout = r2((insurerPayout * gstPayoutPercent) / 100);
  const tds = r2((insurerPayout * tdsPercent) / 100);
  const totalPayout = r2(insurerPayout + gstPayout - tds);
  const chartGrossPremium = r2(chartGross);
  const premiumMargin = r2(chartGrossPremium - insurerGrossPremium);
  const arshyanMobilePayout = r2(premiumMargin + totalPayout);
  const totalCashbackPayout = r2(cashbackTotal);
  const arshyanProfit = r2(arshyanMobilePayout - totalCashbackPayout);
  return {
    isMobile: true, instalment: false, paymentCount: 1,
    insurerNetPremium, insurerGstValue, insurerGrossPremium, gstPayoutPercent, tdsPercent,
    // same names as the other LOBs so lists / exports read them the same way
    netPerPayment: insurerNetPremium,
    insurerPayoutEach: insurerPayout, gstPayoutEach: gstPayout, tdsEach: tds, totalPayoutEach: totalPayout,
    totalInsurerPayout: insurerPayout, totalGstPayout: gstPayout, totalTds: tds, grandTotalPayout: totalPayout,
    chartGrossPremium, premiumMargin, arshyanMobilePayout, totalCashbackPayout, arshyanProfit,
  };
};

// ============================================================
// DOCUMENTS: the Quote and Policy Copy are generated on the server as PDFs on the
// Vidhant Associates letter head (backend/utils/vidhantDocuments.js) when the case
// is saved, and appear in the Documents folder.
// ============================================================
export const LETTER_HEAD_GROUP = "Letter Head (Auto Generated)";