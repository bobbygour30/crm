// src/lob/useLeadCase.js
// ============================================================
// All form state + behaviour for one lead "case", shared by
// LeadTable.jsx (admin leads) and EmployeeLeads.jsx (employee leads)
// so both pages always behave the same.
// ============================================================
import { useState, useEffect, useMemo } from "react";
import { emptyPA, hydratePA, validatePA, appendPA } from "./PersonalAccidentForm";
import { emptyTravel, hydrateTravel, validateTravel, appendTravel } from "./TravelInsuranceForm";
import { emptyMotorDetails, isAdminUser, OTHER_MANUFACTURER } from "./motorInsurance";
import * as W from "./caseWorkflow";

const str = (v) => (v === null || v === undefined ? "" : v);

const SOURCE_FIELD_LABEL = {
  Employee: "Employee Name",
  "Channel Partner": "Channel Partner Name",
  Store: "Store Name",
  "Social Media": "Social Media Source",
  Other: "Other Source",
};

// Old payment-status values -> new BRD values
const LEGACY_PAYMENT_STATUS = {
  "Quote Under Discussion": { paymentStatus: "Pending" },
  "e-Mandate Status Pending": { paymentStatus: "Payment Done", eMandateStatus: "Pending" },
  "e-Mandate Status Done": { paymentStatus: "Payment Done", eMandateStatus: "Done" },
  "Policy Issued": { paymentStatus: "Payment Done" },
};

/**
 * @param quoteFilePrefix  multipart field prefix for quote files ("quoteFile_" admin leads, "insurerQuoteFile_" employee leads)
 * @param role             "auto" = from the logged-in user, "employee" = always employee view (employee panel)
 */
export default function useLeadCase({ quoteFilePrefix = "quoteFile_", role = "auto" } = {}) {
  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const [formData, setFormData] = useState(W.emptyFormData());
  const [healthDetails, setHealthDetails] = useState(W.emptyHealthDetails());
  const [motorDetails, setMotorDetails] = useState(emptyMotorDetails());
  const [electronicDetails, setElectronicDetails] = useState(W.emptyElectronicDetails());
  const [paDetails, setPaDetails] = useState(emptyPA());
  const [travelDetails, setTravelDetails] = useState(emptyTravel());
  const [workflowDetails, setWorkflowDetails] = useState(W.emptyWorkflow());
  const [cashbackDetails, setCashbackDetails] = useState(W.emptyCashback());
  const [payoutDetails, setPayoutDetails] = useState(W.emptyPayout());
  const [caseStage, setCaseStage] = useState("Lead");
  const [savedLead, setSavedLead] = useState(null);
  const [savedIssued, setSavedIssued] = useState(false);
  const [quoteFiles, setQuoteFiles] = useState({}); // { insurerName: File }
  const [validationErrors, setValidationErrors] = useState({});
  const [validationPopup, setValidationPopup] = useState({ show: false, errors: [] });
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pinFetchError, setPinFetchError] = useState("");

  // ------------------------------------------------------------
  // DERIVED
  // ------------------------------------------------------------
  const sections = useMemo(() => W.detectSections(formData.lob), [formData.lob]);
  const stageIdx = W.stageIndex(caseStage);
  const isAdmin = role === "employee" ? false : isAdminUser();
  const instalment = W.isInstalment(formData.paymentTerm);
  const acceptedQuote = W.getAcceptedQuote(workflowDetails);
  const sourceDependentField = SOURCE_FIELD_LABEL[formData.source] || "";
  const visibleStages = W.getVisibleStages(formData.paymentTerm);
  const nextStage = W.getNextStage(caseStage, formData.paymentTerm);

  // Quotes can't change once Payment has started; payment/policy fields lock once saved as Policy Issued
  // Employees can change the insurer list only until Admin starts working on quotes' results
  const quotesLocked = stageIdx > W.IDX.PolicyIssuance || (!isAdmin && stageIdx > W.IDX.QuoteWorkflow);
  const paymentLocked = savedIssued;

  const finalAmounts = W.computeAmount(workflowDetails.finalNetPremium, workflowDetails.finalGstPercent);
  const emiAmounts = W.computeAmount(workflowDetails.emiNetPremium, workflowDetails.finalGstPercent);

  const emiSchedule = useMemo(
    () =>
      W.computeEmiSchedule({
        paymentTerm: formData.paymentTerm,
        policyTenure: formData.policyTenure,
        policyStartDate: workflowDetails.policyStartDate,
        emiReceivedCount: workflowDetails.emiReceivedCount,
      }),
    [formData.paymentTerm, formData.policyTenure, workflowDetails.policyStartDate, workflowDetails.emiReceivedCount]
  );

  const cashbackCalc = useMemo(
    () => W.computeCashback({ cashback: cashbackDetails, paymentTerm: formData.paymentTerm, emiReceivedCount: workflowDetails.emiReceivedCount }),
    [cashbackDetails, formData.paymentTerm, workflowDetails.emiReceivedCount]
  );

  const profitCalc = useMemo(
    () =>
      W.computeProfit({
        payout: payoutDetails,
        workflow: workflowDetails,
        paymentTerm: formData.paymentTerm,
        isMotor: sections.motor,
        insuranceType: motorDetails.insuranceType,
        cashbackTotal: cashbackCalc.totalPayout,
      }),
    [payoutDetails, workflowDetails, formData.paymentTerm, sections.motor, motorDetails.insuranceType, cashbackCalc.totalPayout]
  );

  // ------------------------------------------------------------
  // EFFECTS
  // ------------------------------------------------------------
  // PIN -> State / City
  useEffect(() => {
    const pin = formData.pinCode;
    if (pin && W.validatePIN(pin)) {
      let cancelled = false;
      (async () => {
        setIsFetchingPin(true);
        setPinFetchError("");
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const data = await res.json();
          if (cancelled) return;
          const po = data?.[0]?.Status === "Success" ? data[0].PostOffice?.[0] : null;
          if (po) setFormData((prev) => ({ ...prev, state: po.State || "", city: po.District || po.Name || "" }));
          else setPinFetchError("Invalid PIN code");
        } catch {
          if (!cancelled) setPinFetchError("Could not fetch location");
        } finally {
          if (!cancelled) setIsFetchingPin(false);
        }
      })();
      return () => { cancelled = true; };
    }
    if (pin && pin.length < 6) setPinFetchError("Enter 6 digits");
    else setPinFetchError("");
    return undefined;
  }, [formData.pinCode]);

  // Motor: RTO code from registration number
  useEffect(() => {
    if (motorDetails.previousInsuranceStatus === "New") return;
    const m = String(motorDetails.registrationNumber || "").toUpperCase().match(/^([A-Z]{2}[0-9]+)/);
    const code = m && motorDetails.registrationNumber.length >= 4 ? m[1] : "";
    if (code !== (motorDetails.autoRtoCode || "")) setMotorDetails((prev) => ({ ...prev, autoRtoCode: code }));
  }, [motorDetails.registrationNumber, motorDetails.previousInsuranceStatus]);

  // Policy Expiry = Start + Tenure - 1 day
  useEffect(() => {
    if (!workflowDetails.policyStartDate) return;
    const start = new Date(workflowDetails.policyStartDate);
    if (isNaN(start.getTime())) return;
    const expiry = new Date(start);
    expiry.setFullYear(expiry.getFullYear() + W.getTenureYears(formData.policyTenure));
    expiry.setDate(expiry.getDate() - 1);
    const iso = expiry.toISOString().split("T")[0];
    setWorkflowDetails((prev) => (prev.policyExpiryDate === iso ? prev : { ...prev, policyExpiryDate: iso }));
  }, [workflowDetails.policyStartDate, formData.policyTenure]);

  // Health: build member rows at Policy Issuance from the Quote answers (keeps typed data)
  useEffect(() => {
    if (!sections.health || stageIdx < W.IDX.PolicyIssuance) return;
    setHealthDetails((prev) => {
      const slots = W.getMemberSlots(prev);
      const cur = prev.members || [];
      const same = slots.length === cur.length && slots.every((s, i) => cur[i]?.id === s.id);
      if (same) return prev;
      const byId = Object.fromEntries(cur.map((m) => [m.id, m]));
      const members = slots.map((s) => {
        if (byId[s.id]) return { ...byId[s.id], type: s.type };
        if (s.type === "proposer") {
          return W.buildMember(s.id, s.type, {
            name: prev.proposerName || formData.name || "",
            dob: prev.proposerDOB || "",
            relationship: "Self",
            height: prev.height || "",
            weight: prev.weight || "",
            qualification: prev.qualification || "",
            occupation: prev.occupation || "",
            aadhaarNumber: prev.aadhaarNumber || "",
            aadhaarFile: prev.aadhaarFile || null,
            panNumber: prev.panNumber || "",
            panFile: prev.panFile || null,
          });
        }
        return W.buildMember(s.id, s.type);
      });
      return { ...prev, members };
    });
  }, [sections.health, stageIdx, healthDetails.policyType, healthDetails.numberOfAdults, healthDetails.numberOfChildren, healthDetails.proposerIsMember]);

  // Health: proposer member name follows Proposer Name
  useEffect(() => {
    const idx = (healthDetails.members || []).findIndex((m) => m.type === "proposer");
    if (idx === -1) return;
    const name = healthDetails.proposerName || formData.name || "";
    if (healthDetails.members[idx].name === name) return;
    setHealthDetails((prev) => {
      const members = [...prev.members];
      members[idx] = { ...members[idx], name };
      return { ...prev, members };
    });
  }, [healthDetails.proposerName, healthDetails.members, formData.name]);

  // Health portability: one row per year of experience, filled at Policy Issuance (BRD)
  useEffect(() => {
    if (!sections.health || stageIdx < W.IDX.PolicyIssuance) return;
    if (healthDetails.hasPreviousPolicy !== "Yes" || healthDetails.previousPolicyCase !== "Portability Case") return;
    const n = parseInt(healthDetails.experienceYears, 10) || 0;
    setHealthDetails((prev) => {
      const cur = prev.portabilityDetails || [];
      if (cur.length === n) return prev;
      const rows = Array.from({ length: n }, (_, i) =>
        cur[i] || { id: i + 1, insurerName: "", policyNumber: "", policyActiveFrom: "", policyTillDate: "", sumAssured: "", noClaimBonus: "", ipdClaimTaken: "", uploadPYP: null }
      );
      return { ...prev, portabilityDetails: rows };
    });
  }, [sections.health, stageIdx, healthDetails.hasPreviousPolicy, healthDetails.previousPolicyCase, healthDetails.experienceYears]);

  // Payment: auto-fetch the accepted quote premium the first time
  useEffect(() => {
    if (stageIdx < W.IDX.Payment || !acceptedQuote) return;
    setWorkflowDetails((prev) =>
      W.isBlank(prev.finalNetPremium) && !W.isBlank(acceptedQuote.netPremium)
        ? { ...prev, finalNetPremium: acceptedQuote.netPremium, finalGstPercent: W.isBlank(acceptedQuote.gstPercent) ? prev.finalGstPercent : acceptedQuote.gstPercent }
        : prev
    );
  }, [stageIdx, acceptedQuote?.insurerName, acceptedQuote?.netPremium]);

  // Profit: PayOut Slab defaults to the accepted quote's Pay Out %
  useEffect(() => {
    if (stageIdx < W.IDX.Profit || !acceptedQuote || W.isBlank(acceptedQuote.payoutPercent)) return;
    setPayoutDetails((prev) => (W.isBlank(prev.payoutSlabPercent) ? { ...prev, payoutSlabPercent: acceptedQuote.payoutPercent } : prev));
  }, [stageIdx, acceptedQuote?.insurerName, acceptedQuote?.payoutPercent]);

  // ------------------------------------------------------------
  // QUOTE HELPERS
  // ------------------------------------------------------------
  const toggleInsurer = (name, checked) => {
    setWorkflowDetails((prev) => {
      const selected = prev.selectedInsurers || [];
      const quotes = prev.insurerQuotes || [];
      if (checked) {
        if (selected.includes(name)) return prev;
        return {
          ...prev,
          selectedInsurers: [...selected, name],
          insurerQuotes: quotes.some((q) => q.insurerName === name) ? quotes : [...quotes, W.newQuote(name)],
        };
      }
      return {
        ...prev,
        selectedInsurers: selected.filter((n) => n !== name),
        insurerQuotes: quotes.filter((q) => q.insurerName !== name),
        acceptedInsurer: prev.acceptedInsurer === name ? "" : prev.acceptedInsurer,
      };
    });
    if (!checked) setQuoteFiles((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const updateQuote = (insurerName, field, value) => {
    setWorkflowDetails((prev) => {
      let quotes = [...(prev.insurerQuotes || [])];
      let i = quotes.findIndex((q) => q.insurerName === insurerName);
      if (i === -1) { quotes.push(W.newQuote(insurerName)); i = quotes.length - 1; }
      quotes[i] = { ...quotes[i], [field]: value };
      let acceptedInsurer = prev.acceptedInsurer;
      if (field === "quoteStatus") {
        if (value === "Accepted") {
          // only one quote can be accepted
          quotes = quotes.map((q, k) => (k !== i && q.quoteStatus === "Accepted" ? { ...q, quoteStatus: "Rejected" } : q));
          acceptedInsurer = insurerName;
        } else if (acceptedInsurer === insurerName) acceptedInsurer = "";
      }
      return { ...prev, insurerQuotes: quotes, acceptedInsurer };
    });
  };

  const updateMember = (index, field, value) => {
    setHealthDetails((prev) => {
      const members = [...(prev.members || [])];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
  };
  const updateMemberRider = (index, field, value) => {
    setHealthDetails((prev) => {
      const members = [...(prev.members || [])];
      members[index] = { ...members[index], riderDetails: { ...(members[index].riderDetails || {}), [field]: value } };
      return { ...prev, members };
    });
  };
  const updatePortability = (index, field, value) => {
    setHealthDetails((prev) => {
      const rows = [...(prev.portabilityDetails || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, portabilityDetails: rows };
    });
  };

  // ------------------------------------------------------------
  // RESET / HYDRATE
  // ------------------------------------------------------------
  const resetErrors = () => {
    setValidationErrors({});
    setValidationPopup({ show: false, errors: [] });
  };

  const reset = () => {
    setFormData(W.emptyFormData());
    setHealthDetails(W.emptyHealthDetails());
    setMotorDetails(emptyMotorDetails());
    setElectronicDetails(W.emptyElectronicDetails());
    setPaDetails(emptyPA());
    setTravelDetails(emptyTravel());
    setWorkflowDetails(W.emptyWorkflow());
    setCashbackDetails(W.emptyCashback());
    setPayoutDetails(W.emptyPayout());
    setCaseStage("Lead");
    setSavedLead(null);
    setSavedIssued(false);
    setQuoteFiles({});
    setShowAddOnModal(false);
    setPinFetchError("");
    setIsFetchingPin(false);
    resetErrors();
  };

  const hydrate = (lead) => {
    if (!lead) return;
    setSavedLead(lead);
    setFormData({
      name: str(lead.name), email: str(lead.email), mobileNo: str(lead.mobileNo), gender: str(lead.gender),
      source: str(lead.source), remarks: str(lead.remarks), lob: str(lead.lob), pinCode: str(lead.pinCode),
      state: str(lead.state), city: str(lead.city), sourceDependentValue: str(lead.sourceDependentValue),
      policyTenure: str(lead.policyTenure), paymentTerm: str(lead.paymentTerm), sumInsured: str(lead.sumInsured),
    });

    // ---- Health ----
    const hd = lead.healthDetails;
    if (hd) {
      setHealthDetails({
        ...W.emptyHealthDetails(),
        ...hd,
        proposerName: hd.proposerName || lead.name || "",
        numberOfAdults: hd.numberOfAdults || 1,
        numberOfChildren: hd.numberOfChildren || 0,
        experienceYears: str(hd.experienceYears || ""),
        nomineeDOB: W.formatDateForInput(hd.nomineeDOB),
        proposerDOB: W.formatDateForInput(hd.proposerDOB),
        seniorOneDOB: W.formatDateForInput(hd.seniorOneDOB),
        renewalDetails: {
          insurerName: "", policyNumber: "", uploadPolicy: null,
          ...(hd.renewalDetails || {}),
          policyDueDate: W.formatDateForInput(hd.renewalDetails?.policyDueDate),
        },
        portabilityDetails: (hd.portabilityDetails || []).map((p) => ({
          ...p,
          policyActiveFrom: W.formatDateForInput(p.policyActiveFrom),
          policyTillDate: W.formatDateForInput(p.policyTillDate),
          uploadPYP: p.uploadPYP || null,
        })),
        members: (hd.members || []).map((m) => ({
          ...W.buildMember(m.id, m.type),
          ...m,
          riderDetails: { ...W.buildMember("x", "adult").riderDetails, ...(m.riderDetails || {}) },
          dob: W.formatDateForInput(m.dob),
          aadhaarFile: m.aadhaarFile || (m.type === "proposer" ? hd.aadhaarFile : null) || null,
          aadhaarNumber: m.aadhaarNumber || (m.type === "proposer" ? hd.aadhaarNumber : "") || "",
          panNumber: m.panNumber || (m.type === "proposer" ? hd.panNumber : "") || "",
          panFile: m.panFile || (m.type === "proposer" ? hd.panFile : null) || null,
        })),
      });
    } else {
      setHealthDetails({ ...W.emptyHealthDetails(), proposerName: lead.name || "" });
    }

    // ---- Motor ----
    const md = lead.motorDetails;
    setMotorDetails(
      md
        ? {
            ...emptyMotorDetails(),
            ...md,
            otherManufacturer: md.otherManufacturer || "",
            selectedAddOns: md.selectedAddOns || [],
            odDueDate: W.formatDateForInput(md.odDueDate),
            tpDueDate: W.formatDateForInput(md.tpDueDate),
            saodOdDueDate: W.formatDateForInput(md.saodOdDueDate),
            saodTpDueDate: W.formatDateForInput(md.saodTpDueDate),
            tpInsuranceDueDate: W.formatDateForInput(md.tpInsuranceDueDate),
          }
        : emptyMotorDetails()
    );

    // ---- Electronic ----
    const ed = lead.electronicDetails;
    setElectronicDetails(
      ed
        ? { ...W.emptyElectronicDetails(), ...ed, dateOfPurchase: W.formatDateForInput(ed.dateOfPurchase), devicePhotos: ed.devicePhotos || [] }
        : W.emptyElectronicDetails()
    );

    setPaDetails(hydratePA(lead.paDetails));
    setTravelDetails(hydrateTravel(lead.travelDetails));

    // ---- Workflow (quotes normalized + legacy fields mapped) ----
    const wf = lead.workflowDetails || {};
    const norm = W.normalizeQuotes({
      selectedInsurers: wf.selectedInsurers || lead.selectedInsurers || [],
      insurerQuotes: wf.insurerQuotes || lead.insurerQuotes || [],
      acceptedInsurer: wf.acceptedInsurer || lead.payoutDetails?.acceptedInsurer || lead.previousInsurerName || "",
    });
    const accepted = norm.insurerQuotes.find((q) => q.quoteStatus === "Accepted") || null;
    const legacyPay = LEGACY_PAYMENT_STATUS[wf.paymentStatus] || {};
    const legacyIssued = lead.status === "Policy Issued" || wf.status === "Policy Issued";
    const issuanceStatus = wf.issuanceStatus || (legacyIssued ? "Policy Issued" : "");
    setWorkflowDetails({
      ...W.emptyWorkflow(),
      selectedInsurers: norm.selectedInsurers,
      insurerQuotes: norm.insurerQuotes,
      acceptedInsurer: norm.acceptedInsurer,
      quoteRemarks: str(wf.quoteRemarks),
      finalNetPremium: str(wf.finalNetPremium ?? accepted?.netPremium ?? ""),
      finalGstPercent: str(wf.finalGstPercent ?? accepted?.gstPercent ?? W.DEFAULT_QUOTE_GST_PERCENT),
      emiNetPremium: str(wf.emiNetPremium ?? accepted?.emiNetPremium ?? ""),
      paymentUrl: str(wf.paymentUrl),
      paymentStatus: legacyPay.paymentStatus || str(wf.paymentStatus),
      eMandateStatus: str(wf.eMandateStatus || legacyPay.eMandateStatus || ""),
      utrNumber: str(wf.utrNumber),
      paymentSnapshot: wf.paymentSnapshot || null,
      issuanceStatus,
      notIssuedRemarks: str(wf.notIssuedRemarks),
      policyNumber: str(wf.policyNumber || lead.policyNumber),
      policyIssuedOn: W.formatDateForInput(wf.policyIssuedOn || lead.policyIssuedOn),
      policyStartDate: W.formatDateForInput(wf.policyStartDate || lead.policyStartDate),
      policyExpiryDate: W.formatDateForInput(wf.policyExpiryDate || lead.policyExpiryDate),
      policyCopy: wf.policyCopy || null,
      emiReceivedCount: str(wf.emiReceivedCount ?? accepted?.emiReceivedCount ?? ""),
      lastEmiPaidOn: W.formatDateForInput(wf.lastEmiPaidOn),
      workflowRemarks: str(wf.workflowRemarks),
    });
    setSavedIssued(issuanceStatus === "Policy Issued");

    // ---- Cashback ----
    const cb = lead.cashbackDetails || {};
    setCashbackDetails({
      ...W.emptyCashback(),
      payoutTo: cb.payoutTo || "Customer",
      amountPerPayment: str(cb.amountPerPayment),
      status: cb.status || "Pending",
      settledAmount: str(cb.settledAmount),
    });

    // ---- Arshyan Profit (legacy payout fields mapped) ----
    const pd = lead.payoutDetails || {};
    setPayoutDetails({
      ...W.emptyPayout(),
      payoutSlabPercent: str(pd.payoutSlabPercent ?? accepted?.payoutPercent ?? ""),
      gstPayoutPercent: str(pd.gstPayoutPercent ?? pd.gstReturnSlabPercent ?? W.DEFAULT_GST_PAYOUT_PERCENT),
      tdsPercent: str(pd.tdsPercent ?? W.DEFAULT_TDS_PERCENT),
      odPremium: str(pd.odPremium ?? accepted?.odPremium ?? ""),
      tpPremium: str(pd.tpPremium ?? accepted?.tpPremium ?? ""),
      odPayoutPercent: str(pd.odPayoutPercent ?? accepted?.odPayoutSlab ?? ""),
      tpPayoutPercent: str(pd.tpPayoutPercent ?? accepted?.tpPayoutSlab ?? ""),
    });

    setCaseStage(W.inferStage(lead));
    setQuoteFiles({});
    setShowAddOnModal(false);
    resetErrors();
  };

  // Used by the create form to open the next module without saving
  const goToStage = (stage) => {
    if (stage === "Quote") setHealthDetails((prev) => (prev.proposerName ? prev : { ...prev, proposerName: formData.name }));
    setCaseStage(stage);
  };

  // ------------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------------
  const buildCtx = (advancing) => ({
    formData, healthDetails, motorDetails, electronicDetails, workflowDetails, cashbackDetails, payoutDetails,
    sections, paDetails, travelDetails, validatePA, validateTravel, advancing, stageIdx,
  });

  const showErrors = (list) => {
    const map = {};
    list.forEach(({ field, message }) => { if (!map[field]) map[field] = message; });
    setValidationErrors(map);
    setValidationPopup({ show: list.length > 0, errors: list });
  };

  /** Strict check of the current module - run before moving to the next one */
  const validateForAdvance = () => {
    const ctx = buildCtx(true);
    const list = [...W.validateStage("Lead", ctx), ...(caseStage !== "Lead" ? W.validateStage(caseStage, ctx) : [])];
    showErrors(list);
    return list.length === 0;
  };

  /** Light check for "Save" - formats only, so a module can be saved half-filled */
  const validateForSave = () => {
    const list = W.validateFormats(buildCtx(false));
    showErrors(list);
    return list.length === 0;
  };

  const scrollToError = (fieldName) => {
    setValidationPopup({ show: false, errors: [] });
    const el =
      document.querySelector(`[name="${fieldName}"]`) ||
      document.querySelector(`[data-field="${fieldName}"]`) ||
      document.getElementById(fieldName);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el.focus) el.focus();
      el.style.borderColor = "#ef4444";
      el.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.3)";
      setTimeout(() => { el.style.borderColor = ""; el.style.boxShadow = ""; }, 3000);
    }
  };

  // ------------------------------------------------------------
  // PAYLOAD
  // ------------------------------------------------------------
  const buildWorkflowPayload = (stage) => {
    const norm = W.normalizeQuotes(workflowDetails);
    const quotes = norm.insurerQuotes.map((q) => {
      const calc = W.computeQuote(q);
      const out = { ...q, gstValue: calc.gstValue, grossPremium: calc.grossPremium };
      if (out.quoteUpload instanceof File) delete out.quoteUpload;
      ["netPremium", "gstPercent", "payoutPercent"].forEach((k) => { if (W.isBlank(out[k])) delete out[k]; });
      return out;
    });
    const wf = {
      ...workflowDetails,
      selectedInsurers: norm.selectedInsurers,
      insurerQuotes: quotes,
      acceptedInsurer: norm.acceptedInsurer,
      finalGstValue: finalAmounts.gstValue,
      finalGrossPremium: finalAmounts.gross,
      emiGstValue: instalment ? emiAmounts.gstValue : 0,
      emiGrossPremium: instalment ? emiAmounts.gross : 0,
      emiTotalCount: emiSchedule.total,
      emiReceivedTill: emiSchedule.receivedTill,
      nextDueDate: emiSchedule.nextDue,
      emiRenewalAlert: emiSchedule.renewalAlert,
    };
    if (!instalment) { wf.emiNetPremium = ""; wf.emiReceivedCount = ""; wf.eMandateStatus = ""; }
    if (wf.paymentSnapshot instanceof File) delete wf.paymentSnapshot;
    if (wf.policyCopy instanceof File) delete wf.policyCopy;
    wf.status = W.deriveCaseStatus(stage, wf);
    // never send "" for enum / number / date fields
    Object.keys(wf).forEach((k) => { if (wf[k] === "" || wf[k] === null || wf[k] === undefined) delete wf[k]; });
    return wf;
  };

  /**
   * Builds the multipart body for create/update.
   * @param stage caseStage to persist (current, or the next one when advancing)
   */
  const buildFormData = (stage) => {
    const fd = new FormData();
    const wf = buildWorkflowPayload(stage);

    Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ""));
    fd.append("caseStage", stage);
    fd.append("status", wf.status);

    const lobVisible = W.stageIndex(stage) >= W.IDX.Quote;

    // ---- Health ----
    if (lobVisible && sections.health) {
      const h = { ...healthDetails, proposerName: healthDetails.proposerName || formData.name };
      const proposer = (h.members || []).find((m) => m.type === "proposer");
      if (proposer) {
        h.aadhaarNumber = proposer.aadhaarNumber || "";
        h.panNumber = proposer.panNumber || "";
        if (typeof proposer.aadhaarFile === "string") h.aadhaarFile = proposer.aadhaarFile;
        if (typeof proposer.panFile === "string") h.panFile = proposer.panFile;
      }
      if (h.aadhaarFile instanceof File) delete h.aadhaarFile;
      if (h.panFile instanceof File) delete h.panFile;
      h.renewalDetails = { ...(h.renewalDetails || {}) };
      if (h.renewalDetails.uploadPolicy instanceof File) delete h.renewalDetails.uploadPolicy;
      h.portabilityDetails = (h.portabilityDetails || []).map((p) => {
        const c = { ...p };
        if (c.uploadPYP instanceof File) delete c.uploadPYP;
        return c;
      });
      h.members = (h.members || []).map((m) => {
        const c = { ...m };
        ["aadhaarFile", "panFile", "epicFile", "birthCertificate"].forEach((f) => { if (c[f] instanceof File) delete c[f]; });
        return c;
      });
      fd.append("healthDetails", JSON.stringify(h));

      if (healthDetails.renewalDetails?.uploadPolicy instanceof File) fd.append("renewalPolicyFile", healthDetails.renewalDetails.uploadPolicy);
      (healthDetails.portabilityDetails || []).forEach((p, i) => { if (p.uploadPYP instanceof File) fd.append(`portabilityPYP_${i}`, p.uploadPYP); });
      (healthDetails.members || []).forEach((m, i) => {
        if (m.aadhaarFile instanceof File) fd.append(`memberAadhaar_${i}`, m.aadhaarFile);
        if (m.panFile instanceof File) fd.append(`memberPan_${i}`, m.panFile);
        if (m.epicFile instanceof File) fd.append(`memberEpic_${i}`, m.epicFile);
        if (m.birthCertificate instanceof File) fd.append(`memberBirthCert_${i}`, m.birthCertificate);
      });
    }

    // ---- Motor ----
    if (lobVisible && sections.motor) {
      const m = { ...motorDetails };
      ["pypFile", "rcFrontFile", "rcBackFile", "chesisPhoto", "invoiceCopy"].forEach((f) => {
        if (m[f] instanceof File) {
          fd.append(f, m[f]);
          delete m[f];
        }
      });
      if (m.manufacturer !== OTHER_MANUFACTURER) m.otherManufacturer = "";
      if (m.vehicleType || m.registrationNumber) fd.append("motorDetails", JSON.stringify(m));
    }

    // ---- Electronic ----
    if (lobVisible && sections.electronic) {
      const e = { ...electronicDetails };
      [["aadhaarFile", "electronicAadhaarFile"], ["panFile", "electronicPanFile"], ["imeiImage", "imeiImage"], ["purchaseInvoice", "purchaseInvoice"]].forEach(([f, key]) => {
        if (e[f] instanceof File) {
          fd.append(key, e[f]);
          delete e[f];
        }
      });
      (electronicDetails.devicePhotos || []).forEach((p, i) => { if (p instanceof File) fd.append(`devicePhoto_${i}`, p); });
      e.devicePhotos = (e.devicePhotos || []).filter((p) => typeof p === "string");
      if (e.deviceType || e.dateOfPurchase) fd.append("electronicDetails", JSON.stringify(e));
    }

    // ---- PA / Travel ----
    if (lobVisible && sections.pa) appendPA(fd, paDetails);
    if (lobVisible && sections.travel) appendTravel(fd, travelDetails);

    // ---- Workflow ----
    fd.append("workflowDetails", JSON.stringify(wf));
    if (workflowDetails.paymentSnapshot instanceof File) fd.append("paymentSnapshot", workflowDetails.paymentSnapshot);
    if (workflowDetails.policyCopy instanceof File) fd.append("policyCopy", workflowDetails.policyCopy);
    (wf.insurerQuotes || []).forEach((q, idx) => {
      const file = quoteFiles[q.insurerName];
      if (file instanceof File) fd.append(`${quoteFilePrefix}${idx}`, file);
    });

    // ---- Cashback + Arshyan Profit (only once those modules are reached) ----
    if (W.stageIndex(stage) >= W.IDX.Cashback) {
      fd.append("cashbackDetails", JSON.stringify({ ...cashbackDetails, ...cashbackCalc }));
      fd.append("payoutDetails", JSON.stringify({
        ...payoutDetails,
        ...profitCalc,
        acceptedInsurer: acceptedQuote?.insurerName || "",
        acceptedNetPremium: W.num(workflowDetails.finalNetPremium),
      }));
    }

    // ---- Root-level copies (renewal alerts, lists, exports) ----
    fd.append("policyNumber", workflowDetails.policyNumber || "");
    fd.append("policyStartDate", workflowDetails.policyStartDate || "");
    fd.append("policyExpiryDate", workflowDetails.policyExpiryDate || "");
    if (acceptedQuote?.insurerName) fd.append("insurer", acceptedQuote.insurerName);

    return fd;
  };

  return {
    // state
    formData, setFormData, healthDetails, setHealthDetails, motorDetails, setMotorDetails,
    electronicDetails, setElectronicDetails, paDetails, setPaDetails, travelDetails, setTravelDetails,
    workflowDetails, setWorkflowDetails, cashbackDetails, setCashbackDetails, payoutDetails, setPayoutDetails,
    caseStage, savedLead, quoteFiles, setQuoteFiles, validationErrors, validationPopup, setValidationPopup,
    showAddOnModal, setShowAddOnModal, isFetchingPin, pinFetchError,
    // derived
    sections, stageIdx, isAdmin, instalment, acceptedQuote, sourceDependentField, visibleStages, nextStage,
    quotesLocked, paymentLocked, finalAmounts, emiAmounts, emiSchedule, cashbackCalc, profitCalc,
    // actions
    toggleInsurer, updateQuote, updateMember, updateMemberRider, updatePortability,
    reset, hydrate, goToStage, validateForAdvance, validateForSave, showErrors, scrollToError, buildFormData,
  };
}