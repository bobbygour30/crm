// src/lob/motorInsurance.js
// Shared Motor Insurance helpers used by LeadTable.jsx and EmployeeLeads.jsx
// (placed next to PersonalAccidentForm.jsx / TravelInsuranceForm.jsx so the
//  existing "../lob/..." import path works from both components)

// ============================================================
// MANUFACTURER LISTS
// ============================================================
export const TWO_WHEELER_MANUFACTURERS = [
  "Hero MotoCorp",
  "Bajaj Auto",
  "TVS Motor Company",
  "Honda Motorcycle & Scooter India",
  "India Yamaha Motor",
  "Suzuki Motorcycle India",
  "Royal Enfield",
  "Ather Energy",
  "Ola Electric",
  "Greaves Electric Mobility",
  "Revolt Motors",
  "River Mobility",
  "Oben Electric",
  "Ultraviolette Automotive",
  "BGauss",
  "PURE EV",
  "Simple Energy",
  "Kinetic Green Energy & Power Solutions",
  "KTM India",
  "Triumph Motorcycles India",
  "BMW Motorrad India",
  "Ducati India",
  "India Kawasaki Motors",
  "Piaggio Vehicles",
  "Harley-Davidson India",
  "Classic Legends",
  "Benelli India",
  "Keeway India",
  "Husqvarna Motorcycles India",
  "India Motorcycles",
  "Bounce Infinity",
  "Okinawa Autotech",
  "Wardwizard Innovations & Mobility",
  "Odysse Electric",
  "Komaki Electric",
  "Lectrix EV",
  "iVOOMi Energy",
  "Matter Motor Works",
  "Raptee.HV",
  "Kabira Mobility",
  "Tunwal E-Motors",
  "Okaya EV",
  "Evolet India",
  "Quantum Energy",
  "Atumobile",
  "BSA Motorcycles",
  "Kymco",
  "Zontes India",
  "QJMotor India",
  "Moto Guzzi India",
  "Aprilia India",
  "Vespa India",
  "LML",
  "Tork Motors",
  "Yulu",
  "YObykes",
  "Komaki",
  "Enigma Automobiles",
  "Zelio E Mobility",
  "Ujaas Energy",
  "E-Sprinto",
  "Crayon Motors",
  "Deltic",
  "Fujiyama Power Systems",
  "SVM",
  "ADMS",
  "Rissala Electric Motors",
  "Earth Energy EV",
  "EeVe India",
  "Benling India",
  "Birla E-Scooters",
  "BattRE Electric Mobility",
  "Jitendra New EV Tech",
  "Lohia Auto",
  "M2GO",
  "Shema Electric",
  "Nexzu Mobility",
  "Polarity Smart",
  "Emflux Motors",
  "Hero Electric",
];

export const FOUR_WHEELER_MANUFACTURERS = [
  "Maruti Suzuki India",
  "Hyundai Motor India",
  "Tata Motors",
  "Mahindra & Mahindra",
  "Toyota Kirloskar Motor",
  "Kia India",
  "Honda Cars India",
  "Renault India",
  "Nissan Motor India",
  "Volkswagen India",
  "Škoda Auto India",
  "MG Motor India",
  "BYD India",
  "Mercedes-Benz India",
  "BMW India",
  "Audi India",
  "Volvo Car India",
  "Jaguar Land Rover India",
  "Porsche India",
  "Lamborghini India",
  "Ferrari India",
  "Rolls-Royce Motor Cars",
  "Bentley Motors",
  "Lexus India",
  "Jeep India",
  "Citroën India",
  "Isuzu Motors India",
  "Force Motors",
  "Ashok Leyland",
  "SML Isuzu",
  "Eicher Motors",
  "VE Commercial Vehicles",
  "Daimler India Commercial Vehicles",
  "Volvo Trucks India",
  "Scania Commercial Vehicles India",
  "BharatBenz",
  "JBM Auto",
  "Olectra Greentech",
  "PMI Electro Mobility",
  "Euler Motors",
  "Switch Mobility",
  "Omega Seiki Mobility",
  "Montra Electric",
  "Mahindra Electric",
  "Tata Passenger Electric Mobility",
  "VinFast India",
  "Tesla India",
  "Hindustan Motors",
  "Premier Automobiles",
  "ICML (International Cars & Motors Ltd.)",
  "Pravaig Dynamics",
  "Motovolt Mobility",
  "EKA Mobility",
  "Ashok Leyland Electric Vehicles",
  "Maruti Suzuki Commercial",
  "Tata Daewoo Commercial Vehicle",
  "MAN Trucks India",
  "Kamaz Vectra Motors",
  "SANY India",
  "Caterpillar India",
];

export const OTHER_MANUFACTURER = "Other";

// Three-wheelers are built by both 2W makers (Bajaj, TVS, Piaggio, Kinetic Green…)
// and 4W/CV makers (Mahindra, Euler, Montra…), so they get the combined list.
const THREE_WHEELER_TYPES = ["e-Rickshaw", "Auto Rickshaw"];

const getBaseManufacturerList = (vehicleType) => {
  if (!vehicleType) return [];
  if (vehicleType === "Two Wheeler") return TWO_WHEELER_MANUFACTURERS;
  if (THREE_WHEELER_TYPES.includes(vehicleType)) {
    return [...new Set([...FOUR_WHEELER_MANUFACTURERS, ...TWO_WHEELER_MANUFACTURERS])];
  }
  // Private Car, Taxi, School Bus, Truck, Tractor, Commercial Vehicle
  return FOUR_WHEELER_MANUFACTURERS;
};

/**
 * Returns the dropdown options for a vehicle type (always ending with "Other").
 * `legacyValue` is set when an older saved lead has a manufacturer that is not
 * in the new list, so the select can still show it instead of going blank.
 */
export const getManufacturerOptions = (vehicleType, currentValue) => {
  const base = getBaseManufacturerList(vehicleType);
  const options = vehicleType ? [...base, OTHER_MANUFACTURER] : [];
  const legacyValue =
    currentValue && currentValue !== OTHER_MANUFACTURER && !base.includes(currentValue)
      ? currentValue
      : "";
  return { options, legacyValue, count: base.length };
};

export const isManufacturerValidForType = (vehicleType, manufacturer) =>
  !manufacturer ||
  manufacturer === OTHER_MANUFACTURER ||
  getBaseManufacturerList(vehicleType).includes(manufacturer);

export const getDisplayManufacturer = (motor) => {
  if (!motor?.manufacturer) return "";
  if (motor.manufacturer === OTHER_MANUFACTURER) {
    return motor.otherManufacturer ? `${motor.otherManufacturer} (Other)` : "Other";
  }
  return motor.manufacturer;
};

// ============================================================
// LOB DETECTION (same rules the components already used)
// ============================================================
export const isMotorLob = (lob) => {
  if (!lob) return false;
  return (
    lob.toLowerCase().includes("motor") ||
    lob.includes("Car") ||
    lob.includes("Two-Wheeler") ||
    lob.includes("Taxi") ||
    lob.includes("Commercial Vehicle") ||
    lob.includes("E-Rikshaw") ||
    lob.includes("School Bus") ||
    lob.includes("Truck") ||
    lob.includes("Tractor") ||
    lob.includes("Auto Rickshaw") ||
    lob === "Private Car-OD" ||
    lob === "Private Car-SOD" ||
    lob === "Private Car-Comprehensive" ||
    lob === "Private Car-TP" ||
    lob === "Taxi-Comprehensive" ||
    lob === "Taxi-TP" ||
    lob === "Commercial Vehicle-Comprehensive" ||
    lob === "Commercial Vehicle-TP" ||
    lob === "E-Rikshaw-TP" ||
    lob === "E-Rikshaw-Comprehensive" ||
    lob === "Two-Wheeler-TP"
  );
};

// ============================================================
// EMPTY MOTOR STATE
// ============================================================
export const emptyMotorDetails = () => ({
  vehicleType: "",
  previousInsuranceStatus: "",
  manufacturer: "",
  otherManufacturer: "",
  model: "",
  fuelType: "",
  rtoCode: "",
  chesisNo: "",
  yearOfManufacturing: "",
  monthOfManufacturing: "",
  idvAsPerInvoice: "",
  insuranceType: "",
  odDueDate: "",
  tpDueDate: "",
  policyNo: "",
  previousInsurerName: "",
  idvAsPerPYP: "",
  saodOdDueDate: "",
  saodTpDueDate: "",
  saodPolicyNo: "",
  saodPreviousInsurerName: "",
  saodIdvAsPerPYP: "",
  tpInsuranceDueDate: "",
  registrationNumber: "",
  autoRtoCode: "",
  claimTaken: "",
  ncb: "",
  addOnRequired: "",
  selectedAddOns: [],
  pypFile: null,
  rcFrontFile: null,
  rcBackFile: null,
  chesisPhoto: null,
  invoiceCopy: null,
});

// ============================================================
// MOTOR PAYOUT
// Motor payout is earned separately on the OD (Own Damage) premium and the
// TP (Third Party) premium, each with its own slab %. Which parts exist
// depends on the Insurance Type.
// ============================================================
const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const isBlank = (v) => v === "" || v === null || v === undefined;

export const getMotorPremiumParts = (insuranceType) => {
  if (insuranceType === "TP (Third Party)") return { hasOD: false, hasTP: true };
  if (insuranceType === "SAOD (On Damage)") return { hasOD: true, hasTP: false };
  // Comprehensive (OD+TP), all Bundle Packages, or not selected yet
  return { hasOD: true, hasTP: true };
};

export const computeMotorPayout = ({
  insuranceType,
  odPremium,
  tpPremium,
  odPayoutPercent,
  tpPayoutPercent,
  gstReturnSlabPercent,
  tdsPercent = 2,
  deduction = 0,
}) => {
  const { hasOD, hasTP } = getMotorPremiumParts(insuranceType);
  const od = hasOD ? num(odPremium) : 0;
  const tp = hasTP ? num(tpPremium) : 0;

  const odPayoutAmount = hasOD ? (od * num(odPayoutPercent)) / 100 : 0;
  const tpPayoutAmount = hasTP ? (tp * num(tpPayoutPercent)) / 100 : 0;
  const totalPayoutToReceive = odPayoutAmount + tpPayoutAmount;

  const gstReturnAmount = (totalPayoutToReceive * num(gstReturnSlabPercent)) / 100;
  const tdsAmount = (totalPayoutToReceive * num(tdsPercent)) / 100;
  const arshyanPayout = totalPayoutToReceive + gstReturnAmount - tdsAmount - num(deduction);

  return {
    hasOD,
    hasTP,
    odPremiumUsed: od,
    tpPremiumUsed: tp,
    premiumSplitTotal: od + tp,
    odPayoutAmount,
    tpPayoutAmount,
    totalPayoutToReceive,
    gstReturnAmount,
    tdsAmount,
    arshyanPayout,
    effectivePayoutPercent: od + tp > 0 ? (totalPayoutToReceive / (od + tp)) * 100 : 0,
  };
};

/**
 * Cross-validates motor payout inputs against the accepted quote.
 * Returns { errors: [{field, message}], warnings: [string] }.
 * Nothing is checked until the admin starts filling the payout.
 *
 * `fieldPrefix` lets each component map errors to its own data-field names.
 */
export const validateMotorPayout = (
  {
    insuranceType,
    netPremium,
    odPremium,
    tpPremium,
    odPayoutPercent,
    tpPayoutPercent,
    gstReturnSlabPercent,
    tdsPercent,
    deduction,
  },
  { fieldPrefix = "motor", labelPrefix = "" } = {}
) => {
  const errors = [];
  const warnings = [];
  const { hasOD, hasTP } = getMotorPremiumParts(insuranceType);
  const L = labelPrefix ? `${labelPrefix}: ` : "";

  const started = [odPremium, tpPremium, odPayoutPercent, tpPayoutPercent].some((v) => !isBlank(v));
  if (!started) return { errors, warnings };

  const add = (field, message) => errors.push({ field: `${fieldPrefix}${field}`, message: `${L}${message}` });

  if (!insuranceType) {
    add("InsuranceType", "Select the Insurance Type in Motor details before entering payout");
  }

  if (hasOD) {
    if (!(num(odPremium) > 0)) add("OdPremium", "OD Premium is required for this Insurance Type");
    if (isBlank(odPayoutPercent)) add("OdPayoutPercent", "OD PayOut % is required");
  } else if (num(odPremium) > 0) {
    add("OdPremium", "TP-only policy cannot have an OD Premium");
  }

  if (hasTP) {
    if (!(num(tpPremium) > 0)) add("TpPremium", "TP Premium is required for this Insurance Type");
    if (isBlank(tpPayoutPercent)) add("TpPayoutPercent", "TP PayOut % is required");
  } else if (num(tpPremium) > 0) {
    add("TpPremium", "SAOD policy cannot have a TP Premium");
  }

  const pctChecks = [
    [hasOD, odPayoutPercent, "OdPayoutPercent", "OD PayOut %"],
    [hasTP, tpPayoutPercent, "TpPayoutPercent", "TP PayOut %"],
    [true, gstReturnSlabPercent, "GstReturn", "GST % Return Slab"],
    [true, tdsPercent, "Tds", "TDS %"],
  ];
  pctChecks.forEach(([applies, value, field, label]) => {
    if (applies && !isBlank(value) && (num(value) < 0 || num(value) > 100)) {
      add(field, `${label} must be between 0 and 100`);
    }
  });

  // Core cross-check: OD + TP must add up to the accepted quote's Net Premium
  const net = num(netPremium);
  const od = hasOD ? num(odPremium) : 0;
  const tp = hasTP ? num(tpPremium) : 0;
  if (net <= 0) {
    add("NetPremium", "Accepted quote has no Net Premium. Enter it in the insurer quote first");
  } else if (od + tp > 0 && Math.abs(od + tp - net) > 1) {
    add(
      hasOD ? "OdPremium" : "TpPremium",
      `OD Premium (₹${od.toFixed(2)}) + TP Premium (₹${tp.toFixed(2)}) = ₹${(od + tp).toFixed(2)} does not match the quote Net Premium (₹${net.toFixed(2)})`
    );
  }

  // Soft checks
  const { totalPayoutToReceive } = computeMotorPayout({
    insuranceType, odPremium, tpPremium, odPayoutPercent, tpPayoutPercent,
  });
  if (num(deduction) > totalPayoutToReceive && totalPayoutToReceive > 0) {
    warnings.push(`${L}Commission/Discount (₹${num(deduction).toFixed(2)}) is more than the total PayOut (₹${totalPayoutToReceive.toFixed(2)}), so Arshyan Payout will be negative`);
  }
  if (hasTP && num(tpPayoutPercent) > num(odPayoutPercent) && hasOD && !isBlank(odPayoutPercent)) {
    warnings.push(`${L}TP PayOut % is higher than OD PayOut %. Double-check the slabs`);
  }

  return { errors, warnings };
};

// ============================================================
// ADMIN DETECTION
// The payout section used to check only localStorage.userRole === "Admin".
// If login stored the role in a different key, lowercase ("admin"), inside a
// user object, or only inside the JWT, payout was silently hidden.
// This checks all of those (the backend itself accepts role OR userType).
// ============================================================
const isAdminValue = (v) => typeof v === "string" && v.trim().toLowerCase() === "admin";

export const isAdminUser = () => {
  try {
    if (typeof localStorage === "undefined") return false;

    // 1. Plain keys
    for (const key of ["userRole", "role", "userType"]) {
      if (isAdminValue(localStorage.getItem(key))) return true;
    }

    // 2. Stored user objects
    for (const key of ["user", "userInfo", "currentUser", "authUser", "userData"]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const u = JSON.parse(raw);
        if ([u?.role, u?.userType, u?.user?.role, u?.user?.userType].some(isAdminValue)) return true;
      } catch { /* not JSON */ }
    }

    // 3. JWT payload
    const token = localStorage.getItem("token");
    if (token && token.split(".").length === 3) {
      const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=")));
      if ([payload?.role, payload?.userType, payload?.user?.role, payload?.user?.userType].some(isAdminValue)) return true;
    }
  } catch { /* fall through */ }
  return false;
};