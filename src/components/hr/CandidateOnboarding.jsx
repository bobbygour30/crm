// src/components/hr/CandidateOnboarding.jsx — public documentation form (opened from the offer e-mail link)
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUpload, FaCheckCircle, FaPlus, FaTrash, FaFilePdf, FaExclamationTriangle, FaDownload } from "react-icons/fa";
import { hrApi, hrUpload } from "./hrApi";
import { compressImage } from "../lob/uploadUtils";
import { Field, Btn, Notice, inputCls, cx } from "./ui";

const API = import.meta.env.VITE_BACKEND_URL;
const get = (o, path) => path.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
const setIn = (o, path, v) => {
  const [k, ...rest] = path.split(".");
  const cur = Array.isArray(o) ? [...o] : { ...(o || {}) };
  cur[k] = rest.length ? setIn(cur[k] ?? (/^\d+$/.test(rest[0]) ? [] : {}), rest.join("."), v) : v;
  return cur;
};
const emptyEdu = () => ({ qualification: "", otherQualification: "", state: "", university: "", rollNo: "", passingYear: "", stream: "", subjects: "" });
const emptyExp = () => ({ organization: "", dateOfJoining: "", dateOfRelieving: "", lastInHand: "", lastCtc: "", relievingLetter: "", experienceLetter: "" });
const emptyRef = () => ({ name: "", designation: "", contact: "", email: "", organization: "" });
const SECTION_TITLES = { epfo: "EPFO", esic: "ESIC", bank: "Bank details", kyc: "KYC", education: "Education", experience: "Experience", references: "References", personal: "Personal details", nominee: "Nominee", contact: "Contact details", documents: "Documents" };

export default function CandidateOnboarding() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [doc, setDoc] = useState({});
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ loading: true, error: "", saving: "", savedAt: null, done: false });
  const [uploading, setUploading] = useState({});
  const docRef = useRef(doc);
  docRef.current = doc;

  const load = async () => {
    try {
      const d = await hrApi(`/public/onboarding/${token}`, { public: true });
      setData(d);
      setDoc({ education: [emptyEdu()], experience: { hasExperience: "" }, references: [], ...d.documentation });
      setState((s) => ({ ...s, loading: false }));
    } catch (e) { setState((s) => ({ ...s, loading: false, error: e.message })); }
  };
  useEffect(() => { load(); }, [token]);

  const open = (section) => data?.editable && (!data.openSections || data.openSections.includes(section));
  const set = (path, v) => setDoc((d) => setIn(d, path, v));
  const err = (path) => errors[path];

  const save = async (submit = false, override) => {
    setState((s) => ({ ...s, saving: submit ? "submit" : "draft" }));
    try {
      await hrApi(`/public/onboarding/${token}`, { method: "PUT", public: true, body: { documentation: override || docRef.current, submit } });
      setErrors({});
      if (submit) { setState((s) => ({ ...s, saving: "", done: true })); window.scrollTo && window.scrollTo(0, 0); load(); }
      else setState((s) => ({ ...s, saving: "", savedAt: new Date() }));
    } catch (e) {
      const map = {}; (e.errors || []).forEach((x) => { map[x.path] = x.message; });
      setErrors(map);
      setState((s) => ({ ...s, saving: "", error: submit ? "" : e.message }));
      if (submit) {
        const first = Object.keys(map)[0];
        const el = first && document.querySelector(`[data-path="${first}"]`);
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const upload = async (path, file) => {
    if (!file) return;
    if (!/\.(pdf|jpe?g)$/i.test(file.name)) { setErrors((m) => ({ ...m, [path]: "Only PDF, JPG or JPEG files" })); return; }
    setUploading((u) => ({ ...u, [path]: true }));
    try {
      const small = await compressImage(file);
      const r = await hrUpload(`/public/onboarding/${token}/file`, small, {}, { public: true });
      const next = setIn(docRef.current, path, r.url);
      setDoc(next);
      setErrors((m) => { const c = { ...m }; delete c[path]; return c; });
      save(false, next); // keep the upload even if the page is closed
    } catch (e) { setErrors((m) => ({ ...m, [path]: e.message })); } finally { setUploading((u) => ({ ...u, [path]: false })); }
  };

  if (state.loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (state.error && !data) return <div className="min-h-screen flex items-center justify-center p-6"><Notice kind="error">{state.error}</Notice></div>;
  const o = data.offer;

  // ---- small field builders ----
  const T = (path, label, { required = true, digits, max, upper, type = "text", section, hint, placeholder } = {}) => (
    <Field label={label} required={required} error={err(path)} hint={hint}>
      <input data-path={path} type={type} inputMode={digits ? "numeric" : undefined} maxLength={max} placeholder={placeholder} disabled={!open(section)}
        value={get(doc, path) ?? ""} onChange={(e) => { let v = e.target.value; if (digits) v = v.replace(/\D/g, ""); if (upper) v = v.toUpperCase(); set(path, v); }} className={inputCls(err(path), !open(section))} />
    </Field>
  );
  const S = (path, label, options, { section, required = true } = {}) => (
    <Field label={label} required={required} error={err(path)}>
      <select data-path={path} disabled={!open(section)} value={get(doc, path) ?? ""} onChange={(e) => set(path, e.target.value)} className={inputCls(err(path), !open(section))}>
        <option value="">Select</option>{options.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </Field>
  );
  const YN = (path, label, section, labels = ["Yes", "No"]) => (
    <Field label={label} required error={err(path)}>
      <div className="flex gap-4 mt-1" data-path={path} role="radiogroup" aria-label={label}>
        {["Yes", "No"].map((v, i) => <label key={v} className="flex items-center gap-1 text-sm"><input type="radio" disabled={!open(section)} checked={get(doc, path) === v} onChange={() => set(path, v)} /> {labels[i]}</label>)}
      </div>
    </Field>
  );
  const FileBox = (path, label, { section, required = true, template } = {}) => {
    const url = get(doc, path);
    return (
      <Field label={label} required={required} error={err(path)}>
        <div data-path={path} className={cx("border rounded-lg p-2 flex flex-wrap items-center gap-2 text-sm", err(path) ? "border-red-500" : "border-gray-300")}>
          {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 flex items-center gap-1"><FaCheckCircle /> Uploaded — view</a> : <span className="text-gray-400">Not uploaded</span>}
          {open(section) && (
            <label className="ml-auto cursor-pointer px-2 py-1 rounded bg-indigo-50 text-indigo-700 flex items-center gap-1 text-xs">
              <FaUpload /> {uploading[path] ? "Uploading…" : url ? "Replace" : "Upload"}
              <input type="file" accept=".pdf,.jpg,.jpeg" className="hidden" aria-label={`Upload ${label}`} disabled={!!uploading[path]} onChange={(e) => { upload(path, e.target.files[0]); e.target.value = ""; }} />
            </label>
          )}
        </div>
        {template && (template.template || template.sample) && (
          <div className="flex gap-3 text-xs mt-1">
            {template.template && <a href={template.template} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-1"><FaDownload /> Template</a>}
            {template.sample && <a href={template.sample} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-1"><FaDownload /> Filled sample</a>}
          </div>
        )}
      </Field>
    );
  };
  // a plain function (not a component) so inputs keep focus while typing
  const renderSection = (id, children) => {
    const rejected = (data.rejected || []).filter((r) => r.section === id);
    return (
      <section data-section={id} className={cx("bg-white rounded-2xl border p-4", rejected.length ? "border-red-300" : "border-gray-200", !open(id) && data.editable && "opacity-70")}>
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">{SECTION_TITLES[id]}{!open(id) && data.editable && <span className="text-xs font-normal text-emerald-700 flex items-center gap-1"><FaCheckCircle /> Approved</span>}</h2>
        {rejected.map((r) => <p key={r.key} className="text-sm text-red-700 bg-red-50 rounded p-2 mb-3 flex gap-2"><FaExclamationTriangle className="mt-0.5" /> {r.label}: {r.remarks}</p>)}
        {children}
      </section>
    );
  };
  const g = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  const opt = data.options;
  const experienced = get(doc, "experience.hasExperience") === "Yes";
  const tpl = data.templates || {};
  const uploadedElsewhere = [
    ["UAN Card", "epfo.uanCard"], ["ESIC e-Pehchan", "esic.card"], ["Bank Passbook / Cheque", "bank.passbook"], ["Aadhaar front", "kyc.aadhaarFront"], ["Aadhaar back", "kyc.aadhaarBack"],
    ["PAN Card", "kyc.panCard"], ["Passport front", "kyc.passportFront"], ["Passport back", "kyc.passportBack"], ["Voter ID front", "kyc.voterFront"], ["Voter ID back", "kyc.voterBack"],
    ["DL front", "kyc.dlFront"], ["DL back", "kyc.dlBack"], ["Nominee Aadhaar", "nominee.aadhaarFile"],
    ...(get(doc, "experience.items") || []).flatMap((x, i) => [[`Relieving Letter ${i + 1}`, `experience.items.${i}.relievingLetter`], [`Experience Letter ${i + 1}`, `experience.items.${i}.experienceLetter`]]),
  ].filter(([, p]) => get(doc, p));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b"><div className="max-w-5xl mx-auto px-4 py-4"><h1 className="text-xl font-bold text-gray-800">Joining Documentation</h1><p className="text-sm text-gray-500">Arshyan Insurance Marketing & Services Pvt Ltd · {o.refId}</p></div></header>
      <main className="max-w-5xl mx-auto p-4 space-y-4" data-status={data.status}>
        <div className="bg-white rounded-2xl border p-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><div className="text-xs text-gray-500">Name</div><b>{o.name}</b></div><div><div className="text-xs text-gray-500">Position</div>{o.designation}</div>
          <div><div className="text-xs text-gray-500">Department</div>{o.department}</div><div><div className="text-xs text-gray-500">Joining</div>{o.dateOfJoining ? new Date(o.dateOfJoining).toLocaleDateString("en-IN") : "—"}</div>
        </div>
        {state.done && <Notice kind="ok">Thank you — your documents have been submitted. HR will review them and contact you if anything needs to change.</Notice>}
        {data.status === "Completed" && <Notice kind="ok">Your documentation is complete. Welcome aboard!</Notice>}
        {!data.editable && data.status !== "Completed" && !state.done && <Notice kind="info">Your documents are with HR for review. You'll be informed by e-mail if anything needs to change.</Notice>}
        {data.editable && data.openSections && <Notice kind="warn">Some items need correction (marked in red below). Only those sections are open — everything else is already approved.</Notice>}
        {data.editable && !data.openSections && <Notice kind="info">Fill in every section and upload the documents (PDF, JPG or JPEG). Your progress is saved — you can come back to this link any time.</Notice>}

        {renderSection("epfo", <><div className={g}>
          {YN("epfo.hasUAN", "Do you have an existing EPFO UAN?", "epfo")}
          {get(doc, "epfo.hasUAN") === "Yes" && <>{T("epfo.uan", "UAN No.", { digits: true, max: 12, section: "epfo", hint: "12 digits" })}{FileBox("epfo.uanCard", "Upload UAN Card", { section: "epfo" })}</>}
        </div></>)}
        {renderSection("esic", <><div className={g}>
          {YN("esic.hasESIC", "Do you have an existing ESIC IP number?", "esic")}
          {get(doc, "esic.hasESIC") === "Yes" && <>{T("esic.number", "ESIC No.", { digits: true, max: 17, section: "esic", hint: "10 digits" })}{FileBox("esic.card", "Upload ESIC e-Pehchan Card", { section: "esic" })}</>}
        </div></>)}
        {renderSection("bank", <><div className={g}>
          {T("bank.bankName", "Bank Name", { section: "bank" })}{T("bank.ifsc", "IFSC Code", { max: 11, upper: true, section: "bank", placeholder: "SBIN0001234" })}
          {T("bank.accountNo", "Account No.", { digits: true, max: 18, section: "bank" })}{T("bank.branch", "Branch Name", { section: "bank" })}
          {FileBox("bank.passbook", "Upload Bank Passbook / Cancelled Cheque", { section: "bank" })}
        </div></>)}
        {renderSection("kyc", <><div className={g}>
          {T("kyc.aadhaar", "Aadhaar No.", { digits: true, max: 12, section: "kyc" })}{FileBox("kyc.aadhaarFront", "Upload Aadhaar Front", { section: "kyc" })}{FileBox("kyc.aadhaarBack", "Upload Aadhaar Back", { section: "kyc" })}
          {T("kyc.pan", "PAN Number", { max: 10, upper: true, section: "kyc", placeholder: "ABCDE1234F" })}{FileBox("kyc.panCard", "Upload PAN Card", { section: "kyc" })}<div />
          {[["hasPassport", "passport", "Passport"], ["hasVoter", "voter", "Voter ID Card"], ["hasDL", "dl", "Driving Licence"]].map(([flag, p, label]) => (
            <div key={flag} className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {YN(`kyc.${flag}`, `Do you have a ${label}?`, "kyc")}
              {get(doc, `kyc.${flag}`) === "Yes" && <>{FileBox(`kyc.${p}Front`, `Upload ${label} Front`, { section: "kyc" })}{FileBox(`kyc.${p}Back`, `Upload ${label} Back`, { section: "kyc" })}</>}
            </div>
          ))}
        </div></>)}
        {renderSection("education", <>
          {(doc.education || []).map((q, i) => (
            <div key={i} className="border rounded-lg p-3 mb-3" data-edu={i}>
              <div className="flex justify-between mb-2"><b className="text-sm">Qualification {i + 1}</b>{open("education") && (doc.education || []).length > 1 && <button type="button" aria-label={`Remove qualification ${i + 1}`} onClick={() => set("education", doc.education.filter((_, k) => k !== i))} className="text-red-500"><FaTrash /></button>}</div>
              <div className={g}>
                {S(`education.${i}.qualification`, "Qualification", opt.qualifications, { section: "education" })}
                {q.qualification === "Other" && T(`education.${i}.otherQualification`, "Name of the qualification", { section: "education" })}
                {S(`education.${i}.state`, "State qualified from", opt.states, { section: "education" })}
                {T(`education.${i}.university`, "University / Board", { section: "education" })}{T(`education.${i}.rollNo`, "Roll No.", { section: "education" })}
                {T(`education.${i}.passingYear`, "Passing Year", { digits: true, max: 4, section: "education" })}{T(`education.${i}.stream`, "Stream", { section: "education" })}{T(`education.${i}.subjects`, "Subjects in the course", { section: "education" })}
              </div>
            </div>
          ))}
          {open("education") && <Btn kind="outline" onClick={() => set("education", [...(doc.education || []), emptyEdu()])}><FaPlus /> Add qualification</Btn>}
          {err("education") && <p className="text-red-500 text-xs mt-1">{err("education")}</p>}
        </>)}
        {renderSection("experience", <>
          {YN("experience.hasExperience", "Do you have any experience?", "experience", ["Yes", "No — I am a fresher"])}
          {experienced && (
            <div className="mt-3">
              {(get(doc, "experience.items") || []).map((x, i) => (
                <div key={i} className="border rounded-lg p-3 mb-3" data-exp={i}>
                  <div className="flex justify-between mb-2"><b className="text-sm">Experience {i + 1}</b>{open("experience") && <button type="button" aria-label={`Remove experience ${i + 1}`} onClick={() => set("experience.items", doc.experience.items.filter((_, k) => k !== i))} className="text-red-500"><FaTrash /></button>}</div>
                  <div className={g}>
                    {T(`experience.items.${i}.organization`, "Name of the Organisation", { section: "experience" })}
                    {T(`experience.items.${i}.dateOfJoining`, "Date of Joining", { type: "date", section: "experience" })}{T(`experience.items.${i}.dateOfRelieving`, "Date of Relieving", { type: "date", section: "experience" })}
                    {T(`experience.items.${i}.lastInHand`, "Last In-hand Salary (₹)", { digits: true, section: "experience" })}{T(`experience.items.${i}.lastCtc`, "Last CTC (₹)", { digits: true, section: "experience" })}<div />
                    {FileBox(`experience.items.${i}.relievingLetter`, "Upload Relieving Letter", { section: "experience" })}{FileBox(`experience.items.${i}.experienceLetter`, "Upload Experience Letter", { section: "experience" })}
                  </div>
                </div>
              ))}
              {open("experience") && <Btn kind="outline" onClick={() => set("experience.items", [...(get(doc, "experience.items") || []), emptyExp()])}><FaPlus /> Add experience</Btn>}
              {err("experience.items") && <p className="text-red-500 text-xs mt-1">{err("experience.items")}</p>}
            </div>
          )}
        </>)}
        {experienced && renderSection("references", <>
            {(doc.references || []).map((r, i) => (
              <div key={i} className="border rounded-lg p-3 mb-3" data-ref={i}>
                <div className="flex justify-between mb-2"><b className="text-sm">Reference {i + 1}</b>{open("references") || open("experience") ? <button type="button" aria-label={`Remove reference ${i + 1}`} onClick={() => set("references", doc.references.filter((_, k) => k !== i))} className="text-red-500"><FaTrash /></button> : null}</div>
                <div className={g}>
                  {T(`references.${i}.name`, "Name", { section: "references" })}{T(`references.${i}.designation`, "Designation", { section: "references" })}{T(`references.${i}.contact`, "Contact No.", { digits: true, max: 10, section: "references" })}
                  {T(`references.${i}.email`, "E-mail ID", { type: "email", section: "references" })}{T(`references.${i}.organization`, "Name of the Organisation", { section: "references" })}
                </div>
              </div>
            ))}
            {open("references") && <Btn kind="outline" onClick={() => set("references", [...(doc.references || []), emptyRef()])}><FaPlus /> Add reference</Btn>}
            {err("references") && <p className="text-red-500 text-xs mt-1">{err("references")}</p>}
          </>)}
        {renderSection("personal", <><div className={g}>
          <Field label="Name"><input disabled value={o.name} className={inputCls(false, true)} /></Field>
          <Field label="C/o (Father / Husband)"><input disabled value={o.fatherName || ""} className={inputCls(false, true)} /></Field>
          {T("personal.motherName", "Mother's Name", { section: "personal" })}
          {T("personal.brothers", "No. of Brothers", { digits: true, max: 2, section: "personal" })}{T("personal.sisters", "No. of Sisters", { digits: true, max: 2, section: "personal" })}
          {S("personal.maritalStatus", "Marital Status", opt.marital, { section: "personal" })}{T("personal.hobbies", "Hobbies", { section: "personal" })}
        </div></>)}
        {renderSection("nominee", <><div className={g}>
          {T("nominee.name", "Nominee Name", { section: "nominee" })}{T("nominee.dob", "Nominee DOB", { type: "date", section: "nominee" })}
          {S("nominee.relation", "Relation with Employee", opt.nomineeRelations, { section: "nominee" })}{FileBox("nominee.aadhaarFile", "Upload Nominee Aadhaar", { section: "nominee" })}
        </div></>)}
        {renderSection("contact", <><div className={g}>
          {T("contact.primary", "Primary Contact No.", { digits: true, max: 10, section: "contact" })}{T("contact.alternate", "Alternate Contact No.", { digits: true, max: 10, section: "contact" })}
          {T("contact.email", "E-mail ID", { type: "email", section: "contact" })}
          {T("contact.social", "Social media profile URL (Facebook / Instagram / LinkedIn / Twitter / other)", { required: false, section: "contact" })}
        </div></>)}
        {renderSection("documents", <>
          <div className={g}>
            {FileBox("documents.cv", "Upload your CV", { section: "documents", template: tpl.cv })}
            <div>
              {FileBox("documents.signedOffer", "Upload the Offer Letter signed by you on each page", { section: "documents", template: tpl.signedOffer })}
              <a href={`${API}/api/hr/public/onboarding/${token}/offer-letter`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 mt-1"><FaFilePdf /> Download your offer letter to sign</a>
            </div>
            {data.forms.esicForm && FileBox("documents.esicForm", "ESIC Form", { section: "documents", template: tpl.esicForm })}
            {data.forms.epfoForm && FileBox("documents.epfoForm", "EPFO Form", { section: "documents", template: tpl.epfoForm })}
            {data.forms.gmcForm && FileBox("documents.gmcForm", "GMC Form", { section: "documents", template: tpl.gmcForm })}
            {data.forms.gpaForm && FileBox("documents.gpaForm", "GPA Form", { section: "documents", template: tpl.gpaForm })}
          </div>
          {uploadedElsewhere.length > 0 && (
            <div className="mt-4"><p className="text-sm font-medium text-gray-700 mb-1">Also uploaded in other sections</p>
              <div className="flex flex-wrap gap-2">{uploadedElsewhere.map(([l, p]) => <a key={p} href={get(doc, p)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1"><FaCheckCircle /> {l}</a>)}</div>
            </div>
          )}
        </>)}

        {data.editable && (
          <div className="sticky bottom-0 bg-white/95 border rounded-2xl p-3 flex flex-wrap items-center gap-3 shadow">
            <span className="text-xs text-gray-500 flex-1">{state.savedAt ? `Saved at ${state.savedAt.toLocaleTimeString("en-IN")}` : "Your uploads are saved automatically."}{Object.keys(errors).length ? <span className="text-red-600"> · {Object.keys(errors).length} field(s) need attention</span> : null}</span>
            <Btn kind="secondary" onClick={() => save(false)} disabled={!!state.saving}>{state.saving === "draft" ? "Saving…" : "Save draft"}</Btn>
            <Btn onClick={() => save(true)} disabled={!!state.saving}>{state.saving === "submit" ? "Submitting…" : data.openSections ? "Re-submit corrections" : "Submit"}</Btn>
          </div>
        )}
      </main>
    </div>
  );
}
