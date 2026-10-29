// src/lob/LeadCaseForm.jsx
// ============================================================
// The staged lead form (BRD: HEALTH sheet) used by BOTH LeadTable.jsx and
// EmployeeLeads.jsx. Each module appears only after the previous one is
// completed with its "Next Module" action:
//
//   1 Lead            -> [Request for Quote]
//   2 Quote           -> [Request Quote Insurer-wise]
//   3 Quote Workflow  -> [Proceed with Accepted Quote]      (Admin)
//   4 Policy Issuance -> [Request for Payment URL]
//   5 Payment         -> [EMI / Premium Details]             (Admin)
//   6 EMI Dues        -> [PayOut & Cashback]  (not One Time)  (Admin)
//   7 Cashback        -> [Arshyan Profit]                     (Admin)
//   8 Arshyan Profit                                          (Admin)
//   + Documents
// ============================================================
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimes, FaCheck, FaCar, FaEdit, FaShieldAlt, FaMobileAlt, FaExclamationCircle, FaExclamationTriangle,
  FaSpinner, FaSave, FaLock, FaMicrophone, FaStop, FaArrowRight, FaHeartbeat, FaFileAlt, FaMoneyBillWave,
  FaClock, FaUsers, FaLink, FaBell, FaHandHoldingUsd, FaChartLine, FaFolderOpen, FaClipboardList, FaLockOpen,
} from "react-icons/fa";
import { PAQuoteSection, PAIssuanceSection, PA_SUM_INSURED } from "./PersonalAccidentForm";
import {
  MOBILE_DEVICE_TYPES, MOBILE_TENURE_OPTIONS, MOBILE_INSURERS, INVOICE_HOLDER_RELATIONS, PAYMENT_TAKEN_MODES,
  MOBILE_MIN_PHOTOS, MOBILE_CHART_MAX, productForInsurer, usesImei, purchaseDateBounds, composeMakeModel,
} from "./mobileInsurance";
import { TravelQuoteSection, TravelIssuanceSection } from "./TravelInsuranceForm";
import {
  OTHER_MANUFACTURER, getManufacturerOptions, isManufacturerValidForType, getMotorPremiumParts,
  MOTOR_POLICY_TYPES, MOTOR_POLICY_TYPE_LABELS, MOTOR_FUEL_OPTIONS, OWNER_TYPE_OPTIONS,
  PREVIOUS_POLICY_ACTIVE, PREVIOUS_POLICY_NOT_ACTIVE, NO_ADDON,
} from "./motorInsurance";
import {
  LOB_OPTIONS, SOURCE_OPTIONS, GENDER_OPTIONS, POLICY_TYPE_OPTIONS, QUALIFICATION_OPTIONS, OCCUPATION_OPTIONS,
  RELATIONSHIP_OPTIONS, YES_NO_OPTIONS, NCB_OPTIONS, VEHICLE_TYPE_OPTIONS, FUEL_TYPE_OPTIONS,
  PREVIOUS_INSURANCE_STATUS_OPTIONS, INSURANCE_TYPE_OPTIONS, DEVICE_TYPE_OPTIONS, INSURER_OPTIONS,
  POLICY_TENURE_OPTIONS, PAYMENT_TERM_OPTIONS, SUM_INSURED_OPTIONS, RIDER_OPTIONS, PREVIOUS_POLICY_CASE_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS, ADD_ON_OPTIONS, QUOTE_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS,
  ISSUANCE_STATUS_OPTIONS, CASHBACK_STATUS_OPTIONS, CASHBACK_PAYEE_OPTIONS,
  IDX, STAGES, stageIndex, getStage, isEmiEligibleLob, isKnownInsurer, computeQuote, fmt, num,
  deriveCaseStatus, statusBadgeClass, getIssuanceStatusOptions, PAYOUT_BASIS_OPTIONS, normalizeRegistration,
  PAYMENT_DONE, nextActionLabel,
  validateMobile, validateEmail, validateAadhaar, validatePAN, validatePIN, toUpperCase,
  getMaxDate, getODDueDateRestrictions, memberLabel, collectDocuments,
} from "./caseWorkflow";

// ============================================================
// SMALL BUILDING BLOCKS (module level so inputs keep focus)
// ============================================================
const cx = (...c) => c.filter(Boolean).join(" ");
const inputCls = (err, locked) =>
  cx("w-full p-2 border rounded-lg text-sm", err ? "border-red-500" : "border-gray-300", locked && "bg-gray-100 cursor-not-allowed");
const autoCls = "w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-sm";

const Field = ({ label, required, error, hint, className, children }) => (
  <div className={className}>
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ViewLink = ({ url, label = "View current file" }) =>
  typeof url === "string" && url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline block mb-1">
      {label}
    </a>
  ) : null;

const NewFileTag = ({ file }) => (file instanceof File ? <p className="text-xs text-green-600 mt-1">✓ {file.name} selected</p> : null);

/**
 * A module of the case. Once it has been submitted (the case moved past it) it is
 * read-only for everyone; only Admin sees an "Edit" button to unlock it again.
 */
const Section = ({ n, title, icon: Icon, adminOnly, tone = "indigo", status, children, lock }) => {
  const tones = {
    indigo: "border-indigo-200 text-indigo-700",
    emerald: "border-emerald-200 text-emerald-700",
    amber: "border-amber-200 text-amber-700",
    gray: "border-gray-200 text-gray-700",
  };
  const locked = !!lock?.locked;
  return (
    <section className={cx("border-t-2 pt-4 mt-6", tones[tone].split(" ")[0])} data-section={title}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className={cx("text-lg font-semibold flex items-center gap-2", tones[tone].split(" ")[1])}>
          {n && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-current/10 text-sm border border-current">{n}</span>}
          {Icon && <Icon />} {title}
        </h3>
        {adminOnly && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Admin</span>}
        {status && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{status}</span>}
        {lock?.submitted && (
          <span className={cx("text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1", locked ? "bg-gray-100 text-gray-600" : "bg-amber-50 text-amber-700")}>
            {locked ? <><FaLock className="h-2.5 w-2.5" /> Submitted</> : <><FaLockOpen className="h-2.5 w-2.5" /> Editing (Admin)</>}
          </span>
        )}
        {lock?.submitted && lock.canEdit && (
          <button
            type="button" onClick={locked ? lock.onEdit : lock.onLock}
            className={cx("ml-auto text-xs px-3 py-1 rounded-md border flex items-center gap-1",
              locked ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50" : "border-gray-300 text-gray-600 hover:bg-gray-50")}
          >
            {locked ? <><FaEdit /> Edit</> : <><FaLock /> Done editing</>}
          </button>
        )}
      </div>
      {/* a disabled fieldset makes every input inside read-only; links stay clickable */}
      <fieldset disabled={locked} className={cx("min-w-0 w-full border-0 p-0 m-0", locked && "opacity-90")}>
        {children}
      </fieldset>
    </section>
  );
};

const ReadOnlyNote = ({ children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2">
    <FaLock className="mt-0.5 text-gray-400 flex-shrink-0" /> <span>{children}</span>
  </div>
);

const StageStepper = ({ stages, current, labels = {} }) => {
  const ci = stageIndex(current);
  return (
    <ol className="flex flex-wrap gap-2 mb-2" aria-label="Case progress">
      {stages.map((s, i) => {
        const si = stageIndex(s.key);
        const done = si < ci;
        const active = s.key === current;
        return (
          <li
            key={s.key}
            className={cx(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
              done && "bg-emerald-50 border-emerald-300 text-emerald-700",
              active && "bg-indigo-600 border-indigo-600 text-white",
              !done && !active && "bg-white border-gray-200 text-gray-400"
            )}
            aria-current={active ? "step" : undefined}
          >
            {done ? <FaCheck className="h-2.5 w-2.5" /> : <span className="font-semibold">{i + 1}</span>}
            {labels[s.key] || s.label}
          </li>
        );
      })}
    </ol>
  );
};

// Multi-choice add-on picker (Motor BRD: "Multiple choice enabled")
// `exclusive`: an option that can only be chosen on its own (e.g. "No Add-on Required")
const AddOnPicker = ({ options, value = [], onChange, disabled, dataField, error, exclusive }) => {
  const toggle = (o, checked) => {
    if (!checked) return onChange(value.filter((x) => x !== o));
    if (exclusive && o === exclusive) return onChange([o]);
    return onChange([...value.filter((x) => x !== exclusive), o]);
  };
  return (
    <div
      data-field={dataField}
      className={cx("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-lg p-2 max-h-56 overflow-y-auto", error ? "border-red-500" : "border-gray-300", disabled && "bg-gray-50")}
    >
      {options.map((o) => (
        <label key={o} className={cx("flex items-center gap-2 text-sm", o === exclusive && "font-medium text-gray-800")}>
          <input type="checkbox" className="rounded text-indigo-600" disabled={disabled} checked={value.includes(o)} onChange={(e) => toggle(o, e.target.checked)} />
          {o}
        </label>
      ))}
      {error && <p className="text-red-500 text-xs sm:col-span-2 lg:col-span-3">{error}</p>}
    </div>
  );
};
// add-ons the customer asks for (motor): "No Add-on Required" first, then the list
const addOnChoice = (v) => ({ selectedAddOns: v, addOnRequired: v.includes(NO_ADDON) ? "No" : v.length ? "Yes" : "" });

const FileField = ({ label, required, error, dataField, value, onFile, accept = ".pdf,.jpg,.jpeg,.png", hint, className }) => (
  <Field label={label} required={required} error={error} hint={hint} className={className}>
    <ViewLink url={value} />
    <input data-field={dataField} type="file" accept={accept} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} className={inputCls(error)} />
    <NewFileTag file={value} />
  </Field>
);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const uniq = (arr) => [...new Set(arr.filter(Boolean))];

// BRD: "Discussion done yet - manual type and voice notes should be enabled"
const VoiceNoteButton = ({ onText }) => {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  useEffect(() => () => recRef.current?.stop?.(), []);
  if (!SR) return null;
  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results).slice(e.resultIndex).map((r) => r[0].transcript).join(" ").trim();
      if (text) onText(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className={cx(
        "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border",
        listening ? "bg-red-50 border-red-300 text-red-600" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
      )}
      aria-pressed={listening}
    >
      {listening ? <><FaStop /> Stop dictation</> : <><FaMicrophone /> Voice note</>}
    </button>
  );
};

// ============================================================
// COMPONENT
// ============================================================
export default function LeadCaseForm({
  c,
  mode = "edit",            // "create" | "edit"
  audience = "auto",        // "auto" | "employee" (employee panel: admin modules are not rendered at all)
  employees = [],
  channelPartners = [],
  isSubmitting = false,
  onCancel,
  onSave,                    // () => save current stage
  onAdvance,                 // () => validate + move to next stage
}) {
  const {
    formData, setFormData, healthDetails, setHealthDetails, motorDetails, setMotorDetails,
    electronicDetails, setElectronicDetails, paDetails, setPaDetails, travelDetails, setTravelDetails,
    workflowDetails, setWorkflowDetails, cashbackDetails, setCashbackDetails, payoutDetails, setPayoutDetails,
    caseStage, savedLead, quoteFiles, setQuoteFiles, validationErrors, validationPopup, setValidationPopup,
    showAddOnModal, setShowAddOnModal, isFetchingPin, pinFetchError,
    sections, stageIdx, isAdmin, instalment, acceptedQuote, sourceDependentField, visibleStages, nextStage, chartPremium,
    finalAmounts, emiAmounts, emiSchedule, cashbackCalc, profitCalc,
    toggleInsurer, updateQuote, updateMember, updateMemberRider, updatePortability, scrollToError,
  } = c;
  const err = validationErrors;
  const reached = (key) => stageIdx >= IDX[key];
  const employeeView = audience === "employee" || !isAdmin;
  const hideAdminModules = audience === "employee";
  const canEdit = (key) => getStage(key).access === "all" || isAdmin;
  const currentStageDef = { ...getStage(caseStage), next: nextActionLabel(caseStage, nextStage) };
  const canAdvance = !!nextStage && canEdit(caseStage);

  // ---- Submitted modules are locked; Admin can unlock one with "Edit" ----
  const [unlocked, setUnlocked] = useState({});
  useEffect(() => setUnlocked({}), [savedLead?._id, caseStage]);
  const isSubmitted = (key) => mode !== "create" && stageIdx > IDX[key];
  const sectionLocked = (key) => isSubmitted(key) && !(isAdmin && !hideAdminModules && unlocked[key]);
  const lockFor = (key) => ({
    submitted: isSubmitted(key),
    locked: sectionLocked(key),
    canEdit: isAdmin && !hideAdminModules,
    onEdit: () => setUnlocked((u) => ({ ...u, [key]: true })),
    onLock: () => setUnlocked((u) => ({ ...u, [key]: false })),
  });
  // after the employee's final submission (Request for Payment URL) the whole case is Admin-only
  // after the employee's final submission (leaving the Payment module) the case is Admin-only
  const employeeReadOnly = employeeView && stageIdx > IDX.Payment;

  const renderValidationPopup = () => {
    if (!validationPopup.show) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
        onClick={() => setValidationPopup({ show: false, errors: [] })}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          role="alertdialog" aria-modal="true" aria-label="Submission stopped" className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <FaExclamationCircle className="text-red-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Submission stopped</h3>
              <p className="text-sm text-gray-500">A wrong or missing step was found — nothing was saved. Fix these to continue:</p>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {validationPopup.errors.map((error, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200"
              >
                <span className="text-sm text-red-700">{error.message}</span>
                {error.field !== "general" && (
                  <button
                    onClick={() => scrollToError(error.field)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                  >
                    Go to Field
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t">
            <button
              onClick={() => setValidationPopup({ show: false, errors: [] })}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };


  // ============================================================
  // MOBILE INSURANCE (Mobile BRD) — Quote
  // ============================================================
  const setE = (patch) => setElectronicDetails((p) => ({ ...p, ...patch }));

  const DevicePhotos = ({ required }) => {
    const photos = electronicDetails.devicePhotos || [];
    return (
      <Field
        label={`Device Pictures (${MOBILE_MIN_PHOTOS}-4)${required ? " — Mandatory" : " (Not Mandatory)"}`} required={required}
        error={err.devicePhotos} className="sm:col-span-2 lg:col-span-3"
        hint={`${photos.length} added${required && photos.length < MOBILE_MIN_PHOTOS ? ` — add ${MOBILE_MIN_PHOTOS - photos.length} more` : ""}`}
      >
        <input
          data-field="devicePhotos" type="file" multiple accept=".jpg,.jpeg,.pdf" className={inputCls(err.devicePhotos)}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) setE({ devicePhotos: [...photos, ...files].slice(0, 6) });
            e.target.value = "";
          }}
        />
        {photos.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2">
            {photos.map((ph, i) => (
              <li key={i} className="text-xs border rounded-md px-2 py-1 flex items-center gap-2 bg-white">
                {typeof ph === "string" ? <a href={ph} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Photo {i + 1}</a> : <span className="text-green-700">✓ {ph.name}</span>}
                <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setE({ devicePhotos: photos.filter((_, k) => k !== i) })} className="text-gray-400 hover:text-red-600"><FaTimes className="h-2.5 w-2.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </Field>
    );
  };

  const renderMobileQuote = () => {
    const d = electronicDetails;
    const bounds = purchaseDateBounds();
    const outOfChart = Number(d.purchaseValue) > MOBILE_CHART_MAX;
    return (
      <div className="mb-6">
        <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2"><FaMobileAlt /> Mobile Insurance — Quote Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Policy Tenure" required error={err.policyTenure}>
            <select data-field="policyTenure" value={formData.policyTenure} onChange={(e) => setFormData((p) => ({ ...p, policyTenure: e.target.value }))} className={inputCls(err.policyTenure)}>
              <option value="">Select</option>
              {MOBILE_TENURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Invoice Price incl. GST / Sum Insured (₹)" required error={err.purchaseValue}>
            <input data-field="purchaseValue" type="text" inputMode="numeric" value={d.purchaseValue} onChange={(e) => setE({ purchaseValue: e.target.value.replace(/\D/g, "") })} className={inputCls(err.purchaseValue)} />
          </Field>
          <Field label="Premium (as per chart)" hint={outOfChart ? `Above ₹${MOBILE_CHART_MAX.toLocaleString("en-IN")} — Admin will enter the premium` : chartPremium ? `Band ${chartPremium.band}` : "Enter invoice price + tenure"}>
            <input type="text" readOnly value={chartPremium ? `₹ ${fmt(chartPremium.gross)} (net ${fmt(chartPremium.net)} + GST ${fmt(chartPremium.gst)})` : "—"} className={autoCls} />
          </Field>
          <Field label="Device Type" required error={err.deviceType}>
            <select data-field="deviceType" value={d.deviceType} onChange={(e) => setE({ deviceType: e.target.value })} className={inputCls(err.deviceType)}>
              <option value="">Select</option>
              {MOBILE_DEVICE_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          {d.deviceType === "Other" && (
            <Field label="Specify Device Type" required error={err.otherDeviceType}>
              <input data-field="otherDeviceType" type="text" value={d.otherDeviceType} onChange={(e) => setE({ otherDeviceType: e.target.value })} className={inputCls(err.otherDeviceType)} />
            </Field>
          )}
          <Field label="Date of Purchase" required error={err.dateOfPurchase} hint="Not older than 3 years, not a future date">
            <input data-field="dateOfPurchase" type="date" min={bounds.min} max={bounds.max} value={d.dateOfPurchase} onChange={(e) => setE({ dateOfPurchase: e.target.value })} className={inputCls(err.dateOfPurchase)} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Make and Model <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Company Name_Model_RAM_Internal Storage)</span></label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
              <input data-field="deviceBrand" type="text" placeholder="Company (e.g. Samsung)" value={d.deviceBrand} onChange={(e) => setE({ deviceBrand: e.target.value })} className={inputCls(err.deviceBrand)} aria-label="Company name" />
              <input data-field="deviceModel" type="text" placeholder="Model (e.g. Galaxy S24)" value={d.deviceModel} onChange={(e) => setE({ deviceModel: e.target.value })} className={inputCls(err.deviceModel)} aria-label="Model" />
              <input data-field="ram" type="text" placeholder="RAM (e.g. 8GB)" value={d.ram} onChange={(e) => setE({ ram: e.target.value.toUpperCase() })} className={inputCls(err.ram)} aria-label="RAM" />
              <input data-field="storage" type="text" placeholder="Storage (e.g. 256GB)" value={d.storage} onChange={(e) => setE({ storage: e.target.value.toUpperCase() })} className={inputCls(err.storage)} aria-label="Internal storage" />
            </div>
            {composeMakeModel(d) && <p className="text-xs text-gray-500 mt-1">Saved as: <span className="font-mono">{composeMakeModel(d)}</span></p>}
            {[err.deviceBrand, err.deviceModel, err.ram, err.storage].filter(Boolean).map((m) => <p key={m} className="text-red-500 text-xs mt-1">{m}</p>)}
          </div>
          <Field label="Full Address as per Aadhaar (with PIN code)" required error={err.addressAsPerAadhaar} className="sm:col-span-2 lg:col-span-3">
            <textarea data-field="addressAsPerAadhaar" rows="2" value={d.addressAsPerAadhaar} onChange={(e) => setE({ addressAsPerAadhaar: e.target.value })} className={inputCls(err.addressAsPerAadhaar)} placeholder={formData.pinCode ? `House, street, area, ${formData.city || "city"} - ${formData.pinCode}` : "House, street, area, city - PIN"} />
          </Field>
          <FileField label="Upload Invoice (Not Mandatory)" dataField="purchaseInvoice" value={d.purchaseInvoice} onFile={(f) => setE({ purchaseInvoice: f })} accept=".jpg,.jpeg,.pdf" hint="Becomes mandatory at Policy Issuance" />
          <DevicePhotos required={false} />
        </div>
      </div>
    );
  };

  // ============================================================
  // MOBILE INSURANCE — Policy Issuance
  // ============================================================
  const renderMobileIssuance = () => {
    const d = electronicDetails;
    const imei = usesImei(d.deviceType);
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FileField label={d.purchaseInvoice ? "Invoice" : "Upload Invoice (Mandatory)"} required error={err.purchaseInvoice} dataField="purchaseInvoice" value={d.purchaseInvoice} onFile={(f) => setE({ purchaseInvoice: f })} accept=".jpg,.jpeg,.pdf" hint={d.purchaseInvoice ? "From the Quote — replace if needed" : undefined} />
          <Field label={imei ? "IMEI Number" : "Serial Number"} required error={err.imeiNumber} hint={imei ? "Dial *#06# to see the IMEI" : undefined}>
            <input
              data-field="imeiNumber" type="text" inputMode={imei ? "numeric" : "text"} maxLength={imei ? 15 : 30} value={d.imeiNumber}
              onChange={(e) => setE({ imeiNumber: imei ? e.target.value.replace(/\D/g, "").slice(0, 15) : e.target.value.toUpperCase() })}
              className={inputCls(err.imeiNumber)}
            />
          </Field>
          <FileField label={imei ? "Upload IMEI Screenshot (Mandatory)" : "Upload Serial No. Photo (Mandatory)"} required error={err.imeiImage} dataField="imeiImage" value={d.imeiImage} onFile={(f) => setE({ imeiImage: f })} accept=".jpg,.jpeg,.pdf" />
          <DevicePhotos required />
          <Field label="Invoice in the Name of the Proposer?" required error={err.invoiceInProposerName}>
            <select data-field="invoiceInProposerName" value={d.invoiceInProposerName} onChange={(e) => setE({ invoiceInProposerName: e.target.value })} className={inputCls(err.invoiceInProposerName)}>
              <option value="">Select</option>
              {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          {d.invoiceInProposerName === "No" && (
            <Field label="Proposer's Relation with the Invoice Holder" required error={err.invoiceHolderRelation}>
              <select data-field="invoiceHolderRelation" value={d.invoiceHolderRelation} onChange={(e) => setE({ invoiceHolderRelation: e.target.value })} className={inputCls(err.invoiceHolderRelation)}>
                <option value="">Select</option>
                {INVOICE_HOLDER_RELATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          )}
          <Field label="Aadhaar Number" required error={err.electronicAadhaar}>
            <input data-field="electronicAadhaar" type="text" inputMode="numeric" maxLength="12" value={d.aadhaarNumber} onChange={(e) => setE({ aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} className={inputCls(err.electronicAadhaar)} />
          </Field>
          <FileField label="Upload Aadhaar (Mandatory)" required error={err.electronicAadhaarFile} dataField="electronicAadhaarFile" value={d.aadhaarFile} onFile={(f) => setE({ aadhaarFile: f })} />
          <Field label="PAN Number" error={err.electronicPan}>
            <input data-field="electronicPan" type="text" maxLength="10" value={d.panNumber} onChange={(e) => setE({ panNumber: e.target.value.toUpperCase().slice(0, 10) })} className={cx(inputCls(err.electronicPan), "uppercase")} placeholder="ABCDE1234F" />
          </Field>
          <FileField label="Upload PAN" dataField="electronicPanFile" value={d.panFile} onFile={(f) => setE({ panFile: f })} />
          {isAdmin && !employeeView && acceptedQuote && (
            <Field label="Pay Out on Net (%)" hint="Insurer payout % — Admin only">
              <input data-field="mobilePayout" type="number" min="0" max="100" value={acceptedQuote.payoutPercent ?? ""} onChange={(e) => updateQuote(acceptedQuote.insurerName, "payoutPercent", e.target.value)} className={inputCls()} />
            </Field>
          )}
          <Field label="Remarks (If Any)" className="sm:col-span-2 lg:col-span-3">
            <textarea rows="2" value={d.issuanceRemarks} onChange={(e) => setE({ issuanceRemarks: e.target.value })} className={inputCls()} />
          </Field>
        </div>
      </div>
    );
  };

  // ============================================================
  // 1. LEAD
  // ============================================================
  const renderLeadSection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Field label="Name" required error={err.name}>
        <input
          name="name" type="text" value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: toUpperCase(e.target.value) }))}
          className={cx(inputCls(err.name), "uppercase")} placeholder="Enter name in UPPERCASE"
        />
      </Field>
      <Field label="Gender">
        <select value={formData.gender} onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))} className={inputCls()}>
          <option value="">Select</option>
          {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Mobile Number" required error={err.mobileNo || (formData.mobileNo && !validateMobile(formData.mobileNo) ? "Enter 10 digits" : "")}>
        <input
          name="mobileNo" type="text" maxLength="10" value={formData.mobileNo}
          onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 10) setFormData((p) => ({ ...p, mobileNo: v })); }}
          className={inputCls(err.mobileNo)}
        />
      </Field>
      <Field label="E-mail ID" error={err.email || (formData.email && !validateEmail(formData.email) ? "Invalid email format" : "")}>
        <input name="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className={inputCls(err.email)} />
      </Field>
      <Field label="Pin/Zip Code" error={err.pinCode || (formData.pinCode?.length === 6 && pinFetchError ? pinFetchError : "")}>
        <div className="relative">
          <input
            name="pinCode" type="text" maxLength="6" value={formData.pinCode} placeholder="Enter 6 digit PIN code"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 6) setFormData((p) => ({ ...p, pinCode: v, ...(v.length < 6 ? { state: "", city: "" } : {}) }));
            }}
            className={cx(inputCls(err.pinCode), "pr-10")}
          />
          {isFetchingPin && <FaSpinner className="animate-spin text-indigo-500 h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2" />}
        </div>
        {validatePIN(formData.pinCode || "") && formData.state && (
          <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><FaCheck className="h-3 w-3" /> {formData.city}, {formData.state}</p>
        )}
      </Field>
      <Field label="State" hint="Auto-fetched from PIN">
        <input type="text" value={formData.state} readOnly className={autoCls} />
      </Field>
      <Field label="City" hint="Auto-fetched from PIN">
        <input type="text" value={formData.city} readOnly className={autoCls} />
      </Field>
      <Field label="Source">
        <select value={formData.source} onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value, sourceDependentValue: "" }))} className={inputCls()}>
          <option value="">Select</option>
          {SOURCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
      {sourceDependentField && (
        <Field label={`Source By — ${sourceDependentField}`}>
          {formData.source === "Employee" && employees.length > 0 ? (
            <select value={formData.sourceDependentValue} onChange={(e) => setFormData((p) => ({ ...p, sourceDependentValue: e.target.value }))} className={inputCls()}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.fullName || emp.username}>
                  {emp.fullName || emp.username} {emp.employeeId ? `(${emp.employeeId})` : ""}
                </option>
              ))}
            </select>
          ) : formData.source === "Channel Partner" && channelPartners.length > 0 ? (
            <select value={formData.sourceDependentValue} onChange={(e) => setFormData((p) => ({ ...p, sourceDependentValue: e.target.value }))} className={inputCls()}>
              <option value="">Select Channel Partner</option>
              {channelPartners.map((cp) => (
                <option key={cp._id} value={cp.fullName || cp.username}>
                  {cp.fullName || cp.username} {cp.companyName ? `(${cp.companyName})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input type="text" value={formData.sourceDependentValue} onChange={(e) => setFormData((p) => ({ ...p, sourceDependentValue: e.target.value }))} className={inputCls()} placeholder={`Enter ${sourceDependentField}`} />
          )}
        </Field>
      )}
      <Field label="LOB" required error={err.lob} hint={stageIdx > IDX.Lead ? "Changing the LOB changes which Quote details are asked" : undefined}>
        <select name="lob" value={formData.lob} onChange={(e) => setFormData((p) => ({ ...p, lob: e.target.value }))} className={inputCls(err.lob)}>
          <option value="">-- Select LOB --</option>
          {formData.lob && !LOB_OPTIONS.includes(formData.lob) && <option value={formData.lob}>{formData.lob} (old)</option>}
          {LOB_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
      {sections.motor && (
        <>
          <Field label="Vehicle Type" required error={err.vehicleType}>
            <select
              data-field="vehicleType" value={motorDetails.vehicleType} className={inputCls(err.vehicleType)}
              onChange={(e) => {
                const v = e.target.value;
                setMotorDetails((p) => (isManufacturerValidForType(v, p.manufacturer) ? { ...p, vehicleType: v } : { ...p, vehicleType: v, manufacturer: "", otherManufacturer: "" }));
              }}
            >
              <option value="">Select Vehicle Type</option>
              {VEHICLE_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field
            label="Policy Type" required error={err.motorPolicyType}
            hint={motorDetails.policyType === "SAOD" ? "Own Damage only — the vehicle must already have an active TP policy" : undefined}
          >
            <select data-field="motorPolicyType" value={motorDetails.policyType} onChange={(e) => setMotorDetails((p) => ({ ...p, policyType: e.target.value }))} className={inputCls(err.motorPolicyType)}>
              <option value="">Select Policy Type</option>
              {MOTOR_POLICY_TYPES.map((o) => <option key={o} value={o}>{MOTOR_POLICY_TYPE_LABELS[o]}</option>)}
            </select>
          </Field>
        </>
      )}
      <div className="sm:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Discussion Done Yet (Remarks)</label>
          <VoiceNoteButton onText={(t) => setFormData((p) => ({ ...p, remarks: p.remarks ? `${p.remarks} ${t}` : t }))} />
        </div>
        <textarea
          value={formData.remarks} rows="2" placeholder="Type, or use Voice note to dictate"
          onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))}
          className={inputCls()}
        />
      </div>
    </div>
  );

  // ============================================================
  // 2. QUOTE — Health
  // ============================================================
  const renderHealthQuote = () => {
    const h = healthDetails;
    const setH = (patch) => setHealthDetails((p) => ({ ...p, ...patch }));
    const maxDate = getMaxDate();
    return (
      <div className="mb-6">
        <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2"><FaHeartbeat /> Health Quote Details</h4>

        <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Active Previous Policy?" required error={err.hasPreviousPolicy}>
            <select
              data-field="hasPreviousPolicy" value={h.hasPreviousPolicy} className={cx(inputCls(err.hasPreviousPolicy), "bg-white")}
              onChange={(e) => {
                const v = e.target.value;
                setH(v === "Yes" ? { hasPreviousPolicy: v } : {
                  hasPreviousPolicy: v, previousPolicyCase: "", experienceYears: "", portabilityDetails: [],
                  renewalDetails: { insurerName: "", policyNumber: "", policyDueDate: "", uploadPolicy: null },
                });
              }}
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          {h.hasPreviousPolicy === "Yes" && (
            <Field label="Previous Policy Case" required error={err.previousPolicyCase}>
              <select data-field="previousPolicyCase" value={h.previousPolicyCase} onChange={(e) => setH({ previousPolicyCase: e.target.value })} className={cx(inputCls(err.previousPolicyCase), "bg-white")}>
                <option value="">Select</option>
                {PREVIOUS_POLICY_CASE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          )}
          {h.hasPreviousPolicy === "Yes" && h.previousPolicyCase === "Portability Case" && (
            <Field label="How many years Experience / Old is the Policy?" required error={err.experienceYears} hint="Details for each previous year are filled at Policy Issuance.">
              <select data-field="experienceYears" value={h.experienceYears} onChange={(e) => setH({ experienceYears: e.target.value })} className={cx(inputCls(err.experienceYears), "bg-white")}>
                <option value="">Select</option>
                {EXPERIENCE_YEARS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          )}
          {h.hasPreviousPolicy === "Yes" && h.previousPolicyCase === "Fresh Case" && (
            <p className="text-sm text-green-700 self-end">Fresh Case — no previous policy details required.</p>
          )}
          {h.hasPreviousPolicy === "Yes" && h.previousPolicyCase === "Renew Case" && (
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Renewal — Insurer Name" required error={err.renewalInsurer}>
                <select data-field="renewalInsurer" value={h.renewalDetails?.insurerName || ""} onChange={(e) => setH({ renewalDetails: { ...h.renewalDetails, insurerName: e.target.value } })} className={cx(inputCls(err.renewalInsurer), "bg-white")}>
                  <option value="">Select Insurer</option>
                  {INSURER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Policy No" required error={err.renewalPolicy}>
                <input data-field="renewalPolicy" type="text" value={h.renewalDetails?.policyNumber || ""} onChange={(e) => setH({ renewalDetails: { ...h.renewalDetails, policyNumber: e.target.value } })} className={cx(inputCls(err.renewalPolicy), "bg-white")} />
              </Field>
              <Field label="Policy Due Date" required error={err.renewalDueDate} hint="Within 60 days before/after today">
                <input
                  data-field="renewalDueDate" type="date" value={h.renewalDetails?.policyDueDate || ""} className={cx(inputCls(err.renewalDueDate), "bg-white")}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    const lo = new Date(); lo.setDate(lo.getDate() - 60);
                    const hi = new Date(); hi.setDate(hi.getDate() + 60);
                    if (d >= lo && d <= hi) setH({ renewalDetails: { ...h.renewalDetails, policyDueDate: e.target.value } });
                    else alert("Due date must be within 60 days before or 60 days after today");
                  }}
                />
              </Field>
              <Field label="Upload Policy (Not Mandatory)">
                <ViewLink url={h.renewalDetails?.uploadPolicy} label="View current policy file" />
                <input type="file" accept=".pdf" onChange={(e) => e.target.files[0] && setH({ renewalDetails: { ...h.renewalDetails, uploadPolicy: e.target.files[0] } })} className={cx(inputCls(), "bg-white")} />
                <NewFileTag file={h.renewalDetails?.uploadPolicy} />
              </Field>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Policy Type" required error={err.policyType}>
            <select
              data-field="policyType" value={h.policyType} className={inputCls(err.policyType)}
              onChange={(e) => setH(e.target.value === "Individual" ? { policyType: e.target.value, numberOfAdults: 1, numberOfChildren: 0 } : { policyType: e.target.value })}
            >
              <option value="">Select</option>
              {POLICY_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Policy Tenure" required error={err.policyTenure}>
            <select data-field="policyTenure" value={formData.policyTenure} onChange={(e) => setFormData((p) => ({ ...p, policyTenure: e.target.value }))} className={inputCls(err.policyTenure)}>
              <option value="">Select</option>
              {POLICY_TENURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Paying Term" required error={err.paymentTerm} hint={instalment ? (employeeView ? "Premium will be collected in instalments" : "EMI Dues will be tracked after the policy is issued") : undefined}>
            <select data-field="paymentTerm" value={formData.paymentTerm} onChange={(e) => setFormData((p) => ({ ...p, paymentTerm: e.target.value }))} className={inputCls(err.paymentTerm)}>
              <option value="">Select</option>
              {PAYMENT_TERM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Sum Insured" required error={err.sumInsured}>
            <select data-field="sumInsured" value={formData.sumInsured} onChange={(e) => setFormData((p) => ({ ...p, sumInsured: e.target.value }))} className={inputCls(err.sumInsured)}>
              <option value="">Select</option>
              {formData.sumInsured && !SUM_INSURED_OPTIONS.includes(formData.sumInsured) && <option value={formData.sumInsured}>{formData.sumInsured}</option>}
              {SUM_INSURED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Proposer Name" required error={err.proposerName} hint="Taken from the lead — you can change it">
            <input data-field="proposerName" type="text" value={h.proposerName} onChange={(e) => setH({ proposerName: toUpperCase(e.target.value) })} className={cx(inputCls(err.proposerName), "uppercase")} />
          </Field>
          <Field label="Proposer DOB" required error={err.proposerDOB}>
            <input data-field="proposerDOB" type="date" max={maxDate} value={h.proposerDOB} onChange={(e) => setH({ proposerDOB: e.target.value })} className={inputCls(err.proposerDOB)} />
          </Field>
          <Field label="Senior Most DOB" required={h.policyType === "Floater"} error={err.seniorOneDOB}>
            <input data-field="seniorOneDOB" type="date" max={maxDate} value={h.seniorOneDOB} onChange={(e) => setH({ seniorOneDOB: e.target.value })} className={inputCls(err.seniorOneDOB)} />
          </Field>
          <Field label="Proposer is a Member of the Plan?" required error={err.proposerIsMember}>
            <select data-field="proposerIsMember" value={h.proposerIsMember} onChange={(e) => setH({ proposerIsMember: e.target.value })} className={inputCls(err.proposerIsMember)}>
              <option value="">Select</option>
              {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          {h.policyType === "Floater" && (
            <>
              <Field label="No. of Adults (incl. Proposer if member)" required error={err.numberOfAdults}>
                <input data-field="numberOfAdults" type="number" min="1" value={h.numberOfAdults} onChange={(e) => setH({ numberOfAdults: e.target.value })} className={inputCls(err.numberOfAdults)} />
              </Field>
              <Field label="No. of Children">
                <input type="number" min="0" value={h.numberOfChildren} onChange={(e) => setH({ numberOfChildren: e.target.value })} className={inputCls()} />
              </Field>
            </>
          )}
          <Field label="PED, If Any" className="sm:col-span-2 lg:col-span-3">
            <textarea value={h.medicalRemarks || ""} rows="2" placeholder="Pre-existing diseases / treatment history" onChange={(e) => setH({ medicalRemarks: e.target.value })} className={inputCls()} />
          </Field>
        </div>
      </div>
    );
  };

  // QUOTE — generic policy terms for non-health LOBs
  const renderPolicyTerms = () => {
    const termOptions = isEmiEligibleLob(formData.lob) ? PAYMENT_TERM_OPTIONS : ["One Time"];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Field label="Policy Tenure" hint={sections.motor ? "Used for the policy expiry date (default 1 year)" : undefined}>
          <select data-field="policyTenure" value={formData.policyTenure} onChange={(e) => setFormData((p) => ({ ...p, policyTenure: e.target.value }))} className={inputCls()}>
            <option value="">Select</option>
            {POLICY_TENURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        {sections.motor ? (
          <Field label="Paying Term" hint="Motor premium is paid once">
            <input type="text" readOnly value="One Time" className={autoCls} />
          </Field>
        ) : (
          <Field label="Paying Term">
            <select data-field="paymentTerm" value={formData.paymentTerm} onChange={(e) => setFormData((p) => ({ ...p, paymentTerm: e.target.value }))} className={inputCls()}>
              <option value="">Select</option>
              {formData.paymentTerm && !termOptions.includes(formData.paymentTerm) && <option value={formData.paymentTerm}>{formData.paymentTerm}</option>}
              {termOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        )}
        {!sections.motor && (
          <Field label="Sum Insured">
            <select value={formData.sumInsured} onChange={(e) => setFormData((p) => ({ ...p, sumInsured: e.target.value }))} className={inputCls()}>
              <option value="">Select</option>
              {formData.sumInsured && !SUM_INSURED_OPTIONS.includes(formData.sumInsured) && <option value={formData.sumInsured}>{formData.sumInsured}</option>}
              {SUM_INSURED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        )}
      </div>
    );
  };

  // ============================================================
  // 2. QUOTE — Motor (Motor BRD: one layout per policy type)
  // ============================================================
  const setM = (patch) => setMotorDetails((p) => ({ ...p, ...patch }));
  const motorAddOnOptions = () =>
    motorDetails.policyType === "TP" ? ["Owner-Driver PA"] : ADD_ON_OPTIONS;

  const renderRcUploads = (required) => (
    <>
      <FileField label="Upload RC — Front" required={required} error={err.rcFrontFile} dataField="rcFrontFile" value={motorDetails.rcFrontFile} onFile={(f) => setM({ rcFrontFile: f })} />
      <FileField label="Upload RC — Back" required={required} error={err.rcBackFile} dataField="rcBackFile" value={motorDetails.rcBackFile} onFile={(f) => setM({ rcBackFile: f })} />
    </>
  );

  const renderMotorQuote = () => {
    const m = motorDetails;
    if (!m.vehicleType || !m.policyType) {
      return <div className="mb-6"><ReadOnlyNote>Select the Vehicle Type and Policy Type in the Lead module first.</ReadOnlyNote></div>;
    }
    const heading = (
      <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2">
        <FaCar /> Motor Quote — {MOTOR_POLICY_TYPE_LABELS[m.policyType]} · {m.vehicleType}
      </h4>
    );

    // ---------------- Brand New ----------------
    if (m.policyType === "Brand New") {
      const { options: makes, legacyValue } = getManufacturerOptions(m.vehicleType, m.manufacturer);
      const year = new Date().getFullYear();
      const years = [year, year - 1, year - 2];
      if (m.yearOfManufacturing && !years.includes(Number(m.yearOfManufacturing))) years.push(Number(m.yearOfManufacturing));
      return (
        <div className="mb-6">
          {heading}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="RTO" required error={err.rtoCode} hint="e.g. BR01 / DL11">
              <input data-field="rtoCode" type="text" maxLength="5" value={m.rtoCode} onChange={(e) => setM({ rtoCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} className={cx(inputCls(err.rtoCode), "uppercase")} />
            </Field>
            <Field label="Make / Manufacturer" required error={err.manufacturer} hint={`${makes.length - 1} makes for ${m.vehicleType}. Not listed? Choose Other.`}>
              <select data-field="manufacturer" value={m.manufacturer} onChange={(e) => setM({ manufacturer: e.target.value, otherManufacturer: e.target.value === OTHER_MANUFACTURER ? m.otherManufacturer : "" })} className={inputCls(err.manufacturer)}>
                <option value="">Select Make</option>
                {legacyValue && <option value={legacyValue}>{legacyValue} (saved earlier)</option>}
                {makes.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            {m.manufacturer === OTHER_MANUFACTURER && (
              <Field label="Manufacturer Name" required error={err.otherManufacturer}>
                <input data-field="otherManufacturer" type="text" value={m.otherManufacturer} onChange={(e) => setM({ otherManufacturer: e.target.value })} className={inputCls(err.otherManufacturer)} />
              </Field>
            )}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Model <span className="text-red-500">*</span></label>
                <VoiceNoteButton onText={(t) => setMotorDetails((p) => ({ ...p, model: p.model ? `${p.model} ${t}` : t }))} />
              </div>
              <input data-field="model" type="text" value={m.model} onChange={(e) => setM({ model: e.target.value })} className={inputCls(err.model)} placeholder="Type or dictate the model" />
              {err.model && <p className="text-red-500 text-xs mt-1">{err.model}</p>}
            </div>
            <Field label="Fuel" required error={err.fuelType}>
              <select data-field="fuelType" value={m.fuelType} onChange={(e) => setM({ fuelType: e.target.value })} className={inputCls(err.fuelType)}>
                <option value="">Select Fuel</option>
                {m.fuelType && !MOTOR_FUEL_OPTIONS.includes(m.fuelType) && <option value={m.fuelType}>{m.fuelType}</option>}
                {MOTOR_FUEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Variant" hint="As written on the invoice / quotation">
              <input data-field="variant" type="text" value={m.variant} onChange={(e) => setM({ variant: e.target.value })} className={inputCls()} />
            </Field>
            <Field label="Manufacturer Date (MM/YYYY)" required error={err.monthOfManufacturing}>
              <div className="flex gap-2">
                <select data-field="monthOfManufacturing" value={m.monthOfManufacturing} onChange={(e) => setM({ monthOfManufacturing: e.target.value })} className={inputCls(err.monthOfManufacturing)}>
                  <option value="">Month</option>
                  {MONTHS.map((o, i) => <option key={o} value={o}>{String(i + 1).padStart(2, "0")} — {o}</option>)}
                </select>
                <select aria-label="Year of manufacturing" value={m.yearOfManufacturing} onChange={(e) => setM({ yearOfManufacturing: e.target.value })} className={inputCls(err.monthOfManufacturing && !m.yearOfManufacturing)}>
                  <option value="">Year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Type of Owner" required error={err.ownerType}>
              <select data-field="ownerType" value={m.ownerType} onChange={(e) => setM({ ownerType: e.target.value })} className={inputCls(err.ownerType)}>
                <option value="">Select</option>
                {OWNER_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="IDV (₹)" required error={err.idvAsPerInvoice}>
              <input data-field="idvAsPerInvoice" type="text" inputMode="numeric" value={m.idvAsPerInvoice} onChange={(e) => setM({ idvAsPerInvoice: e.target.value.replace(/\D/g, "") })} className={inputCls(err.idvAsPerInvoice)} />
            </Field>
            <FileField label="Upload Invoice (Not Mandatory)" dataField="invoiceCopy" value={m.invoiceCopy} onFile={(f) => setM({ invoiceCopy: f })} hint="Becomes mandatory at Policy Issuance" />
            <Field label="Add-ons" required className="sm:col-span-2 lg:col-span-3">
              <AddOnPicker options={[NO_ADDON, ...ADD_ON_OPTIONS]} exclusive={NO_ADDON} dataField="selectedAddOns" error={err.selectedAddOns} value={m.selectedAddOns || []} onChange={(v) => setM(addOnChoice(v))} />
            </Field>
          </div>
        </div>
      );
    }

    // ---------------- SAOD / Comprehensive / TP ----------------
    const active = m.previousInsuranceStatus === PREVIOUS_POLICY_ACTIVE;
    const notActive = m.previousInsuranceStatus === PREVIOUS_POLICY_NOT_ACTIVE;
    const isTP = m.policyType === "TP";
    const tpAddOn = (m.selectedAddOns || []).includes("Owner-Driver PA") ? "Owner-Driver PA" : m.addOnRequired === "No" ? "Not Required" : "";
    return (
      <div className="mb-6">
        {heading}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Registration No." required error={err.registrationNumber} hint={m.autoRtoCode ? `RTO: ${m.autoRtoCode}` : "e.g. BR01BS6139"}>
            <input
              data-field="registrationNumber" type="text" maxLength="13" value={m.registrationNumber} className={cx(inputCls(err.registrationNumber), "uppercase")}
              onChange={(e) => setM({ registrationNumber: normalizeRegistration(e.target.value) })}
            />
          </Field>
          <Field label="Previous Insurance Status" required error={err.previousInsuranceStatus}>
            <select data-field="previousInsuranceStatus" value={m.previousInsuranceStatus} onChange={(e) => setM({ previousInsuranceStatus: e.target.value })} className={inputCls(err.previousInsuranceStatus)}>
              <option value="">Select</option>
              <option value={PREVIOUS_POLICY_ACTIVE}>Active</option>
              <option value={PREVIOUS_POLICY_NOT_ACTIVE}>Not Active</option>
            </select>
          </Field>

          {active && (
            <>
              <Field label="Insurer Name" required error={err.previousInsurerName}>
                <select data-field="previousInsurerName" value={m.previousInsurerName} onChange={(e) => setM({ previousInsurerName: e.target.value })} className={inputCls(err.previousInsurerName)}>
                  <option value="">Select Insurer</option>
                  {m.previousInsurerName && !INSURER_OPTIONS.includes(m.previousInsurerName) && <option value={m.previousInsurerName}>{m.previousInsurerName}</option>}
                  {INSURER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              {!isTP && (
                <Field label="IDV (₹)" required error={err.idvAsPerPYP}>
                  <input data-field="idvAsPerPYP" type="text" inputMode="numeric" value={m.idvAsPerPYP} onChange={(e) => setM({ idvAsPerPYP: e.target.value.replace(/\D/g, "") })} className={inputCls(err.idvAsPerPYP)} />
                </Field>
              )}
              <Field label="Policy Expiry Date OD" required={!isTP} error={err.odDueDate}>
                <input data-field="odDueDate" type="date" value={m.odDueDate} onChange={(e) => setM({ odDueDate: e.target.value })} className={inputCls(err.odDueDate)} />
              </Field>
              <Field label="Policy Expiry Date TP" required error={err.tpDueDate}>
                <input data-field="tpDueDate" type="date" value={m.tpDueDate} onChange={(e) => setM({ tpDueDate: e.target.value })} className={inputCls(err.tpDueDate)} />
              </Field>
            </>
          )}

          {notActive && !isTP && (
            <Field label="IDV Required for (₹)" required error={err.idvRequired}>
              <input data-field="idvRequired" type="text" inputMode="numeric" value={m.idvRequired} onChange={(e) => setM({ idvRequired: e.target.value.replace(/\D/g, "") })} className={inputCls(err.idvRequired)} />
            </Field>
          )}

          {(active || notActive) && renderRcUploads(true)}
          {active && !isTP && (
            <FileField label="Upload PYP for NCB Discount (Not Mandatory)" dataField="pypFile" value={m.pypFile} onFile={(f) => setM({ pypFile: f })} accept=".pdf,.jpg,.jpeg,.png" />
          )}

          {active && !isTP && (
            <>
              <Field label="Claim Taken in Active Policy" required error={err.claimTaken}>
                <select data-field="claimTaken" value={m.claimTaken} onChange={(e) => setM({ claimTaken: e.target.value, ncb: e.target.value === "Yes" ? "0%" : m.ncb === "0%" ? "" : m.ncb })} className={inputCls(err.claimTaken)}>
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              {m.claimTaken === "No" && (
                <Field label="NCB in Current Policy" required error={err.ncb}>
                  <select data-field="ncb" value={m.ncb} onChange={(e) => setM({ ncb: e.target.value })} className={inputCls(err.ncb)}>
                    <option value="">Select NCB</option>
                    {NCB_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              )}
              {m.claimTaken === "Yes" && (
                <Field label="NCB in Current Policy" hint="Claim taken → NCB resets to 0%"><input type="text" readOnly value="0%" className={autoCls} /></Field>
              )}
            </>
          )}

          {isTP ? (
            <Field label="Add-on" required error={err.tpAddOn}>
              <select
                data-field="tpAddOn" value={tpAddOn} className={inputCls(err.tpAddOn)}
                onChange={(e) => setM(e.target.value === "Owner-Driver PA" ? { selectedAddOns: ["Owner-Driver PA"], addOnRequired: "Yes" } : { selectedAddOns: [], addOnRequired: e.target.value ? "No" : "" })}
              >
                <option value="">Select</option>
                <option value="Owner-Driver PA">Owner-Driver PA</option>
                <option value="Not Required">Not Required</option>
              </select>
            </Field>
          ) : (active || notActive) && (
            <Field label="Add-ons Required" required className="sm:col-span-2 lg:col-span-3">
              <AddOnPicker options={[NO_ADDON, ...ADD_ON_OPTIONS]} exclusive={NO_ADDON} dataField="selectedAddOns" error={err.selectedAddOns} value={m.selectedAddOns || []} onChange={(v) => setM(addOnChoice(v))} />
            </Field>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // 4. POLICY ISSUANCE — Motor
  // ============================================================
  const renderMotorIssuance = () => {
    const m = motorDetails;
    const corporate = m.ownerType === "Corporate";
    const maxDate = getMaxDate();
    const addOnOptions = m.policyType === "TP" ? ["Owner-Driver PA"] : uniq([...(acceptedQuote?.acceptedAddOns || []), ...ADD_ON_OPTIONS]);
    return (
      <div className="space-y-5">
        <div>
          <h4 className="text-md font-semibold text-indigo-600 mb-1">Add-ons in the Policy</h4>
          <p className="text-xs text-gray-500 mb-2">
            {acceptedQuote?.acceptedAddOns?.length ? `Taken from what ${acceptedQuote.insurerName} accepted — adjust if needed.` : "Select the add-ons the insurer accepted."}
          </p>
          <AddOnPicker options={addOnOptions} value={m.finalAddOns || []} onChange={(v) => setM({ finalAddOns: v })} dataField="finalAddOns" />
        </div>

        <div>
          <h4 className="text-md font-semibold text-indigo-600 mb-3">Proposer Details{corporate ? " (Corporate owner)" : ""}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Proposer Name" required error={err.motorProposerName} hint="Taken from the lead — you can change it">
              <input data-field="motorProposerName" type="text" value={m.proposerName} onChange={(e) => setM({ proposerName: toUpperCase(e.target.value) })} className={cx(inputCls(err.motorProposerName), "uppercase")} />
            </Field>
            {!corporate && (
              <Field label="Proposer DOB" required error={err.motorProposerDOB}>
                <input data-field="motorProposerDOB" type="date" max={maxDate} value={m.proposerDOB} onChange={(e) => setM({ proposerDOB: e.target.value })} className={inputCls(err.motorProposerDOB)} />
              </Field>
            )}
            {!corporate && (
              <>
                <Field label="Aadhaar Number" required error={err.motorAadhaar}>
                  <input data-field="motorAadhaar" type="text" inputMode="numeric" maxLength="12" value={m.aadhaarNumber} onChange={(e) => setM({ aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} className={inputCls(err.motorAadhaar)} />
                </Field>
                <FileField label="Upload Aadhaar (Mandatory)" required error={err.motorAadhaarFile} dataField="motorAadhaarFile" value={m.aadhaarFile} onFile={(f) => setM({ aadhaarFile: f })} />
              </>
            )}
            <Field label="PAN Number" required error={err.motorPan}>
              <input data-field="motorPan" type="text" maxLength="10" value={m.panNumber} onChange={(e) => setM({ panNumber: e.target.value.toUpperCase().slice(0, 10) })} className={cx(inputCls(err.motorPan), "uppercase")} placeholder="ABCDE1234F" />
            </Field>
            <FileField label="Upload PAN (Mandatory)" required error={err.motorPanFile} dataField="motorPanFile" value={m.panFile} onFile={(f) => setM({ panFile: f })} />
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-indigo-600 mb-3">Vehicle Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {m.policyType === "Brand New" ? (
              <>
                <FileField label="Upload Invoice (Mandatory)" required error={err.invoiceCopy} dataField="invoiceCopy" value={m.invoiceCopy} onFile={(f) => setM({ invoiceCopy: f })} hint="Auto-fetched from the Quote if uploaded there" />
                <Field label="Engine No. (as per invoice)" required error={err.engineNo}>
                  <input data-field="engineNo" type="text" value={m.engineNo} onChange={(e) => setM({ engineNo: e.target.value.toUpperCase() })} className={cx(inputCls(err.engineNo), "uppercase")} />
                </Field>
                <Field label="Chassis No. (as per invoice)" required error={err.chesisNo}>
                  <input data-field="chesisNo" type="text" value={m.chesisNo} onChange={(e) => setM({ chesisNo: e.target.value.toUpperCase() })} className={cx(inputCls(err.chesisNo), "uppercase")} />
                </Field>
              </>
            ) : (
              <>
                {renderRcUploads(true)}
                {m.policyType !== "TP" && (
                  <FileField label="Upload PYP for NCB Discount (Not Mandatory)" dataField="pypFile" value={m.pypFile} onFile={(f) => setM({ pypFile: f })} hint="Auto-fetched from the Quote" />
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-indigo-600 mb-3">Owner & Nominee</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={corporate ? "Owner (Company) Name" : "Owner Name"} required error={err.ownerName} hint="As per RC / invoice">
              <input data-field="ownerName" type="text" value={m.ownerName} onChange={(e) => setM({ ownerName: toUpperCase(e.target.value) })} className={cx(inputCls(err.ownerName), "uppercase")} />
            </Field>
            {!corporate && (
              <>
                <Field label="Owner DOB" error={err.ownerDOB}>
                  <input data-field="ownerDOB" type="date" max={maxDate} value={m.ownerDOB} onChange={(e) => setM({ ownerDOB: e.target.value })} className={inputCls(err.ownerDOB)} />
                </Field>
                <Field label="Nominee Name" required error={err.motorNomineeName}>
                  <input data-field="motorNomineeName" type="text" value={m.nomineeName} onChange={(e) => setM({ nomineeName: toUpperCase(e.target.value) })} className={cx(inputCls(err.motorNomineeName), "uppercase")} />
                </Field>
                <Field label="DOB of Nominee" required error={err.motorNomineeDOB}>
                  <input data-field="motorNomineeDOB" type="date" max={maxDate} value={m.nomineeDOB} onChange={(e) => setM({ nomineeDOB: e.target.value })} className={inputCls(err.motorNomineeDOB)} />
                </Field>
                <Field label="Relation" required error={err.motorNomineeRelationship}>
                  <select data-field="motorNomineeRelationship" value={m.nomineeRelationship} onChange={(e) => setM({ nomineeRelationship: e.target.value })} className={inputCls(err.motorNomineeRelationship)}>
                    <option value="">Select</option>
                    {RELATIONSHIP_OPTIONS.filter((r) => r !== "Self").map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Field label="Remarks (If Any)" className="sm:col-span-2 lg:col-span-3">
              <textarea rows="2" value={m.issuanceRemarks} onChange={(e) => setM({ issuanceRemarks: e.target.value })} className={inputCls()} />
            </Field>
          </div>
        </div>
      </div>
    );
  };

  // QUOTE — insurers to request quotes from (multiple choice) + remarks
  const renderQuoteRequest = () => {
    const sel = workflowDetails.selectedInsurers || [];
    const unknown = sel.filter((n) => !isKnownInsurer(n) || (sections.electronic && !MOBILE_INSURERS.includes(n)));
    const quotesLocked = sectionLocked("Quote");
    return (
      <div className="mt-2">
        <h4 className="text-md font-semibold text-indigo-600 mb-1">Quote Required From (Insurer List) <span className="text-red-500">*</span></h4>
        <p className="text-xs text-gray-500 mb-2">Select every insurer to request a quote from. {sel.length} selected.</p>
        {unknown.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-amber-700">Not in the current insurer list:</span>
            {unknown.map((n) => (
              <span key={n} className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-300 text-amber-800 rounded-full px-2 py-0.5">
                {n}
                {!quotesLocked && (
                  <button type="button" onClick={() => toggleInsurer(n, false)} aria-label={`Remove ${n}`} className="hover:text-red-600"><FaTimes className="h-2.5 w-2.5" /></button>
                )}
              </span>
            ))}
          </div>
        )}
        <div
          data-field="selectedInsurers"
          className={cx("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border p-2 rounded-lg max-h-64 overflow-y-auto", err.selectedInsurers ? "border-red-500" : "border-gray-300", quotesLocked && "bg-gray-50")}
        >
          {(sections.electronic ? MOBILE_INSURERS : INSURER_OPTIONS).map((ins) => (
            <label key={ins} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded text-indigo-600" checked={sel.includes(ins)} disabled={quotesLocked} onChange={(e) => toggleInsurer(ins, e.target.checked)} />
              {ins}
            </label>
          ))}
        </div>
        {err.selectedInsurers && <p className="text-red-500 text-xs mt-1">{err.selectedInsurers}</p>}
        <Field label="Other Remarks" className="mt-3">
          <textarea value={workflowDetails.quoteRemarks || ""} rows="2" onChange={(e) => setWorkflowDetails((p) => ({ ...p, quoteRemarks: e.target.value }))} className={inputCls()} />
        </Field>
      </div>
    );
  };

  // ============================================================
  // 3. QUOTE WORKFLOW (Admin) — one card per selected insurer
  // ============================================================
  const statusBadge = (s) =>
    s === "Accepted" ? "bg-emerald-100 text-emerald-700" : s === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

  const renderQuoteWorkflow = () => {
    const sel = workflowDetails.selectedInsurers || [];
    const quotes = workflowDetails.insurerQuotes || [];
    const findQ = (ins) => quotes.find((q) => q.insurerName === ins) || { insurerName: ins, gstPercent: "18", quoteStatus: "Pending", acceptedAddOns: [] };
    const requestedAddOns = sections.motor ? (motorDetails.selectedAddOns || []).filter((a) => a !== "Not Required" && a !== NO_ADDON) : [];
    if (!sel.length) return <ReadOnlyNote>No insurers were selected in the Quote module.</ReadOnlyNote>;

    const dataLocked = !isAdmin; // premiums, files, payout, accepted add-ons: Admin only
    const anyPremium = sel.some((ins) => findQ(ins).netPremium);

    return (
      <div data-field="quoteStatus">
        {!isAdmin && !anyPremium && <div className="mb-3"><ReadOnlyNote>Admin is adding the insurer quotes. You can accept or reject a quote once its premium is in.</ReadOnlyNote></div>}
        {err.quoteStatus && <p className="text-red-500 text-sm mb-2">{err.quoteStatus}</p>}
        {sel.map((ins) => {
          const q = findQ(ins);
          const calc = computeQuote(q);
          const L = dataLocked;
          const k = (f) => `quote_${ins}_${f}`;
          return (
            <div key={ins} data-quote-card={ins} className={cx("border rounded-lg p-3 mb-3", q.quoteStatus === "Accepted" ? "border-emerald-300 bg-emerald-50/40" : "bg-gray-50")}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h6 className="font-medium text-indigo-700">{ins}</h6>
                <span className={cx("px-2 py-0.5 rounded-full text-xs", statusBadge(q.quoteStatus))}>{q.quoteStatus || "Pending"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Quote No." error={err[k("number")]}>
                  <input data-field={k("number")} type="text" disabled={L} value={q.quoteNumber || ""} onChange={(e) => updateQuote(ins, "quoteNumber", e.target.value)} className={inputCls(err[k("number")], L)} />
                </Field>
                {sections.electronic && !q.manualPremium ? (
                  <Field label="Net Premium (chart)" hint={chartPremium ? `Band ${chartPremium.band} · ${formData.policyTenure}` : "Outside the chart — enter manually"}>
                    <input data-field={k("net")} type="text" readOnly value={q.netPremium ? fmt(q.netPremium) : "—"} className={autoCls} />
                  </Field>
                ) : (
                  <Field label="Quote Net Premium" error={err[k("net")]}>
                    <input data-field={k("net")} type="number" min="0" disabled={L} value={q.netPremium ?? ""} onChange={(e) => updateQuote(ins, "netPremium", e.target.value)} className={inputCls(err[k("net")], L)} />
                  </Field>
                )}
                {sections.motor && (
                  <Field label="IDV (₹)" error={err[k("idv")]} hint={isAdmin ? "IDV offered by this insurer" : undefined}>
                    <input data-field={k("idv")} type="text" inputMode="numeric" disabled={L} value={q.idv ?? ""} onChange={(e) => updateQuote(ins, "idv", e.target.value.replace(/\D/g, ""))} className={inputCls(err[k("idv")], L)} />
                  </Field>
                )}
                {sections.electronic ? (
                  <Field label="GST %"><input type="text" readOnly value="18%" className={autoCls} /></Field>
                ) : (
                  <Field label="GST %" error={err[k("gst")]}>
                    <input data-field={k("gst")} type="number" min="0" max="100" disabled={L} value={q.gstPercent ?? ""} onChange={(e) => updateQuote(ins, "gstPercent", e.target.value)} className={inputCls(err[k("gst")], L)} />
                  </Field>
                )}
                <Field label="GST Value (auto)"><input type="text" readOnly value={fmt(calc.gstValue)} className={autoCls} /></Field>
                <Field label="Gross Premium (auto)"><input type="text" readOnly value={fmt(calc.grossPremium)} className={cx(autoCls, "font-medium")} /></Field>
                {sections.electronic ? (
                  <Field label="Quote (On Letter Head)" hint="Auto-generated PDF">
                    {q.autoQuote && q.quoteUpload ? (
                      <a href={q.quoteUpload} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 underline flex items-center gap-1"><FaFileAlt /> View / Download PDF</a>
                    ) : (
                      <p className="text-sm text-gray-500">{q.netPremium ? "Generated when you save" : "Generated once the premium is in"}</p>
                    )}
                  </Field>
                ) : (
                <Field label={isAdmin ? "Upload Quote" : "Quote Document"}>
                  <ViewLink url={q.quoteUpload} label="View quote" />
                  {isAdmin ? (
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files[0] && setQuoteFiles((p) => ({ ...p, [ins]: e.target.files[0] }))} className={inputCls()} />
                  ) : !q.quoteUpload && <p className="text-sm text-gray-400">Not uploaded yet</p>}
                  <NewFileTag file={quoteFiles[ins]} />
                </Field>
                )}
                {!employeeView && !sections.electronic && (
                  <Field label="Pay Out (%)" error={err[k("payout")]} hint="Insurer payout slab offered on this quote">
                    <input data-field={k("payout")} type="number" min="0" max="100" value={q.payoutPercent ?? ""} onChange={(e) => updateQuote(ins, "payoutPercent", e.target.value)} className={inputCls(err[k("payout")])} />
                  </Field>
                )}
                <Field label="Quote Status" hint={isAdmin ? undefined : "Accept / Reject / Pending — Employee & Admin"}>
                  <select data-field={k("status")} value={q.quoteStatus || "Pending"} onChange={(e) => updateQuote(ins, "quoteStatus", e.target.value)} className={inputCls()}>
                    {QUOTE_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              {sections.electronic && (
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 text-xs text-gray-600 bg-white border rounded-lg p-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Name: <b>{formData.name || "—"}</b></span><span>Mobile: <b>{formData.mobileNo || "—"}</b></span>
                    <span>E-mail: <b>{formData.email || "—"}</b></span><span>Tenure: <b>{formData.policyTenure || "—"}</b></span>
                    <span>Invoice / SI: <b>₹ {fmt(electronicDetails.purchaseValue)}</b></span><span>Product: <b>{productForInsurer(ins) || "—"}</b></span>
                    <span className="col-span-2">Make & Model: <b>{composeMakeModel(electronicDetails) || "—"}</b></span>
                    <span className="col-span-2">Address: <b>{electronicDetails.addressAsPerAadhaar || "—"}</b></span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {isAdmin && !L && (
                      <label className="text-xs text-gray-600 flex items-center gap-2">
                        <input type="checkbox" checked={!!q.manualPremium} onChange={(e) => updateQuote(ins, "manualPremium", e.target.checked)} />
                        Enter premium manually (outside chart)
                      </label>
                    )}
                  </div>
                  <Field label="Remarks, if any" className="lg:col-span-3">
                    <input type="text" disabled={L} value={q.remarks || ""} onChange={(e) => updateQuote(ins, "remarks", e.target.value)} className={inputCls(false, L)} />
                  </Field>
                </div>
              )}
              {sections.motor && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700">Add-ons accepted by this insurer</label>
                  {requestedAddOns.length > 0 && <p className="text-xs text-gray-500 mb-1">Requested: {requestedAddOns.join(", ")}</p>}
                  <AddOnPicker
                    options={uniq([...requestedAddOns, ...motorAddOnOptions()])} value={q.acceptedAddOns || []} disabled={L}
                    onChange={(v) => updateQuote(ins, "acceptedAddOns", v)}
                  />
                </div>
              )}
            </div>
          );
        })}
        <p className="text-xs text-gray-500">Accepting one quote automatically marks any other accepted quote as Rejected.</p>
      </div>
    );
  };

  // ============================================================
  // 4. POLICY ISSUANCE
  // ============================================================
  const renderAcceptedQuoteSummary = () => {
    if (!acceptedQuote) return <ReadOnlyNote>No accepted quote yet.</ReadOnlyNote>;
    const calc = computeQuote(acceptedQuote);
    const rows = [
      ["Insurer", acceptedQuote.insurerName],
      ["Quote No.", acceptedQuote.quoteNumber || "—"],
      ["Quote Net Premium", fmt(acceptedQuote.netPremium)],
      ["GST %", `${num(acceptedQuote.gstPercent)}%`],
      ["GST Value", fmt(calc.gstValue)],
      ["Gross Premium", fmt(calc.grossPremium)],
      ...(employeeView ? [] : [["Pay Out", acceptedQuote.payoutPercent !== undefined && acceptedQuote.payoutPercent !== "" ? `${acceptedQuote.payoutPercent}%` : "—"]]),
      ["Quote Status", acceptedQuote.quoteStatus],
      ...(sections.motor && acceptedQuote.idv ? [["IDV", fmt(acceptedQuote.idv)]] : []),
      ...(sections.motor ? [["Add-ons accepted", (acceptedQuote.acceptedAddOns || []).join(", ") || "None"]] : []),
      ...(sections.electronic ? [["Product", productForInsurer(acceptedQuote.insurerName) || "—"]] : []),
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm">
        {rows.map(([l, v]) => (
          <div key={l}><p className="text-xs text-gray-500">{l}</p><p className="font-medium text-gray-800 break-words">{v}</p></div>
        ))}
        <div><p className="text-xs text-gray-500">{sections.electronic ? "Quote (On Letter Head)" : "Uploaded Quote"}</p><ViewLink url={acceptedQuote.quoteUpload} label={sections.electronic ? "View / Download PDF" : "View quote"} />{!acceptedQuote.quoteUpload && <p className="text-gray-400">—</p>}</div>
        {sections.electronic && workflowDetails.certificateNumber && <div><p className="text-xs text-gray-500">Certificate No.</p><p className="font-medium text-gray-800">{workflowDetails.certificateNumber}</p></div>}
      </div>
    );
  };

  const renderMemberCard = (m, i, members) => {
    const maxDate = getMaxDate();
    const first = i === 0;
    const k = (f) => `member_${i}_${f}`;
    return (
      <div key={m.id || i} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <h5 className="font-medium text-gray-700 mb-3">{memberLabel(m, i, members)}</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Name" required error={err[k("name")]} hint={m.type === "proposer" ? "From Proposer Name in Quote" : undefined}>
            <input data-field={k("name")} type="text" value={m.name || ""} readOnly={m.type === "proposer"} onChange={(e) => updateMember(i, "name", toUpperCase(e.target.value))} className={cx(inputCls(err[k("name")], m.type === "proposer"), "uppercase")} />
          </Field>
          <Field label="DOB" required error={err[k("dob")]}>
            <input data-field={k("dob")} type="date" max={maxDate} value={m.dob || ""} onChange={(e) => updateMember(i, "dob", e.target.value)} className={inputCls(err[k("dob")])} />
          </Field>
          <Field label="Relationship" required error={err[k("relationship")]}>
            <select data-field={k("relationship")} value={m.relationship || ""} disabled={m.type === "proposer"} onChange={(e) => updateMember(i, "relationship", e.target.value)} className={inputCls(err[k("relationship")], m.type === "proposer")}>
              <option value="">Select</option>
              {RELATIONSHIP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Height (ft/in)"><input type="text" value={m.height || ""} onChange={(e) => updateMember(i, "height", e.target.value)} className={inputCls()} placeholder={`e.g., 5'8"`} /></Field>
          <Field label="Weight (kg)"><input type="number" value={m.weight || ""} onChange={(e) => updateMember(i, "weight", e.target.value)} className={inputCls()} /></Field>
          <Field label="Qualification">
            <select value={m.qualification || ""} onChange={(e) => updateMember(i, "qualification", e.target.value)} className={inputCls()}>
              <option value="">Select</option>
              {QUALIFICATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Occupation">
            <select value={m.occupation || ""} onChange={(e) => updateMember(i, "occupation", e.target.value)} className={inputCls()}>
              <option value="">Select</option>
              {OCCUPATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label={first ? "Aadhaar Number" : "Aadhaar Number / Other Birth Proof"} required={first} error={err[k("aadhaar")]}>
            <input
              data-field={k("aadhaar")} type="text" value={m.aadhaarNumber || ""} className={inputCls(err[k("aadhaar")])}
              placeholder={first ? "12 digits" : "Aadhaar (12 digits) or birth-proof no."}
              onChange={(e) => {
                const v = first ? e.target.value.replace(/\D/g, "").slice(0, 12) : e.target.value.slice(0, 30);
                updateMember(i, "aadhaarNumber", v);
              }}
            />
          </Field>
          <Field label={first ? "Upload Aadhaar (Mandatory)" : "Upload Aadhaar / Other Birth Proof (Not Mandatory)"} required={first} error={err[k("aadhaarFile")]}>
            <ViewLink url={m.aadhaarFile} />
            <input data-field={k("aadhaarFile")} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files[0] && updateMember(i, "aadhaarFile", e.target.files[0])} className={inputCls(err[k("aadhaarFile")])} />
            <NewFileTag file={m.aadhaarFile} />
          </Field>
          {first && (
            <>
              <Field label="PAN Number" required={m.type === "proposer"} error={err[k("pan")]}>
                <input data-field={k("pan")} type="text" maxLength="10" value={m.panNumber || ""} onChange={(e) => updateMember(i, "panNumber", e.target.value.toUpperCase().slice(0, 10))} className={cx(inputCls(err[k("pan")]), "uppercase")} placeholder="ABCDE1234F" />
              </Field>
              <Field label={m.type === "proposer" ? "Upload PAN Card (Mandatory)" : "Upload PAN Card"} required={m.type === "proposer"} error={err[k("panFile")]}>
                <ViewLink url={m.panFile} />
                <input data-field={k("panFile")} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files[0] && updateMember(i, "panFile", e.target.files[0])} className={inputCls(err[k("panFile")])} />
                <NewFileTag file={m.panFile} />
              </Field>
            </>
          )}
          <Field label="Want Rider?">
            <select
              value={m.wantRider || ""} className={inputCls()}
              onChange={(e) => {
                updateMember(i, "wantRider", e.target.value);
                if (e.target.value === "No") updateMember(i, "selectedRider", "");
              }}
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          {m.wantRider === "Yes" && (
            <Field label="Select Rider">
              <select value={m.selectedRider || ""} onChange={(e) => updateMember(i, "selectedRider", e.target.value)} className={inputCls()}>
                <option value="">Select</option>
                {RIDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          )}
          {m.wantRider === "Yes" && m.selectedRider === "Insta Shield" && (
            <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[["asthma", "Asthma"], ["diabetes", "Diabetes"], ["hypertension", "Hypertension (BP)"], ["hyperlipidaemia", "Hyperlipidaemia"]].map(([key, label]) => (
                <Field key={key} label={label}>
                  <select value={m.riderDetails?.[key] || ""} onChange={(e) => updateMemberRider(i, key, e.target.value)} className={inputCls()}>
                    <option value="">Select</option>
                    {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              ))}
            </div>
          )}
          {m.wantRider === "Yes" && [
            ["Fetal Flourish", "fetalFlourish"], ["NRInsure", "nrInsure"],
            ["Loss of Income (Any Illness excluding Infection)", "lossOfIncome"],
            ["Major Illness and Accident Multiplier", "majorIllness"], ["International Cover-Emergency Care", "internationalCover"],
          ].map(([rider, key]) => m.selectedRider === rider && (
            <Field key={key} label={`${rider} — details`}>
              <input type="text" value={m[key] || ""} onChange={(e) => updateMember(i, key, e.target.value)} className={inputCls()} />
            </Field>
          ))}
          <Field label="Remarks (PED/Treatment)" className="sm:col-span-2 lg:col-span-3">
            <textarea value={m.medicalRemarks || ""} rows="2" onChange={(e) => updateMember(i, "medicalRemarks", e.target.value)} className={inputCls()} />
          </Field>
        </div>
        {first && healthDetails.policyType === "Individual" && renderNominee()}
      </div>
    );
  };

  // Nominee is part of the Proposer / Adult 1 details
  const renderNominee = () => {
    const h = healthDetails;
    return (
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h6 className="text-sm font-semibold text-gray-700 mb-2">Nominee</h6>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Nominee Name" required error={err.nomineeName}>
            <input data-field="nomineeName" type="text" value={h.nomineeName || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, nomineeName: toUpperCase(e.target.value) }))} className={cx(inputCls(err.nomineeName), "uppercase")} />
          </Field>
          <Field label="Nominee DOB" required error={err.nomineeDOB}>
            <input data-field="nomineeDOB" type="date" max={getMaxDate()} value={h.nomineeDOB || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, nomineeDOB: e.target.value }))} className={inputCls(err.nomineeDOB)} />
          </Field>
          <Field label="Nominee Relationship" required error={err.nomineeRelationship}>
            <select data-field="nomineeRelationship" value={h.nomineeRelationship || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, nomineeRelationship: e.target.value }))} className={inputCls(err.nomineeRelationship)}>
              <option value="">Select</option>
              {RELATIONSHIP_OPTIONS.filter((r) => r !== "Self").map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>
    );
  };

  const renderHealthIssuance = () => {
    const h = healthDetails;
    const members = h.members || [];
    const maxDate = getMaxDate();
    return (
      <div>
        {h.proposerIsMember !== "Yes" && (
          <div className="border rounded-lg p-4 mb-4 bg-indigo-50/40">
            <h5 className="font-medium text-gray-700 mb-3">Proposer — {h.proposerName || formData.name} (not insured)</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Proposer PAN Number" required error={err.healthPan}>
                <input data-field="healthPan" type="text" maxLength="10" value={h.panNumber || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, panNumber: e.target.value.toUpperCase().slice(0, 10) }))} className={cx(inputCls(err.healthPan), "uppercase")} placeholder="ABCDE1234F" />
              </Field>
              <FileField label="Upload PAN Card (Mandatory)" required error={err.healthPanFile} dataField="healthPanFile" value={h.panFile} onFile={(f) => setHealthDetails((p) => ({ ...p, panFile: f }))} />
            </div>
          </div>
        )}

        <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2" data-field="members">
          <FaUsers /> {h.proposerIsMember === "Yes" ? "Proposer & Member Details" : "Member Details"} ({members.length})
        </h4>
        {err.members && <p className="text-red-500 text-sm mb-2">{err.members}</p>}
        {members.map((m, i) => renderMemberCard(m, i, members))}

        {h.hasPreviousPolicy === "Yes" && h.previousPolicyCase === "Portability Case" && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-indigo-600 mb-3">Previous Policy Details (Portability — {h.experienceYears} year(s))</h4>
            {(h.portabilityDetails || []).map((d, i) => (
              <div key={d.id || i} className="border rounded-lg p-4 mb-3 bg-gray-50">
                <h5 className="font-medium text-gray-700 mb-3">Previous Policy {i + 1}</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Insurer Name" required error={err[`portabilityInsurer_${i}`]}>
                    <select data-field={`portabilityInsurer_${i}`} value={d.insurerName || ""} onChange={(e) => updatePortability(i, "insurerName", e.target.value)} className={inputCls(err[`portabilityInsurer_${i}`])}>
                      <option value="">Select Insurer</option>
                      {INSURER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Policy Number" required error={err[`portabilityPolicy_${i}`]}>
                    <input data-field={`portabilityPolicy_${i}`} type="text" value={d.policyNumber || ""} onChange={(e) => updatePortability(i, "policyNumber", e.target.value)} className={inputCls(err[`portabilityPolicy_${i}`])} />
                  </Field>
                  <Field label="Active From" required error={err[`portabilityActive_${i}`]}>
                    <input data-field={`portabilityActive_${i}`} type="date" max={maxDate} value={d.policyActiveFrom || ""} onChange={(e) => updatePortability(i, "policyActiveFrom", e.target.value)} className={inputCls(err[`portabilityActive_${i}`])} />
                  </Field>
                  <Field label="Till Date" required error={err[`portabilityTill_${i}`]}>
                    <input data-field={`portabilityTill_${i}`} type="date" value={d.policyTillDate || ""} onChange={(e) => updatePortability(i, "policyTillDate", e.target.value)} className={inputCls(err[`portabilityTill_${i}`])} />
                  </Field>
                  <Field label="Sum Assured" required error={err[`portabilitySum_${i}`]}>
                    <select data-field={`portabilitySum_${i}`} value={d.sumAssured || ""} onChange={(e) => updatePortability(i, "sumAssured", e.target.value)} className={inputCls(err[`portabilitySum_${i}`])}>
                      <option value="">Select</option>
                      {SUM_INSURED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="No Claim Bonus (₹, if any)">
                    <input type="number" min="0" value={d.noClaimBonus || ""} onChange={(e) => updatePortability(i, "noClaimBonus", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Any IPD Claim taken?">
                    <select value={d.ipdClaimTaken || ""} onChange={(e) => updatePortability(i, "ipdClaimTaken", e.target.value)} className={inputCls()}>
                      <option value="">Select</option>
                      {YES_NO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Upload PYP (Mandatory)" required error={err[`portabilityUpload_${i}`]}>
                    <ViewLink url={d.uploadPYP} label="View current PYP" />
                    <input data-field={`portabilityUpload_${i}`} type="file" accept=".pdf" onChange={(e) => e.target.files[0] && updatePortability(i, "uploadPYP", e.target.files[0])} className={inputCls(err[`portabilityUpload_${i}`])} />
                    <NewFileTag file={d.uploadPYP} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // 5. PAYMENT (Admin)
  // ============================================================
  const setWf = (patch) => setWorkflowDetails((p) => ({ ...p, ...patch }));

  const renderPayment = () => {
    const w = workflowDetails;
    const pricingLocked = !isAdmin; // final premium / GST / EMI premium are set by Admin
    const paid = w.paymentStatus === PAYMENT_DONE;
    const statusOptions = getIssuanceStatusOptions(sections, instalment);
    const pypDue = sections.motor && motorDetails.previousInsuranceStatus === PREVIOUS_POLICY_ACTIVE
      ? (motorDetails.policyType === "TP" ? motorDetails.tpDueDate : motorDetails.odDueDate) || ""
      : "";
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Final Net Premium" required error={err.finalNetPremium} hint={acceptedQuote ? `Accepted quote: ${fmt(acceptedQuote.netPremium)}` : undefined}>
          <input data-field="finalNetPremium" type="number" min="0" readOnly={pricingLocked} value={w.finalNetPremium} onChange={(e) => setWf({ finalNetPremium: e.target.value })} className={inputCls(err.finalNetPremium, pricingLocked)} />
        </Field>
        <Field label="GST %" error={err.finalGstPercent}>
          <input data-field="finalGstPercent" type="number" min="0" max="100" readOnly={pricingLocked} value={w.finalGstPercent} onChange={(e) => setWf({ finalGstPercent: e.target.value })} className={inputCls(err.finalGstPercent, pricingLocked)} />
        </Field>
        <Field label="GST Value (auto)"><input type="text" readOnly value={fmt(finalAmounts.gstValue)} className={autoCls} /></Field>
        <Field label="Gross Premium (auto)"><input type="text" readOnly value={fmt(finalAmounts.gross)} className={cx(autoCls, "font-medium")} /></Field>

        {instalment && (
          <>
            <Field label={`EMI Net Premium (${formData.paymentTerm})`} required error={err.emiNetPremium}>
              <input data-field="emiNetPremium" type="number" min="0" readOnly={pricingLocked} value={w.emiNetPremium} onChange={(e) => setWf({ emiNetPremium: e.target.value })} className={inputCls(err.emiNetPremium, pricingLocked)} />
            </Field>
            <Field label="EMI GST Value (auto)"><input type="text" readOnly value={fmt(emiAmounts.gstValue)} className={autoCls} /></Field>
            <Field label="EMI Premium — Gross (auto)" hint={`${emiSchedule.total} EMIs over ${formData.policyTenure || "1 Year"}`}>
              <input type="text" readOnly value={fmt(emiAmounts.gross)} className={cx(autoCls, "font-medium")} />
            </Field>
          </>
        )}

        {sections.electronic && (
          <Field label="Payment Taken Mode" required error={err.paymentTakenMode}>
            <select data-field="paymentTakenMode" value={w.paymentTakenMode} onChange={(e) => setWf({ paymentTakenMode: e.target.value })} className={inputCls(err.paymentTakenMode)}>
              <option value="">Select</option>
              {PAYMENT_TAKEN_MODES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        )}
        {sections.electronic && w.paymentTakenMode === "QR" && (
          <FileField label="Upload Payment QR" required error={err.paymentQr} dataField="paymentQr" value={w.paymentQr} onFile={(f) => setWf({ paymentQr: f })} accept=".jpg,.jpeg,.png,.pdf" />
        )}
        {(!sections.electronic || w.paymentTakenMode === "URL") && (
        <Field label="Payment URL" required={sections.electronic} error={err.paymentUrl} className="sm:col-span-2">
          <div className="flex gap-2">
            <input data-field="paymentUrl" type="url" value={w.paymentUrl} onChange={(e) => setWf({ paymentUrl: e.target.value })} className={inputCls(err.paymentUrl)} placeholder="https://..." />
            {w.paymentUrl && (
              <a href={w.paymentUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"><FaLink /> Open</a>
            )}
          </div>
        </Field>
        )}
        <Field label="Payment Status" required error={err.paymentStatus}>
          <select
            data-field="paymentStatus" value={w.paymentStatus} className={inputCls(err.paymentStatus)}
            // moving back to Pending clears the Status — it only exists after Payment Done
            onChange={(e) => setWf(e.target.value === PAYMENT_DONE ? { paymentStatus: e.target.value } : { paymentStatus: e.target.value, issuanceStatus: "", eMandateUrl: "", uwQuery: "" })}
          >
            <option value="">Select</option>
            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>

        {!paid && (
          <p className="sm:col-span-2 lg:col-span-3 text-xs text-gray-500 flex items-center gap-1">
            <FaLock className="h-3 w-3" /> The policy Status opens once Payment Status is “Payment Done”.
          </p>
        )}

        {paid && (
          <>
            <Field label="UTR Number">
              <input type="text" value={w.utrNumber} onChange={(e) => setWf({ utrNumber: e.target.value })} className={inputCls()} />
            </Field>
            <FileField label="Payment Snapshot" dataField="paymentSnapshot" value={w.paymentSnapshot} onFile={(f) => setWf({ paymentSnapshot: f })} />
            <Field label="Status" required error={err.issuanceStatus} hint={instalment && !sections.motor ? "e-Mandate statuses are for EMI payments" : undefined}>
              <select data-field="issuanceStatus" value={w.issuanceStatus} onChange={(e) => setWf({ issuanceStatus: e.target.value })} className={inputCls(err.issuanceStatus)}>
                <option value="">Select</option>
                {w.issuanceStatus && !statusOptions.includes(w.issuanceStatus) && <option value={w.issuanceStatus}>{w.issuanceStatus} (not valid here)</option>}
                {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>

            {w.issuanceStatus === "e-Mandate Link Shared" && (
              <Field label="e-Mandate URL" required error={err.eMandateUrl} className="sm:col-span-2">
                <input data-field="eMandateUrl" type="url" value={w.eMandateUrl} onChange={(e) => setWf({ eMandateUrl: e.target.value })} className={inputCls(err.eMandateUrl)} placeholder="https://..." />
              </Field>
            )}

            {w.issuanceStatus === "Referred to UW" && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">UW Query <span className="text-red-500">*</span></label>
                  <VoiceNoteButton onText={(t) => setWorkflowDetails((p) => ({ ...p, uwQuery: p.uwQuery ? `${p.uwQuery} ${t}` : t }))} />
                </div>
                <textarea data-field="uwQuery" rows="3" value={w.uwQuery} onChange={(e) => setWf({ uwQuery: e.target.value })} className={inputCls(err.uwQuery)} placeholder="Type or dictate the underwriter's query" />
                {err.uwQuery && <p className="text-red-500 text-xs mt-1">{err.uwQuery}</p>}
              </div>
            )}

            {(w.issuanceStatus === "Rejected" || ["Awaited for Inspection", "Inspection Done - Waiting for Policy"].includes(w.issuanceStatus)) && (
              <Field label={w.issuanceStatus === "Rejected" ? "Rejection Reason" : "Remarks"} required={w.issuanceStatus === "Rejected"} error={err.notIssuedRemarks} className="sm:col-span-2 lg:col-span-3">
                <textarea data-field="notIssuedRemarks" rows="2" value={w.notIssuedRemarks} onChange={(e) => setWf({ notIssuedRemarks: e.target.value })} className={inputCls(err.notIssuedRemarks)} />
              </Field>
            )}

            {w.issuanceStatus === "Policy Issued" && (
              <>
                <Field label="Policy Number" required error={err.policyNumber}>
                  <input data-field="policyNumber" type="text" value={w.policyNumber} onChange={(e) => setWf({ policyNumber: e.target.value })} className={inputCls(err.policyNumber)} />
                </Field>
                <Field label="Policy Issued On" required error={err.policyIssuedOn}>
                  <input data-field="policyIssuedOn" type="date" value={w.policyIssuedOn} onChange={(e) => setWf({ policyIssuedOn: e.target.value })} className={inputCls(err.policyIssuedOn)} />
                </Field>
                <Field label="Policy Start Date" required error={err.policyStartDate} hint={pypDue ? `Not before previous policy expiry (${pypDue})` : undefined}>
                  <input
                    data-field="policyStartDate" type="date" min={pypDue || undefined} value={w.policyStartDate} className={inputCls(err.policyStartDate)}
                    onChange={(e) => {
                      if (pypDue && new Date(e.target.value) < new Date(pypDue)) {
                        alert("Policy Start Date cannot be earlier than the previous policy expiry date");
                        return;
                      }
                      setWf({ policyStartDate: e.target.value });
                    }}
                  />
                </Field>
                <Field label="Policy Expiry Date (auto)" hint="Start Date + Policy Tenure">
                  <input type="date" readOnly value={w.policyExpiryDate} className={autoCls} />
                </Field>
                {sections.electronic ? (
                  <Field label="Policy Copy (On Letter Head)" hint={`Auto-generated PDF${w.certificateNumber ? ` · Certificate No. ${w.certificateNumber}` : ""}`}>
                    {w.policyCopyAuto && typeof w.policyCopy === "string" && w.policyCopy ? (
                      <a href={w.policyCopy} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 underline flex items-center gap-1"><FaFileAlt /> View / Download PDF</a>
                    ) : (
                      <p className="text-sm text-gray-500">Generated when you save with Policy Number + Start Date</p>
                    )}
                  </Field>
                ) : (
                  <FileField label="Upload Policy Copy" dataField="policyCopy" value={w.policyCopy} onFile={(f) => setWf({ policyCopy: f })} accept=".pdf" />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================================
  // 6. EMI DUES (Admin, only when Paying Term is not One Time)
  // ============================================================
  const renderEmiDues = () => {
    const w = workflowDetails;
    if (!isAdmin) return <ReadOnlyNote>EMI tracking is handled by Admin. Received {emiSchedule.received} of {emiSchedule.total} EMIs.</ReadOnlyNote>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="EMI Total Count (auto)" hint={`${formData.paymentTerm} × ${formData.policyTenure || "1 Year"}`}>
          <input type="text" readOnly value={emiSchedule.total} className={autoCls} />
        </Field>
        <Field label="Received EMI Count" required error={err.emiReceivedCount}>
          <select data-field="emiReceivedCount" value={w.emiReceivedCount} onChange={(e) => setWf({ emiReceivedCount: e.target.value })} className={inputCls(err.emiReceivedCount)}>
            <option value="">Select</option>
            {Array.from({ length: emiSchedule.total }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Last EMI Paid On" required error={err.lastEmiPaidOn}>
          <input data-field="lastEmiPaidOn" type="date" max={getMaxDate()} value={w.lastEmiPaidOn} onChange={(e) => setWf({ lastEmiPaidOn: e.target.value })} className={inputCls(err.lastEmiPaidOn)} />
        </Field>
        <Field label="EMI Received Till (auto)">
          <input type="date" readOnly value={emiSchedule.receivedTill} className={autoCls} />
        </Field>
        <Field label="Next Due (auto)">
          {emiSchedule.renewalAlert ? (
            <div className="w-full p-2 border border-amber-300 rounded-lg bg-amber-50 text-amber-800 text-sm font-medium flex items-center gap-2"><FaBell /> Renewal Alert — all EMIs received</div>
          ) : (
            <input type="date" readOnly value={emiSchedule.nextDue} className={autoCls} />
          )}
        </Field>
        {!w.policyStartDate && (
          <p className="text-xs text-amber-700 sm:col-span-2 lg:col-span-3">Set the Policy Start Date in Payment to calculate EMI dates.</p>
        )}
      </div>
    );
  };

  // ============================================================
  // 7. CASHBACK / PAYOUT TO CUSTOMER / EMPLOYEE (Admin)
  // ============================================================
  // ============================================================
  // 6b. ARSHYAN CALCULATION ON MOBILE INSURANCE (Admin, Mobile only)
  // ============================================================
  const renderInsurerCalc = () => {
    if (!isAdmin) return <ReadOnlyNote>Handled by Admin.</ReadOnlyNote>;
    const p = payoutDetails;
    const setP = (patch) => setPayoutDetails((x) => ({ ...x, ...patch }));
    const P = profitCalc;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Insurer Net Premium (₹)" required error={err.insurerNetPremium} hint="What Arshyan pays the insurer">
            <input data-field="insurerNetPremium" type="number" min="0" value={p.insurerNetPremium} onChange={(e) => setP({ insurerNetPremium: e.target.value })} className={inputCls(err.insurerNetPremium)} />
          </Field>
          <Field label="Insurer GST 18% (auto)"><input type="text" readOnly value={fmt(P.insurerGstValue)} className={autoCls} /></Field>
          <Field label="Insurer Gross Premium (auto)"><input type="text" readOnly value={fmt(P.insurerGrossPremium)} className={cx(autoCls, "font-medium")} /></Field>
          <Field label="PayOut (%)" required error={err.profit_payoutSlabPercent} hint={acceptedQuote?.payoutPercent ? `Pay Out on Net set at issuance: ${acceptedQuote.payoutPercent}%` : undefined}>
            <input data-field="profit_payoutSlabPercent" type="number" min="0" max="100" value={p.payoutSlabPercent} onChange={(e) => setP({ payoutSlabPercent: e.target.value })} className={inputCls(err.profit_payoutSlabPercent)} />
          </Field>
          <Field label="PayOut in Value (auto)" hint="PayOut % of Insurer Net Premium"><input type="text" readOnly value={fmt(P.insurerPayoutEach)} className={autoCls} /></Field>
          <Field label="GST on PayOut (%)" error={err.profit_gstPayoutPercent} hint="BRD default 11.3%">
            <input data-field="profit_gstPayoutPercent" type="number" min="0" max="100" value={p.gstPayoutPercent} onChange={(e) => setP({ gstPayoutPercent: e.target.value })} className={inputCls(err.profit_gstPayoutPercent)} />
          </Field>
          <Field label="TDS (%)" error={err.profit_tdsPercent} hint="BRD default 2%">
            <input data-field="profit_tdsPercent" type="number" min="0" max="100" value={p.tdsPercent} onChange={(e) => setP({ tdsPercent: e.target.value })} className={inputCls(err.profit_tdsPercent)} />
          </Field>
          <FileField label="Upload Insurer Insurance Copy" dataField="insurerPolicyCopy" value={workflowDetails.insurerPolicyCopy} onFile={(f) => setWf({ insurerPolicyCopy: f })} accept=".pdf,.jpg,.jpeg" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg">
            <tbody>
              {[
                ["Chart Gross Premium (paid by customer)", P.chartGrossPremium],
                ["Less: Insurer Gross Premium", -P.insurerGrossPremium],
                ["Premium margin", P.premiumMargin, "font-medium"],
                ["Insurer PayOut", P.insurerPayoutEach],
                [`GST on PayOut ${num(P.gstPayoutPercent)}%`, P.gstPayoutEach, "text-emerald-700"],
                [`TDS ${num(P.tdsPercent)}%`, -P.tdsEach, "text-red-600"],
              ].map(([l, v, c]) => (
                <tr key={l} className={cx("border-t", c)}><td className="p-2">{l}</td><td className="p-2 text-right tabular-nums">{fmt(v)}</td></tr>
              ))}
              <tr className="border-t bg-emerald-50 font-semibold"><td className="p-2">Arshyan PayOut on Mobile</td><td className="p-2 text-right tabular-nums">₹ {fmt(P.arshyanMobilePayout)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCashback = () => {
    if (!isAdmin) return <ReadOnlyNote>Cashback / PayOut is handled by Admin.</ReadOnlyNote>;
    const cb = cashbackDetails;
    const setCb = (patch) => setCashbackDetails((p) => ({ ...p, ...patch }));
    if (sections.electronic) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Store PayOut (₹)" error={err.storePayout}>
            <input data-field="storePayout" type="number" min="0" value={cb.storePayout} onChange={(e) => setCb({ storePayout: e.target.value })} className={inputCls(err.storePayout)} />
          </Field>
          <Field label="Promoter PayOut (₹)" error={err.promoterPayout}>
            <input data-field="promoterPayout" type="number" min="0" value={cb.promoterPayout} onChange={(e) => setCb({ promoterPayout: e.target.value })} className={inputCls(err.promoterPayout)} />
          </Field>
          <Field label="Total Cashback / PayOut (auto)" hint="Store + Promoter">
            <input type="text" readOnly value={fmt(cashbackCalc.totalPayout)} className={cx(autoCls, "font-semibold")} />
          </Field>
          <Field label="Status" required error={err.cashbackStatus}>
            <select data-field="cashbackStatus" value={cb.status} onChange={(e) => setCb({ status: e.target.value })} className={inputCls(err.cashbackStatus)}>
              {CASHBACK_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          {cb.status === "Partial Settled" && (
            <Field label="Amount Settled (₹)" required error={err.cashbackSettled}>
              <input data-field="cashbackSettled" type="number" min="0" value={cb.settledAmount} onChange={(e) => setCb({ settledAmount: e.target.value })} className={inputCls(err.cashbackSettled)} />
            </Field>
          )}
          <Field label="Pending Amount (auto)">
            <input type="text" readOnly value={fmt(cashbackCalc.pendingAmount)} className={cx(autoCls, cashbackCalc.pendingAmount > 0 ? "text-red-600" : "text-green-700")} />
          </Field>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="PayOut To">
          <select value={cb.payoutTo} onChange={(e) => setCb({ payoutTo: e.target.value })} className={inputCls()}>
            {CASHBACK_PAYEE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="PayOut Mode (auto)" hint={instalment ? "Paying Term is not One Time → against each premium" : "Paying Term is One Time"}>
          <input type="text" readOnly value={cashbackCalc.payoutMode} className={autoCls} />
        </Field>
        <Field label="PayOut Count (auto)" hint={instalment ? "From Received EMI Count" : undefined}>
          <input type="text" readOnly value={cashbackCalc.payoutCount} className={autoCls} />
        </Field>
        <Field label="PayOut Amt against each Payment (₹)" required error={err.cashbackAmount}>
          <input data-field="cashbackAmount" type="number" min="0" value={cb.amountPerPayment} onChange={(e) => setCb({ amountPerPayment: e.target.value })} className={inputCls(err.cashbackAmount)} placeholder="e.g., 600" />
        </Field>
        <Field label="Payout Amount (auto)" hint="Amount × Count">
          <input type="text" readOnly value={fmt(cashbackCalc.payoutAmount)} className={cx(autoCls, "font-medium")} />
        </Field>
        <Field label="Status" required error={err.cashbackStatus}>
          <select data-field="cashbackStatus" value={cb.status} onChange={(e) => setCb({ status: e.target.value })} className={inputCls(err.cashbackStatus)}>
            {CASHBACK_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        {cb.status === "Partial Settled" && (
          <Field label="Amount Settled (₹)" required error={err.cashbackSettled}>
            <input data-field="cashbackSettled" type="number" min="0" value={cb.settledAmount} onChange={(e) => setCb({ settledAmount: e.target.value })} className={inputCls(err.cashbackSettled)} />
          </Field>
        )}
        <Field label="Pending Amount (auto)">
          <input type="text" readOnly value={fmt(cashbackCalc.pendingAmount)} className={cx(autoCls, cashbackCalc.pendingAmount > 0 ? "text-red-600" : "text-green-700")} />
        </Field>
        <Field label="Total PayOut (auto)">
          <input type="text" readOnly value={fmt(cashbackCalc.totalPayout)} className={cx(autoCls, "font-semibold")} />
        </Field>
      </div>
    );
  };

  // ============================================================
  // 8. ARSHYAN PROFIT (Admin)
  // ============================================================
  const renderProfit = () => {
    if (!isAdmin) return null;
    if (sections.electronic) {
      const P = profitCalc;
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <tbody>
                {[
                  ["PayOut Slab % (Insurer)", `${num(payoutDetails.payoutSlabPercent)}%`],
                  ["Insurer PayOut", fmt(P.insurerPayoutEach)],
                  [`GST PayOut ${num(P.gstPayoutPercent)}%`, fmt(P.gstPayoutEach)],
                  [`TDS ${num(P.tdsPercent)}%`, fmt(-P.tdsEach)],
                  ["Total PayOut (Insurer PayOut − TDS + GST)", fmt(P.totalPayoutEach)],
                  ["Chart Gross Premium", fmt(P.chartGrossPremium)],
                  ["Arshyan PayOut on Mobile", fmt(P.arshyanMobilePayout)],
                  ["Less: Total Cashback / PayOut (Store + Promoter)", fmt(-P.totalCashbackPayout)],
                ].map(([l, v]) => (
                  <tr key={l} className="border-t"><td className="p-2">{l}</td><td className="p-2 text-right tabular-nums">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={cx("rounded-lg border p-4 flex flex-wrap items-center justify-between gap-2", P.arshyanProfit >= 0 ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300")}>
            <div>
              <p className="text-sm font-semibold text-gray-700">Arshyan Profit</p>
              <p className="text-xs text-gray-500">= Arshyan PayOut on Mobile − Total Cashback / PayOut</p>
            </div>
            <p className={cx("text-2xl font-bold tabular-nums", P.arshyanProfit >= 0 ? "text-emerald-700" : "text-red-600")}>₹ {fmt(P.arshyanProfit)}</p>
          </div>
        </div>
      );
    }
    const p = payoutDetails;
    const setP = (patch) => setPayoutDetails((x) => ({ ...x, ...patch }));
    const P = profitCalc;
    const net = num(workflowDetails.finalNetPremium);
    const { hasOD, hasTP } = getMotorPremiumParts(motorDetails.insuranceType);
    const splitOk = net > 0 && Math.abs(P.premiumSplitTotal - net) <= 1;
    const row = (label, each, total, cls = "") => (
      <tr className={cx("border-t", cls)}>
        <td className="p-2">{label}</td>
        <td className="p-2 text-right tabular-nums">{fmt(each)}</td>
        <td className="p-2 text-right tabular-nums">{fmt(total)}</td>
      </tr>
    );
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm bg-gray-50 border rounded-lg p-3">
          <div><p className="text-xs text-gray-500">Accepted Insurer</p><p className="font-medium">{acceptedQuote?.insurerName || "—"}</p></div>
          <div><p className="text-xs text-gray-500">{P.instalment ? "Net Premium per EMI" : "Final Net Premium"}</p><p className="font-medium">{fmt(P.netPerPayment)}</p></div>
          <div><p className="text-xs text-gray-500">{P.instalment ? "EMIs Received" : "Payments"}</p><p className="font-medium">{P.paymentCount}</p></div>
          <div><p className="text-xs text-gray-500">Total PayOut (Cashback)</p><p className="font-medium">{fmt(P.totalCashbackPayout)}</p></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.motor && (
            <Field label="PayOut Basis" className="sm:col-span-2 lg:col-span-3" hint="BRD: Slab % on the Net Premium. Use the OD/TP split only if this insurer pays separate OD and TP slabs.">
              <div className="flex flex-wrap gap-4 pt-1">
                {PAYOUT_BASIS_OPTIONS.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="payoutBasis" value={o} checked={(p.payoutBasis || "Net Premium") === o} onChange={() => setP({ payoutBasis: o })} />
                    {o === "Net Premium" ? "Slab % on Net Premium" : "Separate OD / TP slabs"}
                  </label>
                ))}
              </div>
            </Field>
          )}
          {sections.motor && p.payoutBasis === "OD/TP Split" ? (
            <>
              {hasOD && (
                <>
                  <Field label="OD Premium (Net)" required error={err.profit_OdPremium}>
                    <input data-field="profit_OdPremium" type="number" min="0" value={p.odPremium} onChange={(e) => setP({ odPremium: e.target.value })} className={inputCls(err.profit_OdPremium)} />
                  </Field>
                  <Field label="OD PayOut Slab (%)" required error={err.profit_OdPayoutPercent}>
                    <input data-field="profit_OdPayoutPercent" type="number" min="0" max="100" value={p.odPayoutPercent} onChange={(e) => setP({ odPayoutPercent: e.target.value })} className={inputCls(err.profit_OdPayoutPercent)} />
                  </Field>
                  <Field label="OD PayOut (auto)"><input type="text" readOnly value={fmt(P.odPayoutAmount)} className={autoCls} /></Field>
                </>
              )}
              {hasTP && (
                <>
                  <Field label="TP Premium (Net)" required error={err.profit_TpPremium}>
                    <input data-field="profit_TpPremium" type="number" min="0" value={p.tpPremium} onChange={(e) => setP({ tpPremium: e.target.value })} className={inputCls(err.profit_TpPremium)} />
                  </Field>
                  <Field label="TP PayOut Slab (%)" required error={err.profit_TpPayoutPercent}>
                    <input data-field="profit_TpPayoutPercent" type="number" min="0" max="100" value={p.tpPayoutPercent} onChange={(e) => setP({ tpPayoutPercent: e.target.value })} className={inputCls(err.profit_TpPayoutPercent)} />
                  </Field>
                  <Field label="TP PayOut (auto)"><input type="text" readOnly value={fmt(P.tpPayoutAmount)} className={autoCls} /></Field>
                </>
              )}
              <div className="sm:col-span-2 lg:col-span-3 text-xs">
                {P.premiumSplitTotal > 0 && (
                  <p className={splitOk ? "text-green-700" : "text-red-600"}>
                    {hasOD && hasTP ? "OD + TP" : "Premium"} = {fmt(P.premiumSplitTotal)} {splitOk ? "✓ matches" : "≠"} Final Net Premium {fmt(net)}
                  </p>
                )}
                {err.profit_NetPremium && <p className="text-red-600">{err.profit_NetPremium}</p>}
              </div>
            </>
          ) : (
            <Field label="PayOut Slab (%)" required error={err.profit_payoutSlabPercent} hint={acceptedQuote?.payoutPercent ? `Accepted quote Pay Out: ${acceptedQuote.payoutPercent}%` : undefined}>
              <input data-field="profit_payoutSlabPercent" type="number" min="0" max="100" value={p.payoutSlabPercent} onChange={(e) => setP({ payoutSlabPercent: e.target.value })} className={inputCls(err.profit_payoutSlabPercent)} />
            </Field>
          )}
          <Field label="GST PayOut (%)" error={err.profit_gstPayoutPercent} hint="BRD default 11.5%">
            <input data-field="profit_gstPayoutPercent" type="number" min="0" max="100" value={p.gstPayoutPercent} onChange={(e) => setP({ gstPayoutPercent: e.target.value })} className={inputCls(err.profit_gstPayoutPercent)} />
          </Field>
          <Field label="TDS (%)" error={err.profit_tdsPercent} hint="BRD default 2%">
            <input data-field="profit_tdsPercent" type="number" min="0" max="100" value={p.tdsPercent} onChange={(e) => setP({ tdsPercent: e.target.value })} className={inputCls(err.profit_tdsPercent)} />
          </Field>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-right">{P.instalment ? "On each EMI" : "On Premium"}</th>
                <th className="p-2 text-right">Total (× {P.paymentCount})</th>
              </tr>
            </thead>
            <tbody>
              {row("Insurer PayOut", P.insurerPayoutEach, P.totalInsurerPayout)}
              {row(`GST PayOut ${num(P.gstPayoutPercent)}%`, P.gstPayoutEach, P.totalGstPayout, "text-emerald-700")}
              {row(`TDS ${num(P.tdsPercent)}%`, -P.tdsEach, -P.totalTds, "text-red-600")}
              {row("Total PayOut (Insurer − TDS + GST)", P.totalPayoutEach, P.grandTotalPayout, "font-semibold")}
              <tr className="border-t">
                <td className="p-2">Less: Total PayOut to {cashbackDetails.payoutTo || "Customer"} (Cashback)</td>
                <td className="p-2" />
                <td className="p-2 text-right tabular-nums text-red-600">{fmt(-P.totalCashbackPayout)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={cx("rounded-lg border p-4 flex flex-wrap items-center justify-between gap-2", P.arshyanProfit >= 0 ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300")}>
          <div>
            <p className="text-sm font-semibold text-gray-700">Arshyan Profit</p>
            <p className="text-xs text-gray-500">= Grand Total PayOut − Total PayOut (Cashback)</p>
          </div>
          <p className={cx("text-2xl font-bold tabular-nums", P.arshyanProfit >= 0 ? "text-emerald-700" : "text-red-600")}>₹ {fmt(P.arshyanProfit)}</p>
        </div>
      </div>
    );
  };

  // ============================================================
  // DOCUMENTS
  // ============================================================
  const renderDocuments = () => {
    const docs = collectDocuments(savedLead);
    const groups = docs.reduce((acc, d) => ((acc[d.group] = acc[d.group] || []).push(d), acc), {});
    return (
      <Section title={`Documents (${docs.length})`} icon={FaFolderOpen} tone="gray">
        {docs.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded yet. Files you select are listed here after saving.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groups).map(([g, list]) => (
              <div key={g} className="border rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">{g}</p>
                <ul className="space-y-1">
                  {list.map((d, i) => (
                    <li key={`${d.url}-${i}`}>
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        <FaFileAlt className="h-3 w-3 flex-shrink-0" /> {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  };

  // ============================================================
  // EMPLOYEE: case status card (replaces the Admin modules)
  // ============================================================
  const renderEmployeeStatus = () => {
    const w = workflowDetails;
    const status = deriveCaseStatus(caseStage, w);
    const sel = w.selectedInsurers || [];
    const acceptedCalc = acceptedQuote ? computeQuote(acceptedQuote) : null;
    let headline;
    if (stageIdx === IDX.QuoteWorkflow) headline = (w.insurerQuotes || []).some((q) => q.netPremium)
      ? "Quotes are in — review them below, mark one Accepted and use “Proceed with Accepted Quote”."
      : `Admin is collecting quotes from ${sel.length} insurer${sel.length === 1 ? "" : "s"}.`;
    else if (stageIdx === IDX.PolicyIssuance) headline = "A quote has been accepted — fill the proposer & member details below, then use “Request for Payment URL”.";
    else if (w.issuanceStatus === "Policy Issued") headline = "Policy issued.";
    else if (w.issuanceStatus === "Referred to UW") headline = `Referred to UW${w.uwQuery ? ` — query: ${w.uwQuery}` : ""}.`;
    else if (w.issuanceStatus) headline = `Policy status: ${w.issuanceStatus}${w.notIssuedRemarks ? ` — ${w.notIssuedRemarks}` : ""}.`;
    else if (stageIdx === IDX.Payment) headline = "Update the Payment Status below — once payment is done, set the policy Status and details.";
    else headline = "Submitted — Admin is completing the case.";
    const row = (label, value) =>
      value || value === 0 ? (
        <div><p className="text-xs text-gray-500">{label}</p><p className="font-medium text-gray-800 break-words">{value}</p></div>
      ) : null;
    return (
      <Section title="Case Status" icon={FaClock} tone="gray">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cx("px-2.5 py-0.5 rounded-full text-xs font-medium", statusBadgeClass(status))}>{status}</span>
            <p className="text-sm text-gray-700">{headline}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {row("Insurers requested", sel.length ? sel.join(", ") : null)}
            {row("Accepted insurer", acceptedQuote?.insurerName)}
            {acceptedCalc && row("Gross premium (quote)", `₹ ${fmt(acceptedCalc.grossPremium)}`)}
            {stageIdx >= IDX.Payment && row("Payment status", w.paymentStatus || "Pending")}
            {w.issuanceStatus === "Policy Issued" && row("Policy number", w.policyNumber)}
            {w.issuanceStatus === "Policy Issued" && row("Policy period", [w.policyStartDate, w.policyExpiryDate].filter(Boolean).join(" → "))}
            {instalment && w.issuanceStatus === "Policy Issued" && row("EMIs received", `${emiSchedule.received} / ${emiSchedule.total}`)}
            {instalment && w.issuanceStatus === "Policy Issued" && row(emiSchedule.renewalAlert ? "Renewal" : "Next EMI due", emiSchedule.renewalAlert ? "All EMIs received — renewal due" : emiSchedule.nextDue)}
          </div>
          {w.paymentUrl && stageIdx >= IDX.Payment && w.paymentStatus !== "Payment Done" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">Payment link for the customer:</span>
              <a href={w.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">{w.paymentUrl}</a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(w.paymentUrl)} className="text-xs px-2 py-1 border rounded-md hover:bg-white">Copy</button>
            </div>
          )}
          {w.issuanceStatus === "e-Mandate Link Shared" && w.eMandateUrl && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">e-Mandate link for the customer:</span>
              <a href={w.eMandateUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">{w.eMandateUrl}</a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(w.eMandateUrl)} className="text-xs px-2 py-1 border rounded-md hover:bg-white">Copy</button>
            </div>
          )}
          {employeeReadOnly && <p className="text-xs text-gray-500 flex items-center gap-1"><FaLock className="h-3 w-3" /> Submitted — only Admin can edit this case now.</p>}
          {typeof w.policyCopy === "string" && w.policyCopy && <ViewLink url={w.policyCopy} label="Download policy copy" />}
        </div>
      </Section>
    );
  };

  // ============================================================
  // LAYOUT
  // ============================================================
  const num_ = (key) => visibleStages.findIndex((s) => s.key === key) + 1;

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      <StageStepper
        stages={hideAdminModules ? visibleStages.filter((x) => !["EmiDues", "InsurerCalc", "Cashback", "Profit"].includes(x.key)) : visibleStages}
        current={caseStage}
        labels={hideAdminModules ? { QuoteWorkflow: "Quotes", Payment: "Payment & Issuance" } : {}}
      />
      {hideAdminModules && currentStageDef.access === "admin" ? (
        <p className="text-xs text-gray-500 mb-2">
          Current step: <span className="font-medium text-gray-700">
            {workflowDetails.issuanceStatus === "Policy Issued" ? "Policy issued" : caseStage === "QuoteWorkflow" ? "Quotes — with Admin" : "Payment & Issuance — with Admin"}
          </span>. Your details stay editable below.
        </p>
      ) : (
        <p className="text-xs text-gray-500 mb-2">
          Current module: <span className="font-medium text-gray-700">{currentStageDef.label}</span>
          {nextStage ? <> — complete it and use <span className="font-medium">“{currentStageDef.next}”</span> to open the next module.</> : " — final module."}
        </p>
      )}

      <Section n={num_("Lead")} title="Lead" icon={FaClipboardList} lock={lockFor("Lead")}>
        {renderLeadSection()}
      </Section>

      {reached("Quote") && (
        <Section n={num_("Quote")} title="Quote" icon={FaFileAlt} status={stageIdx > IDX.Quote ? "Requested" : undefined} lock={lockFor("Quote")}>
          {!formData.lob && <ReadOnlyNote>Select the LOB in the Lead module first.</ReadOnlyNote>}
          {sections.health && renderHealthQuote()}
          {!sections.health && !sections.electronic && !sections.pa && !sections.travel && formData.lob && renderPolicyTerms()}
          {sections.motor && renderMotorQuote()}
          {sections.electronic && renderMobileQuote()}
          {sections.pa && <PAQuoteSection details={paDetails} setDetails={setPaDetails} errors={err} formData={formData} setFormData={setFormData} insurerOptions={INSURER_OPTIONS} />}
          {sections.travel && <TravelQuoteSection details={travelDetails} setDetails={setTravelDetails} errors={err} />}
          {formData.lob && renderQuoteRequest()}
        </Section>
      )}

      {hideAdminModules && reached("QuoteWorkflow") && renderEmployeeStatus()}

      {reached("QuoteWorkflow") && (
        <Section n={num_("QuoteWorkflow")} title={hideAdminModules ? "Quotes" : "Quote Workflow"} icon={FaClipboardList} status={[sections.electronic && workflowDetails.certificateNumber ? `Certificate No. ${workflowDetails.certificateNumber}` : "", acceptedQuote ? `Accepted: ${acceptedQuote.insurerName}` : ""].filter(Boolean).join(" · ") || undefined} lock={lockFor("QuoteWorkflow")}>
          {renderQuoteWorkflow()}
        </Section>
      )}

      {reached("PolicyIssuance") && (
        <Section n={num_("PolicyIssuance")} title="Policy Issuance" icon={FaUsers} lock={lockFor("PolicyIssuance")}>
          {renderAcceptedQuoteSummary()}
          {sections.health ? renderHealthIssuance()
            : sections.motor ? renderMotorIssuance()
            : sections.electronic ? renderMobileIssuance()
            : sections.pa ? <PAIssuanceSection details={paDetails} setDetails={setPaDetails} errors={err} insurerOptions={INSURER_OPTIONS} sumInsuredOptions={PA_SUM_INSURED} />
            : sections.travel ? <TravelIssuanceSection details={travelDetails} setDetails={setTravelDetails} errors={err} />
            : <p className="text-sm text-gray-500">No additional proposer details are needed for this LOB — continue to request the payment URL.</p>}
        </Section>
      )}

      {reached("Payment") && (
        <Section n={num_("Payment")} title="Payment for the Policy" icon={FaMoneyBillWave} tone="emerald" status={workflowDetails.issuanceStatus || undefined} lock={lockFor("Payment")}>
          {renderPayment()}
        </Section>
      )}

      {!hideAdminModules && reached("EmiDues") && instalment && (
        <Section n={num_("EmiDues")} title="EMI Dues" icon={FaClock} adminOnly tone="emerald" lock={lockFor("EmiDues")}>
          {renderEmiDues()}
        </Section>
      )}

      {!hideAdminModules && reached("InsurerCalc") && sections.electronic && (
        <Section n={num_("InsurerCalc")} title="Arshyan Calculation on Mobile Insurance" icon={FaChartLine} adminOnly tone="emerald" lock={lockFor("InsurerCalc")}>
          {renderInsurerCalc()}
        </Section>
      )}

      {!hideAdminModules && reached("Cashback") && (
        <Section n={num_("Cashback")} title="Cashback / PayOut to Customer / Employee" icon={FaHandHoldingUsd} adminOnly tone="amber" lock={lockFor("Cashback")}>
          {renderCashback()}
        </Section>
      )}

      {!hideAdminModules && reached("Profit") && isAdmin && (
        <Section n={num_("Profit")} title="Arshyan Profit" icon={FaChartLine} adminOnly tone="emerald">
          {renderProfit()}
        </Section>
      )}

      {mode === "edit" && renderDocuments()}

      {renderValidationPopup()}

      <div className="flex flex-wrap gap-3 justify-end items-center mt-6 pt-4 border-t sticky bottom-0 bg-white pb-1 z-10">
        {nextStage && !canEdit(caseStage) && (
          <p className="mr-auto text-sm text-gray-500 flex items-center gap-2"><FaClock /> Waiting for Admin: {currentStageDef.label}</p>
        )}
        <button type="button" onClick={onCancel} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        {employeeReadOnly ? (
          <p className="mr-auto text-sm text-gray-500 flex items-center gap-2"><FaLock /> Submitted — only Admin can edit this case.</p>
        ) : (
          <button type="button" onClick={onSave} disabled={isSubmitting} className="px-5 py-2 bg-white border border-indigo-600 text-indigo-700 rounded-lg hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-2">
            <FaSave /> {mode === "create" ? (caseStage === "Lead" ? "Save Lead" : "Save Draft") : "Save"}
          </button>
        )}
        {canAdvance && (
          <button type="button" onClick={onAdvance} disabled={isSubmitting} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? "Saving..." : <>{currentStageDef.next} <FaArrowRight /></>}
          </button>
        )}
      </div>
    </form>
  );
}