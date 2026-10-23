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
  FaClock, FaUsers, FaLink, FaBell, FaHandHoldingUsd, FaChartLine, FaFolderOpen, FaClipboardList,
} from "react-icons/fa";
import PersonalAccidentForm from "./PersonalAccidentForm";
import TravelInsuranceForm from "./TravelInsuranceForm";
import {
  OTHER_MANUFACTURER, getManufacturerOptions, isManufacturerValidForType, getMotorPremiumParts,
} from "./motorInsurance";
import {
  LOB_OPTIONS, SOURCE_OPTIONS, GENDER_OPTIONS, POLICY_TYPE_OPTIONS, QUALIFICATION_OPTIONS, OCCUPATION_OPTIONS,
  RELATIONSHIP_OPTIONS, YES_NO_OPTIONS, NCB_OPTIONS, VEHICLE_TYPE_OPTIONS, FUEL_TYPE_OPTIONS,
  PREVIOUS_INSURANCE_STATUS_OPTIONS, INSURANCE_TYPE_OPTIONS, DEVICE_TYPE_OPTIONS, INSURER_OPTIONS,
  POLICY_TENURE_OPTIONS, PAYMENT_TERM_OPTIONS, SUM_INSURED_OPTIONS, RIDER_OPTIONS, PREVIOUS_POLICY_CASE_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS, ADD_ON_OPTIONS, QUOTE_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, EMANDATE_STATUS_OPTIONS,
  ISSUANCE_STATUS_OPTIONS, CASHBACK_STATUS_OPTIONS, CASHBACK_PAYEE_OPTIONS,
  IDX, STAGES, stageIndex, getStage, isEmiEligibleLob, isKnownInsurer, computeQuote, fmt, num,
  deriveCaseStatus, statusBadgeClass,
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

const Section = ({ n, title, icon: Icon, adminOnly, tone = "indigo", status, children }) => {
  const tones = {
    indigo: "border-indigo-200 text-indigo-700",
    emerald: "border-emerald-200 text-emerald-700",
    amber: "border-amber-200 text-amber-700",
    gray: "border-gray-200 text-gray-700",
  };
  return (
    <section className={cx("border-t-2 pt-4 mt-6", tones[tone].split(" ")[0])} data-section={title}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className={cx("text-lg font-semibold flex items-center gap-2", tones[tone].split(" ")[1])}>
          {n && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-current/10 text-sm border border-current">{n}</span>}
          {Icon && <Icon />} {title}
        </h3>
        {adminOnly && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Admin</span>}
        {status && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{status}</span>}
      </div>
      {children}
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
    sections, stageIdx, isAdmin, instalment, acceptedQuote, sourceDependentField, visibleStages, nextStage,
    quotesLocked, paymentLocked, finalAmounts, emiAmounts, emiSchedule, cashbackCalc, profitCalc,
    toggleInsurer, updateQuote, updateMember, updateMemberRider, updatePortability, scrollToError,
  } = c;
  const err = validationErrors;
  const reached = (key) => stageIdx >= IDX[key];
  const employeeView = audience === "employee" || !isAdmin;
  const hideAdminModules = audience === "employee";
  const canEdit = (key) => getStage(key).access === "all" || isAdmin;
  const currentStageDef = getStage(caseStage);
  const canAdvance = !!nextStage && canEdit(caseStage);

  const renderAddOnModal = () => {
    if (!showAddOnModal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto"
        onClick={() => setShowAddOnModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaShieldAlt className="text-indigo-600" /> Select Add-Ons
            </h2>
            <button onClick={() => setShowAddOnModal(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Select the add-ons you want to include in the policy:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADD_ON_OPTIONS.map((addOn) => (
                <label key={addOn} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={motorDetails.selectedAddOns?.includes(addOn) || false}
                    onChange={(e) => {
                      const current = motorDetails.selectedAddOns || [];
                      let updated;
                      if (e.target.checked) {
                        updated = [...current, addOn];
                      } else {
                        updated = current.filter(item => item !== addOn);
                      }
                      setMotorDetails(prev => ({ ...prev, selectedAddOns: updated }));
                    }}
                    className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{addOn}</span>
                    <p className="text-xs text-gray-500">Additional coverage for your policy</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowAddOnModal(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddOnModal(false);
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <FaCheck /> Confirm Add-Ons
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };


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
          className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <FaExclamationCircle className="text-red-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Validation Errors</h3>
              <p className="text-sm text-gray-500">Please fix the following issues:</p>
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
  // RENDER: MOTOR FORM - UPDATED with manufacturer lists + Other
  // ============================================================
  const renderMotorForm = () => {
    const maxDate = getMaxDate();
    const odRestrictions = getODDueDateRestrictions();
    
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = 0; i <= 20; i++) {
      yearOptions.push(currentYear - i);
    }
    
    const monthOptions = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const isBundlePackage = motorDetails.insuranceType?.startsWith("Bundle Package");
    const isComprehensiveOrSAOD = 
      motorDetails.insuranceType === "Comprehensive (OD+TP)" || 
      motorDetails.insuranceType === "SAOD (On Damage)";
    const isTP = motorDetails.insuranceType === "TP (Third Party)";
    const showActiveFields = motorDetails.previousInsuranceStatus === "Active";
    const showNewVehicleFields = motorDetails.previousInsuranceStatus === "New";
    const showSAODFields = motorDetails.insuranceType === "SAOD (On Damage)";
    const showTPFields = motorDetails.insuranceType === "TP (Third Party)";

    // Manufacturer dropdown depends on Vehicle Type
    const manufacturerInfo = getManufacturerOptions(motorDetails.vehicleType, motorDetails.manufacturer);
    const isOtherManufacturer = motorDetails.manufacturer === OTHER_MANUFACTURER;

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaCar /> Motor Insurance Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vehicle Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">Vehicle Type <span className="text-red-500">*</span></label>
            <select
              data-field="vehicleType"
              value={motorDetails.vehicleType}
              onChange={(e) => {
                const vehicleType = e.target.value;
                setMotorDetails(prev => {
                  // Clear the manufacturer if it doesn't belong to the new vehicle type's list
                  const keep = isManufacturerValidForType(vehicleType, prev.manufacturer);
                  return {
                    ...prev,
                    vehicleType,
                    manufacturer: keep ? prev.manufacturer : "",
                    otherManufacturer: keep ? prev.otherManufacturer : "",
                  };
                });
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Vehicle Type</option>
              {VEHICLE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleType}</p>}
          </div>

          {/* Previous Insurance Status */}
          <div>
            <label className="text-sm font-medium text-gray-700">Previous Insurance Status <span className="text-red-500">*</span></label>
            <select
              data-field="previousInsuranceStatus"
              value={motorDetails.previousInsuranceStatus}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, previousInsuranceStatus: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.previousInsuranceStatus ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Status</option>
              {PREVIOUS_INSURANCE_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.previousInsuranceStatus && <p className="text-red-500 text-xs mt-1">{validationErrors.previousInsuranceStatus}</p>}
          </div>

          {/* Registration Number - Only for non-New vehicles */}
          {!showNewVehicleFields && (
            <div>
              <label className="text-sm font-medium text-gray-700">Registration No. <span className="text-red-500">*</span></label>
              <input
                data-field="registrationNumber"
                type="text"
                value={motorDetails.registrationNumber}
                onChange={(e) => setMotorDetails(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.registration ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., BR01AB1234"
              />
              {validationErrors.registration && <p className="text-red-500 text-xs mt-1">{validationErrors.registration}</p>}
            </div>
          )}

          {/* Auto-fetched RTO Code - Only for non-New vehicles */}
          {!showNewVehicleFields && motorDetails.autoRtoCode && (
            <div>
              <label className="text-sm font-medium text-gray-700">RTO Code (Auto-fetched)</label>
              <input
                type="text"
                value={motorDetails.autoRtoCode}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 uppercase"
              />
            </div>
          )}

          {/* Insurance Type */}
          <div className={showNewVehicleFields ? "lg:col-span-3" : ""}>
            <label className="text-sm font-medium text-gray-700">Insurance Type <span className="text-red-500">*</span></label>
            <select
              data-field="insuranceType"
              value={motorDetails.insuranceType}
              onChange={(e) => {
                const selectedType = e.target.value;
                setMotorDetails(prev => ({ 
                  ...prev, 
                  insuranceType: selectedType,
                  odDueDate: "",
                  tpDueDate: "",
                  saodOdDueDate: "",
                  saodTpDueDate: "",
                  saodPolicyNo: "",
                  saodPreviousInsurerName: "",
                  saodIdvAsPerPYP: "",
                }));
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.insuranceType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Insurance Type</option>
              {INSURANCE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.insuranceType && <p className="text-red-500 text-xs mt-1">{validationErrors.insuranceType}</p>}
            
            {isBundlePackage && (
              <p className="text-xs text-blue-600 mt-1">
                Bundle Package selected - {motorDetails.insuranceType}
              </p>
            )}
          </div>
          {/* Sum Insured - Manual entry for Motor Insurance */}
<div>
  <label className="text-sm font-medium text-gray-700">Sum Insured (IDV) — Manual Entry</label>
  <input
    type="text"
    value={formData.sumInsured}
    onChange={(e) => setFormData(prev => ({ ...prev, sumInsured: e.target.value }))}
    className="w-full p-2 border border-gray-300 rounded-lg"
    placeholder="Enter Sum Insured manually (e.g., 5,50,000)"
  />
</div>
        </div>

        {/* New Vehicle Details Section */}
        {showNewVehicleFields && (
          <div className="mt-4 border-t border-blue-200 pt-4">
            <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <FaCar /> New Vehicle Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Manufacturer <span className="text-red-500">*</span></label>
                <select
                  data-field="manufacturer"
                  value={motorDetails.manufacturer}
                  disabled={!motorDetails.vehicleType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMotorDetails(prev => ({
                      ...prev,
                      manufacturer: value,
                      otherManufacturer: value === OTHER_MANUFACTURER ? prev.otherManufacturer : "",
                    }));
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.manufacturer ? 'border-red-500' : 'border-gray-300'} ${!motorDetails.vehicleType ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">{motorDetails.vehicleType ? "Select Manufacturer" : "Select Vehicle Type first"}</option>
                  {manufacturerInfo.legacyValue && (
                    <option value={manufacturerInfo.legacyValue}>{manufacturerInfo.legacyValue} (saved earlier)</option>
                  )}
                  {manufacturerInfo.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {motorDetails.vehicleType && (
                  <p className="text-xs text-gray-500 mt-1">
                    {manufacturerInfo.count} manufacturers for {motorDetails.vehicleType}. Not listed? Choose "Other".
                  </p>
                )}
                {validationErrors.manufacturer && <p className="text-red-500 text-xs mt-1">{validationErrors.manufacturer}</p>}
              </div>

              {/* Manual manufacturer name when "Other" is selected */}
              {isOtherManufacturer && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Manufacturer Name (Manual) <span className="text-red-500">*</span></label>
                  <input
                    data-field="otherManufacturer"
                    type="text"
                    value={motorDetails.otherManufacturer || ""}
                    onChange={(e) => setMotorDetails(prev => ({ ...prev, otherManufacturer: e.target.value }))}
                    className={`w-full p-2 border rounded-lg ${validationErrors.otherManufacturer ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter manufacturer / company name"
                  />
                  {validationErrors.otherManufacturer && <p className="text-red-500 text-xs mt-1">{validationErrors.otherManufacturer}</p>}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isOtherManufacturer ? "Model Name (Manual)" : "Model"} <span className="text-red-500">*</span>
                </label>
                <input
                  data-field="model"
                  type="text"
                  value={motorDetails.model}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, model: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.model ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={isOtherManufacturer ? "Enter model name manually" : "Enter model name"}
                />
                {validationErrors.model && <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fuel Type <span className="text-red-500">*</span></label>
                <select
                  data-field="fuelType"
                  value={motorDetails.fuelType}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, fuelType: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.fuelType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Fuel Type</option>
                  {FUEL_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.fuelType && <p className="text-red-500 text-xs mt-1">{validationErrors.fuelType}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">RTO Code <span className="text-red-500">*</span></label>
                <input
                  data-field="rtoCode"
                  type="text"
                  value={motorDetails.rtoCode}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, rtoCode: e.target.value.toUpperCase() }))}
                  className={`w-full p-2 border rounded-lg uppercase ${validationErrors.rtoCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., BR01"
                />
                {validationErrors.rtoCode && <p className="text-red-500 text-xs mt-1">{validationErrors.rtoCode}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Chesis No. <span className="text-red-500">*</span></label>
                <input
                  data-field="chesisNo"
                  type="text"
                  value={motorDetails.chesisNo}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, chesisNo: e.target.value.toUpperCase() }))}
                  className={`w-full p-2 border rounded-lg uppercase ${validationErrors.chesisNo ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter chassis number"
                />
                {validationErrors.chesisNo && <p className="text-red-500 text-xs mt-1">{validationErrors.chesisNo}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Year of Manufacturing <span className="text-red-500">*</span></label>
                <select
                  data-field="yearOfManufacturing"
                  value={motorDetails.yearOfManufacturing}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, yearOfManufacturing: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.yearOfManufacturing ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                {validationErrors.yearOfManufacturing && <p className="text-red-500 text-xs mt-1">{validationErrors.yearOfManufacturing}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Month of Manufacturing <span className="text-red-500">*</span></label>
                <select
                  data-field="monthOfManufacturing"
                  value={motorDetails.monthOfManufacturing}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, monthOfManufacturing: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.monthOfManufacturing ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Month</option>
                  {monthOptions.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
                {validationErrors.monthOfManufacturing && <p className="text-red-500 text-xs mt-1">{validationErrors.monthOfManufacturing}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">IDV (As per Invoice) <span className="text-red-500">*</span></label>
                <input
                  data-field="idvAsPerInvoice"
                  type="number"
                  value={motorDetails.idvAsPerInvoice}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, idvAsPerInvoice: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.idvAsPerInvoice ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter IDV amount"
                />
                {validationErrors.idvAsPerInvoice && <p className="text-red-500 text-xs mt-1">{validationErrors.idvAsPerInvoice}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Invoice Copy <span className="text-red-500">*</span></label>
                {typeof motorDetails.invoiceCopy === "string" && motorDetails.invoiceCopy && (
                  <div className="mb-1">
                    <a
                      href={motorDetails.invoiceCopy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 underline"
                    >
                      View current Invoice file
                    </a>
                  </div>
                )}
                <input
                  data-field="invoiceCopy"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, invoiceCopy: e.target.files[0] || prev.invoiceCopy }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.invoiceCopy ? 'border-red-500' : 'border-gray-300'}`}
                />
                {motorDetails.invoiceCopy && typeof motorDetails.invoiceCopy !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
                {validationErrors.invoiceCopy && <p className="text-red-500 text-xs mt-1">{validationErrors.invoiceCopy}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Upload Chesis No. Photo (Not Mandatory)</label>
                {typeof motorDetails.chesisPhoto === "string" && motorDetails.chesisPhoto && (
                  <div className="mb-1">
                    <a
                      href={motorDetails.chesisPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 underline"
                    >
                      View current Chesis photo
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, chesisPhoto: e.target.files[0] || prev.chesisPhoto }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {motorDetails.chesisPhoto && typeof motorDetails.chesisPhoto !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
              </div>
            </div>
          </div>
        )}

        {/* Active Policy Fields */}
        {showActiveFields && (
          <div className="mt-4 border-t border-green-200 pt-4">
            <h4 className="text-md font-semibold text-green-600 mb-3 flex items-center gap-2">
              <FaShieldAlt /> Active Policy Details
            </h4>
            
            {isComprehensiveOrSAOD && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">OD Due Date <span className="text-red-500">*</span></label>
                  <input
                    data-field="odDueDate"
                    type="date"
                    min={odRestrictions.min}
                    max={odRestrictions.max}
                    value={motorDetails.odDueDate}
                    onChange={(e) => {
                      const selected = new Date(e.target.value);
                      const minDate = new Date(odRestrictions.min);
                      const maxDate = new Date(odRestrictions.max);
                      if (selected >= minDate && selected <= maxDate) {
                        setMotorDetails(prev => ({ ...prev, odDueDate: e.target.value }));
                      } else {
                        alert("OD Due Date must be within 90 days before or 60 days after today");
                      }
                    }}
                    className={`w-full p-2 border rounded-lg ${validationErrors.odDueDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 90 days before to 60 days after today</p>
                  {validationErrors.odDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.odDueDate}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">TP Due Date <span className="text-red-500">*</span></label>
                  <input
                    data-field="tpDueDate"
                    type="date"
                    value={motorDetails.tpDueDate}
                    onChange={(e) => setMotorDetails(prev => ({ ...prev, tpDueDate: e.target.value }))}
                    className={`w-full p-2 border rounded-lg ${validationErrors.tpDueDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.tpDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.tpDueDate}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Policy No. <span className="text-red-500">*</span></label>
                <input
                  data-field="policyNo"
                  type="text"
                  value={motorDetails.policyNo}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, policyNo: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.policyNo ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter policy number"
                />
                {validationErrors.policyNo && <p className="text-red-500 text-xs mt-1">{validationErrors.policyNo}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Previous Insurer Name <span className="text-red-500">*</span></label>
                <select
                  data-field="previousInsurerName"
                  value={motorDetails.previousInsurerName}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, previousInsurerName: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.previousInsurerName ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Insurer</option>
                  {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.previousInsurerName && <p className="text-red-500 text-xs mt-1">{validationErrors.previousInsurerName}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">IDV (As per PYP) <span className="text-red-500">*</span></label>
                <input
                  data-field="idvAsPerPYP"
                  type="number"
                  value={motorDetails.idvAsPerPYP}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, idvAsPerPYP: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.idvAsPerPYP ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter IDV amount"
                />
                {validationErrors.idvAsPerPYP && <p className="text-red-500 text-xs mt-1">{validationErrors.idvAsPerPYP}</p>}
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Claim & NCB Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Claim Taken? <span className="text-red-500">*</span></label>
                  <select
                    data-field="claimTaken"
                    value={motorDetails.claimTaken}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMotorDetails(prev => ({ 
                        ...prev, 
                        claimTaken: value,
                        ncb: value === "Yes" ? "0%" : prev.ncb
                      }));
                    }}
                    className={`w-full p-2 border rounded-lg ${validationErrors.claimTaken ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select</option>
                    {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {validationErrors.claimTaken && <p className="text-red-500 text-xs mt-1">{validationErrors.claimTaken}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">NCB</label>
                  {motorDetails.claimTaken === "Yes" ? (
                    <div>
                      <input
                        type="text"
                        value="0%"
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-red-600 font-semibold"
                      />
                      <p className="text-xs text-red-500 mt-1">Auto-set to 0% as Claim Taken is Yes</p>
                    </div>
                  ) : (
                    <select
                      data-field="ncb"
                      value={motorDetails.ncb}
                      onChange={(e) => setMotorDetails(prev => ({ ...prev, ncb: e.target.value }))}
                      className={`w-full p-2 border rounded-lg ${validationErrors.ncb ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={motorDetails.claimTaken === ""}
                    >
                      <option value="">{motorDetails.claimTaken === "" ? "Select Claim Taken first" : "Select NCB"}</option>
                      {NCB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {validationErrors.ncb && <p className="text-red-500 text-xs mt-1">{validationErrors.ncb}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SAOD Specific Fields */}
        {showSAODFields && showActiveFields && (
          <div className="mt-4 border-t border-purple-200 pt-4">
            <h5 className="text-sm font-semibold text-purple-600 mb-3">SAOD (On Damage) Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">OD Due Date <span className="text-red-500">*</span></label>
                <input
                  data-field="saodOdDueDate"
                  type="date"
                  min={odRestrictions.min}
                  max={odRestrictions.max}
                  value={motorDetails.saodOdDueDate}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    const minDate = new Date(odRestrictions.min);
                    const maxDate = new Date(odRestrictions.max);
                    if (selected >= minDate && selected <= maxDate) {
                      setMotorDetails(prev => ({ ...prev, saodOdDueDate: e.target.value }));
                    } else {
                      alert("OD Due Date must be within 90 days before or 60 days after today");
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 90 days before to 60 days after today</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">TP Due Date <span className="text-red-500">*</span></label>
                <input
                  data-field="saodTpDueDate"
                  type="date"
                  value={motorDetails.saodTpDueDate}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodTpDueDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Previous Policy No. <span className="text-red-500">*</span></label>
                <input
                  data-field="saodPolicyNo"
                  type="text"
                  value={motorDetails.saodPolicyNo}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodPolicyNo: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Previous Insurer Name <span className="text-red-500">*</span></label>
                <select
                  data-field="saodPreviousInsurerName"
                  value={motorDetails.saodPreviousInsurerName}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodPreviousInsurerName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Insurer</option>
                  {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">IDV (As per PYP) <span className="text-red-500">*</span></label>
                <input
                  data-field="saodIdvAsPerPYP"
                  type="number"
                  value={motorDetails.saodIdvAsPerPYP}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodIdvAsPerPYP: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter IDV amount"
                />
              </div>
            </div>
          </div>
        )}

        {/* TP Insurance Fields */}
        {showTPFields && (
          <div className="mt-4 border-t border-orange-200 pt-4">
            <h5 className="text-sm font-semibold text-orange-600 mb-3">TP (Third Party) Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">TP Due Date <span className="text-red-500">*</span></label>
                <input
                  data-field="tpInsuranceDueDate"
                  type="date"
                  value={motorDetails.tpInsuranceDueDate}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, tpInsuranceDueDate: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.tpInsuranceDueDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.tpInsuranceDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.tpInsuranceDueDate}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Add-On Section - For all types except TP */}
        {!isTP && (
          <div className="mt-4 border-t border-pink-200 pt-4">
            <h5 className="text-sm font-semibold text-pink-600 mb-3 flex items-center gap-2">
              <FaShieldAlt /> Add-On
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Add-On Required? <span className="text-red-500">*</span></label>
                <select
                  data-field="addOnRequired"
                  value={motorDetails.addOnRequired}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMotorDetails(prev => ({ 
                      ...prev, 
                      addOnRequired: value,
                      selectedAddOns: value === "No" ? [] : prev.selectedAddOns
                    }));
                    if (value === "Yes") {
                      setShowAddOnModal(true);
                    }
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.addOnRequired ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.addOnRequired && <p className="text-red-500 text-xs mt-1">{validationErrors.addOnRequired}</p>}
              </div>

              {motorDetails.addOnRequired === "Yes" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Selected Add-Ons</label>
                  <div className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[40px]">
                    {motorDetails.selectedAddOns && motorDetails.selectedAddOns.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {motorDetails.selectedAddOns.map((addOn, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                            {addOn}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No add-ons selected</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddOnModal(true)}
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <FaEdit className="h-3 w-3" /> Manage Add-Ons
                  </button>
                  {validationErrors.selectedAddOns && <p className="text-red-500 text-xs mt-1">{validationErrors.selectedAddOns}</p>}
                </div>
              )}
              
              {motorDetails.addOnRequired === "No" && (
                <div className="flex items-center text-gray-500 text-sm">
                  <FaCheck className="text-green-500 mr-2" /> No add-ons selected
                </div>
              )}
            </div>
          </div>
        )}

        {/* TP Insurance - Add-On automatically set to No */}
        {isTP && (
          <div className="mt-4 border-t border-orange-200 pt-4">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700">
                <FaShieldAlt />
                <span className="font-medium">Add-On:</span>
                <span className="font-bold">No</span>
                <span className="text-sm text-orange-600">(Auto-set for TP Insurance)</span>
              </div>
              <input type="hidden" value="No" />
            </div>
          </div>
        )}

       {/* Uploads Section - Updated for all statuses */}
<div className="mt-4 border-t border-gray-200 pt-4">
  <h5 className="text-sm font-semibold text-gray-700 mb-3">Upload Documents</h5>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    
    {/* PYP Upload - Show for ALL statuses (Active, Expired, New) */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Upload PYP 
        {motorDetails.previousInsuranceStatus === "Active" && <span className="text-red-500">*</span>}
      </label>
      {typeof motorDetails.pypFile === "string" && motorDetails.pypFile && (
        <div className="mb-1">
          <a
            href={motorDetails.pypFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 underline"
          >
            View current PYP file
          </a>
        </div>
      )}
      <input
        data-field="pypFile"
        type="file"
        accept=".pdf"
        onChange={(e) => setMotorDetails(prev => ({ ...prev, pypFile: e.target.files[0] || prev.pypFile }))}
        className={`w-full p-2 border rounded-lg ${validationErrors.pypFile ? 'border-red-500' : 'border-gray-300'}`}
      />
      {motorDetails.pypFile && typeof motorDetails.pypFile !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
      {validationErrors.pypFile && <p className="text-red-500 text-xs mt-1">{validationErrors.pypFile}</p>}
    </div>

    {/* RC Front Upload - Show for ALL statuses */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        RC Front Upload
        {motorDetails.previousInsuranceStatus !== "New" && <span className="text-red-500">*</span>}
      </label>
      {typeof motorDetails.rcFrontFile === "string" && motorDetails.rcFrontFile && (
        <div className="mb-1">
          <a
            href={motorDetails.rcFrontFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 underline"
          >
            View current RC Front file
          </a>
        </div>
      )}
      <input
        data-field="rcFrontFile"
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={(e) => setMotorDetails(prev => ({ ...prev, rcFrontFile: e.target.files[0] || prev.rcFrontFile }))}
        className={`w-full p-2 border rounded-lg ${validationErrors.rcFrontFile ? 'border-red-500' : 'border-gray-300'}`}
      />
      {motorDetails.rcFrontFile && typeof motorDetails.rcFrontFile !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
      {validationErrors.rcFrontFile && <p className="text-red-500 text-xs mt-1">{validationErrors.rcFrontFile}</p>}
    </div>

    {/* RC Back Upload - Show for ALL statuses */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        RC Back Upload
        {motorDetails.previousInsuranceStatus !== "New" && <span className="text-red-500">*</span>}
      </label>
      {typeof motorDetails.rcBackFile === "string" && motorDetails.rcBackFile && (
        <div className="mb-1">
          <a
            href={motorDetails.rcBackFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 underline"
          >
            View current RC Back file
          </a>
        </div>
      )}
      <input
        data-field="rcBackFile"
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={(e) => setMotorDetails(prev => ({ ...prev, rcBackFile: e.target.files[0] || prev.rcBackFile }))}
        className={`w-full p-2 border rounded-lg ${validationErrors.rcBackFile ? 'border-red-500' : 'border-gray-300'}`}
      />
      {motorDetails.rcBackFile && typeof motorDetails.rcBackFile !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
      {validationErrors.rcBackFile && <p className="text-red-500 text-xs mt-1">{validationErrors.rcBackFile}</p>}
    </div>
  </div>
</div>

        {/* Add-On Modal */}
        {renderAddOnModal()}
      </div>
    );
  };

  // ============================================================
  // RENDER: ELECTRONIC FORM
  // ============================================================
  const renderElectronicForm = () => {
    const isDeviceOlderThan15Days = () => {
      if (!electronicDetails.dateOfPurchase) return false;
      const purchaseDate = new Date(electronicDetails.dateOfPurchase);
      const today = new Date();
      const diffDays = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
      return diffDays > 15;
    };

    const maxDate = getMaxDate();

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaMobileAlt /> Mobile/Electronic Equipment Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Device Type</label>
            <select
              data-field="deviceType"
              value={electronicDetails.deviceType}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, deviceType: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.deviceType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select</option>
              {DEVICE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.deviceType && <p className="text-red-500 text-xs mt-1">{validationErrors.deviceType}</p>}
          </div>

          {electronicDetails.deviceType === "Other" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Specify Device Type</label>
              <input
                type="text"
                value={electronicDetails.otherDeviceType}
                onChange={(e) => setElectronicDetails(prev => ({ ...prev, otherDeviceType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Date of Purchase</label>
            <input
              data-field="dateOfPurchase"
              type="date"
              max={maxDate}
              value={electronicDetails.dateOfPurchase}
              onChange={(e) => {
                const selected = new Date(e.target.value);
                const today = new Date();
                if (selected > today) {
                  alert("Date cannot be in the future");
                  return;
                }
                setElectronicDetails(prev => ({ ...prev, dateOfPurchase: e.target.value }));
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.dateOfPurchase ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.dateOfPurchase && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfPurchase}</p>}
            {isDeviceOlderThan15Days() && (
              <p className="text-orange-500 text-xs mt-1">⚠️ Device is older than 15 days</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Purchase Value (incl. Tax)</label>
            <input
              data-field="purchaseValue"
              type="number"
              value={electronicDetails.purchaseValue}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, purchaseValue: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.purchaseValue ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.purchaseValue && <p className="text-red-500 text-xs mt-1">{validationErrors.purchaseValue}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              data-field="electronicAadhaar"
              type="text"
              value={electronicDetails.aadhaarNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 12) setElectronicDetails(prev => ({ ...prev, aadhaarNumber: val }));
              }}
              maxLength="12"
              className={`w-full p-2 border rounded-lg ${validationErrors.electronicAadhaar ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter 12 digits only"
            />
            {electronicDetails.aadhaarNumber && electronicDetails.aadhaarNumber.length > 0 && !validateAadhaar(electronicDetails.aadhaarNumber) && (
              <p className="text-red-500 text-xs mt-1">Enter exactly 12 digits</p>
            )}
            {validationErrors.electronicAadhaar && <p className="text-red-500 text-xs mt-1">{validationErrors.electronicAadhaar}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
            {typeof electronicDetails.aadhaarFile === "string" && electronicDetails.aadhaarFile && (
              <div className="mb-1">
                <a
                  href={electronicDetails.aadhaarFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current Aadhaar file
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, aadhaarFile: e.target.files[0] || prev.aadhaarFile }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">PAN Number</label>
            <input
              data-field="electronicPan"
              type="text"
              value={electronicDetails.panNumber}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (val.length <= 10) setElectronicDetails(prev => ({ ...prev, panNumber: val }));
              }}
              maxLength="10"
              className={`w-full p-2 border rounded-lg uppercase ${validationErrors.electronicPan ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="ABCDE1234F"
            />
            {electronicDetails.panNumber && electronicDetails.panNumber.length > 0 && !validatePAN(electronicDetails.panNumber) && (
              <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
            )}
            {validationErrors.electronicPan && <p className="text-red-500 text-xs mt-1">{validationErrors.electronicPan}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload PAN</label>
            {typeof electronicDetails.panFile === "string" && electronicDetails.panFile && (
              <div className="mb-1">
                <a
                  href={electronicDetails.panFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current PAN file
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, panFile: e.target.files[0] || prev.panFile }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">IMEI Number</label>
            <input
              type="text"
              value={electronicDetails.imeiNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 15) setElectronicDetails(prev => ({ ...prev, imeiNumber: val }));
              }}
              maxLength="15"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {isDeviceOlderThan15Days() && (
              <p className="text-red-500 text-xs mt-1">IMEI required for devices older than 15 days</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload IMEI Image</label>
            {typeof electronicDetails.imeiImage === "string" && electronicDetails.imeiImage && (
              <div className="mb-1">
                <a
                  href={electronicDetails.imeiImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current IMEI image
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, imeiImage: e.target.files[0] || prev.imeiImage }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">
              Device Photos (3-4 photos from different angles showing IMEI)
            </label>
            {electronicDetails.devicePhotos && electronicDetails.devicePhotos.length > 0 && (
              <div className="mb-1 flex flex-wrap gap-2">
                {electronicDetails.devicePhotos.map((photo, idx) => {
                  if (typeof photo === "string" && photo) {
                    return (
                      <a
                        key={idx}
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 underline"
                      >
                        View current photo {idx + 1}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg"
              multiple
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, devicePhotos: Array.from(e.target.files) }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {electronicDetails.devicePhotos && electronicDetails.devicePhotos.some(f => typeof f !== "string") && (
              <p className="text-sm text-gray-500 mt-1">{electronicDetails.devicePhotos.filter(f => typeof f !== "string").length} new photos selected</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Purchase Invoice</label>
            {typeof electronicDetails.purchaseInvoice === "string" && electronicDetails.purchaseInvoice && (
              <div className="mb-1">
                <a
                  href={electronicDetails.purchaseInvoice}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current invoice
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, purchaseInvoice: e.target.files[0] || prev.purchaseInvoice }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
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
          {LOB_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
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
        <Field label="Policy Tenure">
          <select data-field="policyTenure" value={formData.policyTenure} onChange={(e) => setFormData((p) => ({ ...p, policyTenure: e.target.value }))} className={inputCls()}>
            <option value="">Select</option>
            {POLICY_TENURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Paying Term">
          <select data-field="paymentTerm" value={formData.paymentTerm} onChange={(e) => setFormData((p) => ({ ...p, paymentTerm: e.target.value }))} className={inputCls()}>
            <option value="">Select</option>
            {formData.paymentTerm && !termOptions.includes(formData.paymentTerm) && <option value={formData.paymentTerm}>{formData.paymentTerm}</option>}
            {termOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
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

  // QUOTE — insurers to request quotes from (multiple choice) + remarks
  const renderQuoteRequest = () => {
    const sel = workflowDetails.selectedInsurers || [];
    const unknown = sel.filter((n) => !isKnownInsurer(n));
    return (
      <div className="mt-2">
        <h4 className="text-md font-semibold text-indigo-600 mb-1">Quote Required From (Insurer List) <span className="text-red-500">*</span></h4>
        <p className="text-xs text-gray-500 mb-2">Select every insurer to request a quote from. {sel.length} selected.</p>
        {quotesLocked && <div className="mb-2"><ReadOnlyNote>Insurer selection is locked because Payment has started.</ReadOnlyNote></div>}
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
          {INSURER_OPTIONS.map((ins) => (
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
    const findQ = (ins) => quotes.find((q) => q.insurerName === ins) || { insurerName: ins, gstPercent: "18", quoteStatus: "Pending" };
    if (!sel.length) return <ReadOnlyNote>No insurers were selected in the Quote module.</ReadOnlyNote>;

    if (!isAdmin) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50 text-left"><tr><th className="p-2">Insurer</th><th className="p-2">Net</th><th className="p-2">GST</th><th className="p-2">Gross</th><th className="p-2">Status</th></tr></thead>
            <tbody>
              {sel.map((ins) => {
                const q = findQ(ins); const calc = computeQuote(q);
                return (
                  <tr key={ins} className="border-t">
                    <td className="p-2">{ins}</td><td className="p-2">{q.netPremium ? fmt(q.netPremium) : "—"}</td>
                    <td className="p-2">{q.netPremium ? fmt(calc.gstValue) : "—"}</td><td className="p-2">{q.netPremium ? fmt(calc.grossPremium) : "—"}</td>
                    <td className="p-2"><span className={cx("px-2 py-0.5 rounded-full text-xs", statusBadge(q.quoteStatus))}>{q.quoteStatus || "Pending"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">Quotes are filled by Admin.</p>
        </div>
      );
    }

    return (
      <div data-field="quoteStatus">
        {quotesLocked && <div className="mb-3"><ReadOnlyNote>Quotes are locked because Payment has started.</ReadOnlyNote></div>}
        {err.quoteStatus && <p className="text-red-500 text-sm mb-2">{err.quoteStatus}</p>}
        {sel.map((ins) => {
          const q = findQ(ins);
          const calc = computeQuote(q);
          const L = quotesLocked;
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
                <Field label="Quote Net Premium" error={err[k("net")]}>
                  <input data-field={k("net")} type="number" min="0" disabled={L} value={q.netPremium ?? ""} onChange={(e) => updateQuote(ins, "netPremium", e.target.value)} className={inputCls(err[k("net")], L)} />
                </Field>
                <Field label="GST %" error={err[k("gst")]}>
                  <input data-field={k("gst")} type="number" min="0" max="100" disabled={L} value={q.gstPercent ?? ""} onChange={(e) => updateQuote(ins, "gstPercent", e.target.value)} className={inputCls(err[k("gst")], L)} />
                </Field>
                <Field label="GST Value (auto)"><input type="text" readOnly value={fmt(calc.gstValue)} className={autoCls} /></Field>
                <Field label="Gross Premium (auto)"><input type="text" readOnly value={fmt(calc.grossPremium)} className={cx(autoCls, "font-medium")} /></Field>
                <Field label="Upload Quote">
                  <ViewLink url={q.quoteUpload} label="View current quote" />
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={L} onChange={(e) => e.target.files[0] && setQuoteFiles((p) => ({ ...p, [ins]: e.target.files[0] }))} className={inputCls(false, L)} />
                  <NewFileTag file={quoteFiles[ins]} />
                </Field>
                <Field label="Pay Out (%)" error={err[k("payout")]} hint="Insurer payout slab offered on this quote">
                  <input data-field={k("payout")} type="number" min="0" max="100" disabled={L} value={q.payoutPercent ?? ""} onChange={(e) => updateQuote(ins, "payoutPercent", e.target.value)} className={inputCls(err[k("payout")], L)} />
                </Field>
                <Field label="Quote Status">
                  <select disabled={L} value={q.quoteStatus || "Pending"} onChange={(e) => updateQuote(ins, "quoteStatus", e.target.value)} className={inputCls(false, L)}>
                    {QUOTE_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
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
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm">
        {rows.map(([l, v]) => (
          <div key={l}><p className="text-xs text-gray-500">{l}</p><p className="font-medium text-gray-800 break-words">{v}</p></div>
        ))}
        <div><p className="text-xs text-gray-500">Uploaded Quote</p><ViewLink url={acceptedQuote.quoteUpload} label="View quote" />{!acceptedQuote.quoteUpload && <p className="text-gray-400">—</p>}</div>
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
              <Field label="PAN Number" error={err[k("pan")]}>
                <input data-field={k("pan")} type="text" maxLength="10" value={m.panNumber || ""} onChange={(e) => updateMember(i, "panNumber", e.target.value.toUpperCase().slice(0, 10))} className={cx(inputCls(err[k("pan")]), "uppercase")} placeholder="ABCDE1234F" />
              </Field>
              <Field label="Upload PAN">
                <ViewLink url={m.panFile} />
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files[0] && updateMember(i, "panFile", e.target.files[0])} className={inputCls()} />
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
      </div>
    );
  };

  const renderHealthIssuance = () => {
    const h = healthDetails;
    const members = h.members || [];
    const maxDate = getMaxDate();
    return (
      <div>
        {h.policyType === "Individual" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Field label="Nominee Name" required error={err.nomineeName}>
              <input data-field="nomineeName" type="text" value={h.nomineeName || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, nomineeName: toUpperCase(e.target.value) }))} className={cx(inputCls(err.nomineeName), "uppercase")} />
            </Field>
            <Field label="Nominee DOB" required error={err.nomineeDOB}>
              <input data-field="nomineeDOB" type="date" max={maxDate} value={h.nomineeDOB || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, nomineeDOB: e.target.value }))} className={inputCls(err.nomineeDOB)} />
            </Field>
            <Field label="Nominee Relationship" required error={err.nomineeRelationship}>
              <select data-field="nomineeRelationship" value={h.nomineeRelationship || ""} onChange={(e) => setHealthDetails((p) => ({ ...p, nomineeRelationship: e.target.value }))} className={inputCls(err.nomineeRelationship)}>
                <option value="">Select</option>
                {RELATIONSHIP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
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
    if (!isAdmin) {
      return (
        <ReadOnlyNote>
          Payment is handled by Admin. Payment Status: <b>{w.paymentStatus || "Pending"}</b>
          {w.issuanceStatus ? <> · Status: <b>{w.issuanceStatus}</b></> : null}
          {w.policyNumber ? <> · Policy No: <b>{w.policyNumber}</b></> : null}
        </ReadOnlyNote>
      );
    }
    const L = paymentLocked;
    const pypDue = sections.motor ? motorDetails.odDueDate || motorDetails.tpDueDate : "";
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {L && <div className="sm:col-span-2 lg:col-span-3"><ReadOnlyNote>Saved as Policy Issued — payment and policy details are locked.</ReadOnlyNote></div>}
        <Field label="Final Net Premium" required error={err.finalNetPremium} hint={acceptedQuote ? `Accepted quote: ${fmt(acceptedQuote.netPremium)}` : undefined}>
          <input data-field="finalNetPremium" type="number" min="0" disabled={L} value={w.finalNetPremium} onChange={(e) => setWf({ finalNetPremium: e.target.value })} className={inputCls(err.finalNetPremium, L)} />
        </Field>
        <Field label="GST %" error={err.finalGstPercent}>
          <input data-field="finalGstPercent" type="number" min="0" max="100" disabled={L} value={w.finalGstPercent} onChange={(e) => setWf({ finalGstPercent: e.target.value })} className={inputCls(err.finalGstPercent, L)} />
        </Field>
        <Field label="GST Value (auto)"><input type="text" readOnly value={fmt(finalAmounts.gstValue)} className={autoCls} /></Field>
        <Field label="Gross Premium (auto)"><input type="text" readOnly value={fmt(finalAmounts.gross)} className={cx(autoCls, "font-medium")} /></Field>

        {instalment && (
          <>
            <Field label={`EMI Net Premium (${formData.paymentTerm})`} required error={err.emiNetPremium}>
              <input data-field="emiNetPremium" type="number" min="0" disabled={L} value={w.emiNetPremium} onChange={(e) => setWf({ emiNetPremium: e.target.value })} className={inputCls(err.emiNetPremium, L)} />
            </Field>
            <Field label="EMI GST Value (auto)"><input type="text" readOnly value={fmt(emiAmounts.gstValue)} className={autoCls} /></Field>
            <Field label="EMI Premium — Gross (auto)" hint={`${emiSchedule.total} EMIs over ${formData.policyTenure || "1 Year"}`}>
              <input type="text" readOnly value={fmt(emiAmounts.gross)} className={cx(autoCls, "font-medium")} />
            </Field>
          </>
        )}

        <Field label="Payment URL" className="sm:col-span-2">
          <div className="flex gap-2">
            <input type="url" disabled={L} value={w.paymentUrl} onChange={(e) => setWf({ paymentUrl: e.target.value })} className={inputCls(false, L)} placeholder="https://..." />
            {w.paymentUrl && (
              <a href={w.paymentUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"><FaLink /> Open</a>
            )}
          </div>
        </Field>
        <Field label="Payment Status" required error={err.paymentStatus}>
          <select data-field="paymentStatus" disabled={L} value={w.paymentStatus} onChange={(e) => setWf({ paymentStatus: e.target.value })} className={inputCls(err.paymentStatus, L)}>
            <option value="">Select</option>
            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        {w.paymentStatus === "Payment Done" && (
          <>
            <Field label="UTR Number">
              <input type="text" disabled={L} value={w.utrNumber} onChange={(e) => setWf({ utrNumber: e.target.value })} className={inputCls(false, L)} />
            </Field>
            <Field label="Payment Snapshot">
              <ViewLink url={w.paymentSnapshot} label="View current snapshot" />
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={L} onChange={(e) => e.target.files[0] && setWf({ paymentSnapshot: e.target.files[0] })} className={inputCls(false, L)} />
              <NewFileTag file={w.paymentSnapshot} />
            </Field>
            {instalment && (
              <Field label="e-Mandate Status" required error={err.eMandateStatus}>
                <select data-field="eMandateStatus" disabled={L} value={w.eMandateStatus} onChange={(e) => setWf({ eMandateStatus: e.target.value })} className={inputCls(err.eMandateStatus, L)}>
                  <option value="">Select</option>
                  {EMANDATE_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            )}
          </>
        )}
        <Field label="Status" required error={err.issuanceStatus}>
          <select data-field="issuanceStatus" disabled={L} value={w.issuanceStatus} onChange={(e) => setWf({ issuanceStatus: e.target.value })} className={inputCls(err.issuanceStatus, L)}>
            <option value="">Select</option>
            {ISSUANCE_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        {w.issuanceStatus && w.issuanceStatus !== "Policy Issued" && (
          <Field label="Reason Policy Not Issued (Remarks)" required error={err.notIssuedRemarks} className="sm:col-span-2">
            <textarea data-field="notIssuedRemarks" rows="2" value={w.notIssuedRemarks} onChange={(e) => setWf({ notIssuedRemarks: e.target.value })} className={inputCls(err.notIssuedRemarks)} />
          </Field>
        )}
        {w.issuanceStatus === "Policy Issued" && (
          <>
            <Field label="Policy Number" required error={err.policyNumber}>
              <input data-field="policyNumber" type="text" disabled={L} value={w.policyNumber} onChange={(e) => setWf({ policyNumber: e.target.value })} className={inputCls(err.policyNumber, L)} />
            </Field>
            <Field label="Policy Issued On" required error={err.policyIssuedOn}>
              <input data-field="policyIssuedOn" type="date" disabled={L} value={w.policyIssuedOn} onChange={(e) => setWf({ policyIssuedOn: e.target.value })} className={inputCls(err.policyIssuedOn, L)} />
            </Field>
            <Field label="Policy Start Date" required error={err.policyStartDate} hint={pypDue ? `Not before previous policy due date (${pypDue})` : undefined}>
              <input
                data-field="policyStartDate" type="date" disabled={L} min={pypDue || undefined} value={w.policyStartDate} className={inputCls(err.policyStartDate, L)}
                onChange={(e) => {
                  if (pypDue && new Date(e.target.value) < new Date(pypDue)) {
                    alert("Policy Start Date cannot be earlier than the Previous Policy (PYP) Due Date");
                    return;
                  }
                  setWf({ policyStartDate: e.target.value });
                }}
              />
            </Field>
            <Field label="Policy Expiry Date (auto)" hint="Start Date + Policy Tenure">
              <input type="date" readOnly value={w.policyExpiryDate} className={autoCls} />
            </Field>
            <Field label="Upload Policy Copy">
              <ViewLink url={w.policyCopy} label="View current policy copy" />
              <input type="file" accept=".pdf" disabled={L} onChange={(e) => e.target.files[0] && setWf({ policyCopy: e.target.files[0] })} className={inputCls(false, L)} />
              <NewFileTag file={w.policyCopy} />
            </Field>
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
  const renderCashback = () => {
    if (!isAdmin) return <ReadOnlyNote>Cashback / PayOut is handled by Admin.</ReadOnlyNote>;
    const cb = cashbackDetails;
    const setCb = (patch) => setCashbackDetails((p) => ({ ...p, ...patch }));
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
          {sections.motor ? (
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
    if (stageIdx === IDX.QuoteWorkflow) headline = `Admin is collecting quotes from ${sel.length} insurer${sel.length === 1 ? "" : "s"}. You can still adjust the insurer list until a quote is accepted.`;
    else if (stageIdx === IDX.PolicyIssuance) headline = "A quote has been accepted — fill the proposer & member details below, then use “Request for Payment URL”.";
    else if (w.issuanceStatus === "Policy Issued") headline = "Policy issued.";
    else if (w.issuanceStatus) headline = `Policy status: ${w.issuanceStatus}${w.notIssuedRemarks ? ` — ${w.notIssuedRemarks}` : ""}.`;
    else headline = "Admin is processing the payment and policy issuance.";
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
        stages={hideAdminModules ? visibleStages.filter((x) => !["EmiDues", "Cashback", "Profit"].includes(x.key)) : visibleStages}
        current={caseStage}
        labels={hideAdminModules ? { QuoteWorkflow: "Quotes (Admin)", Payment: "Payment & Issuance (Admin)" } : {}}
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

      <Section n={num_("Lead")} title="Lead" icon={FaClipboardList} status={stageIdx > IDX.Lead ? "Done" : undefined}>
        {renderLeadSection()}
      </Section>

      {reached("Quote") && (
        <Section n={num_("Quote")} title="Quote" icon={FaFileAlt} status={stageIdx > IDX.Quote ? "Requested" : undefined}>
          {!formData.lob && <ReadOnlyNote>Select the LOB in the Lead module first.</ReadOnlyNote>}
          {sections.health && renderHealthQuote()}
          {!sections.health && formData.lob && renderPolicyTerms()}
          {sections.motor && renderMotorForm()}
          {sections.electronic && renderElectronicForm()}
          {sections.pa && <PersonalAccidentForm details={paDetails} setDetails={setPaDetails} errors={err} insurerOptions={INSURER_OPTIONS} />}
          {sections.travel && <TravelInsuranceForm details={travelDetails} setDetails={setTravelDetails} errors={err} lead={formData} />}
          {formData.lob && renderQuoteRequest()}
        </Section>
      )}

      {hideAdminModules && reached("QuoteWorkflow") && renderEmployeeStatus()}

      {!hideAdminModules && reached("QuoteWorkflow") && (
        <Section n={num_("QuoteWorkflow")} title="Quote Workflow" icon={FaClipboardList} adminOnly status={acceptedQuote ? `Accepted: ${acceptedQuote.insurerName}` : undefined}>
          {renderQuoteWorkflow()}
        </Section>
      )}

      {reached("PolicyIssuance") && (
        <Section n={num_("PolicyIssuance")} title="Policy Issuance" icon={FaUsers}>
          {renderAcceptedQuoteSummary()}
          {sections.health ? renderHealthIssuance() : <p className="text-sm text-gray-500">No additional proposer details are needed for this LOB — continue to request the payment URL.</p>}
        </Section>
      )}

      {!hideAdminModules && reached("Payment") && (
        <Section n={num_("Payment")} title="Payment for the Policy" icon={FaMoneyBillWave} adminOnly tone="emerald" status={workflowDetails.issuanceStatus || undefined}>
          {renderPayment()}
        </Section>
      )}

      {!hideAdminModules && reached("EmiDues") && instalment && (
        <Section n={num_("EmiDues")} title="EMI Dues" icon={FaClock} adminOnly tone="emerald">
          {renderEmiDues()}
        </Section>
      )}

      {!hideAdminModules && reached("Cashback") && (
        <Section n={num_("Cashback")} title="Cashback / PayOut to Customer / Employee" icon={FaHandHoldingUsd} adminOnly tone="amber">
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
        <button type="button" onClick={onSave} disabled={isSubmitting} className="px-5 py-2 bg-white border border-indigo-600 text-indigo-700 rounded-lg hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-2">
          <FaSave /> {mode === "create" ? (caseStage === "Lead" ? "Save Lead" : "Save Draft") : "Save"}
        </button>
        {canAdvance && (
          <button type="button" onClick={onAdvance} disabled={isSubmitting} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? "Saving..." : <>{currentStageDef.next} <FaArrowRight /></>}
          </button>
        )}
      </div>
    </form>
  );
}