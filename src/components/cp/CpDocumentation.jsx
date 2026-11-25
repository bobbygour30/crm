// src/components/cp/CpDocumentation.jsx — the Channel Partner's documentation form (link, no login)
//   Basic Details → KYC → Account → Documents → Preview → Submit
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaUpload, FaTrash, FaFilePdf, FaExclamationTriangle } from "react-icons/fa";
import { cpApi, cpUpload, OWNERSHIP } from "./cpApi";
import { compressImage } from "../lob/uploadUtils";
import { Field, Btn, Modal, Notice, inputCls, cx } from "../hr/ui";

const API = import.meta.env.VITE_BACKEND_URL;
const STEPS = [["basic", "Basic Details"], ["kyc", "KYC"], ["account", "Account"], ["documents", "Documents"]];
const get = (o, p) => p.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
const setIn = (o, p, v) => { const [k, ...r] = p.split("."); const c = { ...(o || {}) }; c[k] = r.length ? setIn(c[k], r.join("."), v) : v; return c; };
const IMAGE_ONLY = ["documents.photo", "documents.signature", "documents.shopPhotos"];

export default function CpDocumentation() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [d, setD] = useState({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ loading: true, error: "", saving: "", done: false });
  const [uploading, setUploading] = useState({});
  const [preview, setPreview] = useState(false);
  const dRef = useRef(d); dRef.current = d;
  const lock = useRef(false);

  const load = async () => {
    try {
      const r = await cpApi(`/public/${token}`, { public: true });
      setData(r);
      setD({ basic: {}, kyc: {}, documents: { shopPhotos: [] }, ...r.details, account: { holderName: r.basicInfo.name, ...(r.details.account || {}) } });
      setState((s) => ({ ...s, loading: false }));
    } catch (e) { setState((s) => ({ ...s, loading: false, error: e.message })); }
  };
  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps -- load once per link

  const can = (path) => !!data?.editable && (!data.openPaths || data.openPaths.includes(path));
  const set = (path, v) => setD((x) => setIn(x, path, v));
  const err = (p) => errors[p];
  const gst = get(d, "basic.gstHolder") === "Yes";

  const save = async ({ stepKey, submit } = {}, override) => {
    if (lock.current) return false;
    lock.current = true; setState((s) => ({ ...s, saving: submit ? "submit" : stepKey ? "next" : "draft" }));
    try {
      await cpApi(`/public/${token}`, { method: "PUT", public: true, body: { details: override || dRef.current, step: stepKey, submit: !!submit } });
      setErrors({});
      if (submit) { setPreview(false); setState((s) => ({ ...s, done: true })); window.scrollTo && window.scrollTo(0, 0); await load(); }
      return true;
    } catch (e) {
      const m = {}; (e.errors || []).forEach((x) => { m[x.path] = x.message; }); setErrors(m);
      if (submit && e.errors?.length) { const first = STEPS.findIndex(([k]) => e.errors[0].path.startsWith(`${k}.`)); if (first >= 0) setStep(first); setPreview(false); }
      if (!e.errors?.length) setState((s) => ({ ...s, error: e.message }));
      return false;
    } finally { lock.current = false; setState((s) => ({ ...s, saving: "" })); }
  };
  const next = async () => { if (await save({ stepKey: STEPS[step][0] })) setStep((s) => Math.min(3, s + 1)); };

  const upload = async (path, file, index) => {
    if (!file) return;
    const imageOnly = IMAGE_ONLY.includes(path);
    if (imageOnly ? !/\.jpe?g$/i.test(file.name) : !/\.(pdf|jpe?g)$/i.test(file.name)) { setErrors((m) => ({ ...m, [path]: imageOnly ? "Only JPG or JPEG files" : "Only JPG, JPEG or PDF files" })); return; }
    const key = index !== undefined ? `${path}.${index}` : path;
    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const small = /\.jpe?g$/i.test(file.name) ? await compressImage(file) : file;
      if (small.size > 4 * 1024 * 1024) throw new Error("The file is larger than 4 MB");
      const r = await cpUpload(`/public/${token}/file`, small, { path });
      let nextD;
      if (path === "documents.shopPhotos") { const arr = [...(get(dRef.current, path) || [])]; if (index !== undefined) arr[index] = r.url; else arr.push(r.url); nextD = setIn(dRef.current, path, arr); }
      else nextD = setIn(dRef.current, path, r.url);
      setD(nextD); setErrors((m) => { const c = { ...m }; delete c[path]; return c; });
      save({}, nextD); // keep the upload
    } catch (e) { setErrors((m) => ({ ...m, [path]: e.message })); } finally { setUploading((u) => ({ ...u, [key]: false })); }
  };

  if (state.loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (state.error && !data) return <div className="min-h-screen flex items-center justify-center p-6"><Notice kind="error">{state.error}</Notice></div>;
  const b = data.basicInfo;
  const T = (path, label, { required = true, transform, hint, placeholder, inputMode } = {}) => (
    <Field label={label} required={required} error={err(path)} hint={hint}>
      <input data-path={path} inputMode={inputMode} placeholder={placeholder} disabled={!can(path)} value={get(d, path) ?? ""} onChange={(e) => set(path, transform ? transform(e.target.value) : e.target.value)} className={inputCls(err(path), !can(path))} />
    </Field>
  );
  const RO = (label, value) => <Field label={label} hint="From Arshyan (not editable)"><input readOnly disabled value={value || ""} className={inputCls(false, true)} /></Field>;
  const FileRow = (path, label, { required = true, accept = ".pdf,.jpg,.jpeg" } = {}) => {
    const url = get(d, path);
    return (
      <tr className="border-t" data-doc={path}>
        <td className="p-2 text-sm">{label}{required && <span className="text-red-500"> *</span>}<div className="text-[11px] text-gray-500">{accept === ".jpg,.jpeg" ? "JPG / JPEG" : "JPG / PDF"}</div>{err(path) && <div className="text-xs text-red-600">{err(path)}</div>}</td>
        <td className="p-2">{can(path) && <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs"><FaUpload /> {uploading[path] ? "Uploading…" : url ? "Replace" : "Upload"}<input type="file" accept={accept} className="hidden" aria-label={`Upload ${label}`} disabled={!!uploading[path]} onChange={(e) => { upload(path, e.target.files[0]); e.target.value = ""; }} /></label>}</td>
        <td className="p-2 text-xs">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 flex items-center gap-1"><FaCheckCircle /> View</a> : <span className="text-gray-400">Not uploaded</span>}</td>
      </tr>
    );
  };
  const shops = get(d, "documents.shopPhotos") || [];
  const g = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  const rejectedHere = (prefix) => (data.rejected || []).filter((r) => r.paths.some((p) => p.startsWith(prefix)));
  const rejectNote = (prefix) => rejectedHere(prefix).map((r) => <p key={r.key} className="text-sm text-red-700 bg-red-50 rounded p-2 mb-3 flex gap-2"><FaExclamationTriangle className="mt-0.5" /> {r.label}: {r.remarks}</p>);
  const summaryRows = [
    ["Name", `${b.salutation || ""} ${b.name}`], ["Father's / Husband's Name", b.fatherName], ["DOB", b.dob], ["Mobile", b.mobile], ["E-mail", b.email], ["Address", b.address], ["LOBs", (b.lobs || []).join(", ")],
    ["Ownership", get(d, "basic.ownership")], ["GST holding entity", get(d, "basic.gstHolder")], ["Aadhaar No.", get(d, "kyc.aadhaar")], ["PAN", get(d, "kyc.pan")], ...(gst ? [["GST No.", get(d, "kyc.gstNo")]] : []),
    ["Account Holder", get(d, "account.holderName")], ["Bank", get(d, "account.bankName")], ["Branch", get(d, "account.branch")], ["Account No.", get(d, "account.accountNo")], ["IFSC", get(d, "account.ifsc")],
    ["Documents uploaded", ["signedWelcomeLetter", "aadhaarFront", "aadhaarBack", "panCard", "gstCertificate", "cheque", "photo", "signature"].filter((k) => get(d, `documents.${k}`)).length + shops.filter(Boolean).length],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b"><div className="max-w-5xl mx-auto px-4 py-4"><h1 className="text-xl font-bold text-gray-800">Channel Partner Onboarding</h1><p className="text-sm text-gray-500">Arshyan Insurance Marketing & Services Pvt Ltd · {b.refId}</p></div></header>
      <main className="max-w-5xl mx-auto p-4 space-y-4" data-status={data.status}>
        {data.status === "Approved" && <Notice kind="ok">Your onboarding is complete — your Channel Partner code is <b>{data.cpCode}</b>. Your CRM login details have been e-mailed to {b.email}.</Notice>}
        {state.done && data.status !== "Approved" && <Notice kind="ok">Thank you — your documents have been submitted. We'll verify them and contact you if anything needs to change.</Notice>}
        {!data.editable && data.status !== "Approved" && !state.done && <Notice kind="info">Your documents are being verified. You'll be informed by e-mail if anything needs to change.</Notice>}
        {data.editable && data.openPaths && <Notice kind="warn">Some items need correction (shown in red). Only those can be changed — everything else is already approved.</Notice>}
        {data.editable && !data.openPaths && <Notice kind="info">Complete the four steps. Your progress is saved — you can come back to this link any time.</Notice>}
        <nav className="flex gap-1 overflow-x-auto" aria-label="Steps" role="tablist">
          {STEPS.map(([k, l], i) => (
            <button key={k} type="button" role="tab" aria-selected={step === i} onClick={() => setStep(i)}
              className={cx("flex-1 min-w-[120px] px-3 py-2 rounded-lg text-sm border", step === i ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50")}>{i + 1}. {l}</button>
          ))}
        </nav>
        <section className="bg-white rounded-2xl border p-4" data-step={STEPS[step][0]}>
          {step === 0 && (<>
            {rejectNote("basic.")}
            <div className={g}>
              {RO("Name", `${b.salutation || ""} ${b.name}`)}{RO("Father's or Husband Name", b.fatherName)}{RO("DOB", b.dob)}{RO("Mobile No", b.mobile)}{RO("e-Mail Id", b.email)}{RO("Ref. No", b.refId)}
              <div className="sm:col-span-2 lg:col-span-3">{RO("Address As Per Aadhaar", b.address)}</div>
              <div className="sm:col-span-2 lg:col-span-3">{RO("LOB (Interested for)", (b.lobs || []).join(", "))}</div>
              <Field label="Ownership" required error={err("basic.ownership")}>
                <select data-path="basic.ownership" disabled={!can("basic.ownership")} value={get(d, "basic.ownership") || ""} onChange={(e) => set("basic.ownership", e.target.value)} className={inputCls(err("basic.ownership"), !can("basic.ownership"))}>
                  <option value="">Select</option>{(data.options?.ownership || OWNERSHIP).map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Are You a GST Holding Entity?" required error={err("basic.gstHolder")}>
                <div className="flex gap-4 mt-2" data-path="basic.gstHolder" role="radiogroup" aria-label="GST holding entity">
                  {["Yes", "No"].map((v) => <label key={v} className="flex items-center gap-1 text-sm"><input type="radio" disabled={!can("basic.gstHolder")} checked={get(d, "basic.gstHolder") === v} onChange={() => set("basic.gstHolder", v)} /> {v}</label>)}
                </div>
              </Field>
            </div>
          </>)}
          {step === 1 && (<>
            {rejectNote("kyc.")}
            <div className={g}>
              {T("kyc.aadhaar", "Aadhaar No", { required: !gst, inputMode: "numeric", transform: (x) => x.replace(/\D/g, "").slice(0, 12), hint: gst ? "Not mandatory for a GST holding entity" : undefined })}
              {T("kyc.pan", "PAN No", { transform: (x) => x.toUpperCase().slice(0, 10), placeholder: "ABCDE1234F" })}
              {gst && T("kyc.gstNo", "GST No.", { transform: (x) => x.toUpperCase().replace(/\s/g, "").slice(0, 15), placeholder: "07ABCDE1234F1Z5" })}
            </div>
          </>)}
          {step === 2 && (<>
            {rejectNote("account.")}
            <div className={g}>
              {T("account.holderName", "Account Holder Name", { hint: "Filled with your name — you can change it" })}
              {T("account.bankName", "Bank Name")}{T("account.branch", "Branch")}
              {T("account.accountNo", "Account No", { inputMode: "numeric", transform: (x) => x.replace(/\D/g, "").slice(0, 18) })}
              {T("account.ifsc", "IFSC", { transform: (x) => x.toUpperCase().replace(/\s/g, "").slice(0, 11), placeholder: "SBIN0001234" })}
            </div>
          </>)}
          {step === 3 && (<>
            {rejectNote("documents.")}
            <table className="w-full" data-table="cp-docs">
              <thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Entity</th><th className="p-2">Upload Doc</th><th className="p-2">View Uploaded Doc</th></tr></thead>
              <tbody>
                <tr className="border-t"><td className="p-2 text-sm">Welcome Letter<div className="text-[11px] text-gray-500">Auto generated on the letter head — download, sign each page, upload below</div></td><td className="p-2 text-xs text-gray-500">Auto</td>
                  <td className="p-2 text-xs"><a href={`${API}/api/cp-onboarding/public/${token}/welcome-letter`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-1" data-welcome-letter><FaFilePdf /> View / Download</a></td></tr>
                {FileRow("documents.signedWelcomeLetter", "Welcome Letter (signed on each page)")}
                {FileRow("documents.aadhaarFront", "Aadhaar Card Front", { required: !gst })}
                {FileRow("documents.aadhaarBack", "Aadhaar Card Back", { required: !gst })}
                {FileRow("documents.panCard", "PAN Card")}
                {gst && FileRow("documents.gstCertificate", "GST Certificate")}
                {FileRow("documents.cheque", "Cancel Cheque or Bank Passbook")}
                {FileRow("documents.photo", "Passport Size Photo", { accept: ".jpg,.jpeg" })}
                {FileRow("documents.signature", "Signature", { accept: ".jpg,.jpeg" })}
                <tr className="border-t" data-doc="documents.shopPhotos">
                  <td className="p-2 text-sm align-top">Shop or Office Photo (2–4)<span className="text-red-500"> *</span><div className="text-[11px] text-gray-500">JPG / JPEG</div>{err("documents.shopPhotos") && <div className="text-xs text-red-600">{err("documents.shopPhotos")}</div>}</td>
                  <td className="p-2 align-top">{can("documents.shopPhotos") && shops.length < 4 && <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs"><FaUpload /> {uploading["documents.shopPhotos"] ? "Uploading…" : `Add photo (${shops.length}/4)`}<input type="file" accept=".jpg,.jpeg" className="hidden" aria-label="Upload Shop or Office Photo" onChange={(e) => { upload("documents.shopPhotos", e.target.files[0]); e.target.value = ""; }} /></label>}</td>
                  <td className="p-2 text-xs align-top">{shops.length ? shops.map((u, i) => (
                    <div key={u + i} className="flex items-center gap-2"><a href={u} target="_blank" rel="noopener noreferrer" className="text-emerald-700 flex items-center gap-1"><FaCheckCircle /> Photo {i + 1}</a>
                      {can("documents.shopPhotos") && <button type="button" aria-label={`Remove photo ${i + 1}`} className="text-red-500" onClick={() => { const nd = setIn(dRef.current, "documents.shopPhotos", shops.filter((_, k) => k !== i)); setD(nd); save({}, nd); }}><FaTrash /></button>}</div>
                  )) : <span className="text-gray-400">Not uploaded</span>}</td>
                </tr>
              </tbody>
            </table>
          </>)}
        </section>
        {data.editable && (
          <div className="flex flex-wrap items-center justify-end gap-2" data-actions>
            {step > 0 && <Btn kind="secondary" onClick={() => setStep(step - 1)}>Back</Btn>}
            {step < 3 ? <Btn onClick={next} disabled={!!state.saving}>{state.saving === "next" ? "Saving…" : "Save & Next"}</Btn> : <>
              <Btn kind="secondary" onClick={() => save({})} disabled={!!state.saving}>{state.saving === "draft" ? "Saving…" : "Save"}</Btn>
              <Btn kind="outline" onClick={() => setPreview(true)}>Preview</Btn>
              <Btn onClick={() => save({ submit: true })} disabled={!!state.saving}>{state.saving === "submit" ? "Submitting…" : data.openPaths ? "Re-submit corrections" : "Submit"}</Btn>
            </>}
          </div>
        )}
        {preview && (
          <Modal title="Preview — check your details before submitting" onClose={() => setPreview(false)}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm" data-preview>{summaryRows.flatMap(([l, v]) => [<dt key={`${l}l`} className="text-gray-500">{l}</dt>, <dd key={`${l}v`} className="break-words">{v || "—"}</dd>])}</dl>
            <div className="flex justify-end gap-2 mt-4"><Btn kind="secondary" onClick={() => setPreview(false)}>Edit</Btn><Btn onClick={() => save({ submit: true })} disabled={!!state.saving}>{state.saving === "submit" ? "Submitting…" : "Submit"}</Btn></div>
          </Modal>
        )}
      </main>
    </div>
  );
}
