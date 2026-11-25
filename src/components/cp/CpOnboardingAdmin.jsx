// src/components/cp/CpOnboardingAdmin.jsx — Admin › CP Onboarding (BRD for Channel Partner Onboarding)
import { useEffect, useRef, useState } from "react";
import { FaPlus, FaArrowLeft, FaEnvelope, FaFilePdf, FaCopy, FaLink, FaCheck, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { cpApi, openCpPdf } from "./cpApi";
import { LOB_OPTIONS } from "../lob/caseWorkflow";
import { Field, Btn, Card, Modal, Notice, Badge, inputCls, cx } from "../hr/ui";
import Pagination, { usePagination } from "../lob/Pagination";
<<<<<<< HEAD
import LobMultiSelect from "./LobMultiSelect";
=======
>>>>>>> fcbdc78e2a8842fc4a65a6f5728bfc913f1b6b4e

const blank = () => ({ salutation: "Mr.", name: "", fatherName: "", address: "", dob: "", mobile: "", email: "", lobs: [] });
const fmt = (v) => (v ? new Date(String(v).length === 10 ? `${v}T00:00:00` : v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const maxDob = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10); };

export default function CpOnboardingAdmin() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);      // new CP
  const [view, setView] = useState(null);      // one CP (details + items)
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState("");
  const lock = useRef(false);
  const once = async (kind, fn) => { if (lock.current) return; lock.current = true; setBusy(kind); try { await fn(); } finally { lock.current = false; setBusy(""); } };
  const [q, setQ] = useState("");
  const shown = list.filter((c) => `${c.refId} ${c.name} ${c.mobile} ${c.email} ${c.cpCode || ""}`.toLowerCase().includes(q.toLowerCase()));
  const pager = usePagination(shown, { resetKeys: [q] });
  const load = () => cpApi("/").then(setList).catch((e) => setMsg({ kind: "error", text: e.message }));
  useEffect(() => { load(); }, []);
  const open = async (id, keep = false) => { if (!keep) setMsg(null); try { setView(await cpApi(`/${id}`)); } catch (e) { setMsg({ kind: "error", text: e.message }); } };

  const save = (andSend) => once(andSend ? "send" : "save", async () => {
    setErrors({}); setMsg(null);
    try {
      const c = await cpApi("/", { method: "POST", body: form });
      if (andSend) {
        try { const s = await cpApi(`/${c._id}/send`, { method: "POST" }); setMsg({ kind: "ok", text: `${c.refId} created and the documentation link e-mailed to ${s.sentTo}.` }); }
        catch (e) { setMsg({ kind: "warn", text: `${c.refId} created, but the e-mail could not be sent: ${e.message}` }); }
      } else setMsg({ kind: "ok", text: `${c.refId} saved. Use "Send link" to e-mail the documentation link.` });
      setForm(null); load(); open(c._id, true);
    } catch (e) {
      const m = {}; (e.errors || []).forEach((x) => { m[x.field] = x.message; }); setErrors(m);
      setMsg({ kind: "error", text: e.message });
    }
  });

  // ---------------- new CP: Basic Information ----------------
  if (form) {
    const set = (p) => setForm((f) => ({ ...f, ...p }));
<<<<<<< HEAD
=======
    const toggleLob = (l) => set({ lobs: form.lobs.includes(l) ? form.lobs.filter((x) => x !== l) : [...form.lobs, l] });
>>>>>>> fcbdc78e2a8842fc4a65a6f5728bfc913f1b6b4e
    return (
      <div className="p-4"><Card title={<span className="flex items-center gap-2"><button type="button" aria-label="Back" onClick={() => setForm(null)} className="text-gray-500"><FaArrowLeft /></button>New Channel Partner — Basic Information</span>}>
        {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-form="cp-basic">
          <Field label="Name" required error={errors.name}>
            <div className="flex gap-2">
              <select aria-label="Salutation" value={form.salutation} onChange={(e) => set({ salutation: e.target.value })} className={cx(inputCls(), "w-20")}>{["Mr.", "Ms.", "Mrs.", "M/s."].map((s) => <option key={s}>{s}</option>)}</select>
              <input data-field="name" value={form.name} onChange={(e) => set({ name: e.target.value.toUpperCase() })} className={cx(inputCls(errors.name), "uppercase")} />
            </div>
          </Field>
          <Field label="Father's or Husband Name" required error={errors.fatherName}><input data-field="fatherName" value={form.fatherName} onChange={(e) => set({ fatherName: e.target.value.toUpperCase() })} className={cx(inputCls(errors.fatherName), "uppercase")} /></Field>
          <Field label="DOB" required error={errors.dob}><input data-field="dob" type="date" max={maxDob()} value={form.dob} onChange={(e) => set({ dob: e.target.value })} className={inputCls(errors.dob)} /></Field>
          <Field label="Address As Per Aadhaar" required error={errors.address} className="sm:col-span-2 lg:col-span-3"><textarea data-field="address" rows="2" value={form.address} onChange={(e) => set({ address: e.target.value })} className={inputCls(errors.address)} /></Field>
          <Field label="Mobile No" required error={errors.mobile}><input data-field="mobile" inputMode="numeric" value={form.mobile} onChange={(e) => set({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputCls(errors.mobile)} /></Field>
          <Field label="e-Mail Id" required error={errors.email}><input data-field="email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputCls(errors.email)} /></Field>
          <Field label="Ref. No" hint="Generated on save (AIM_CP00016 onwards)"><input readOnly disabled value="Auto" className={inputCls(false, true)} /></Field>
          <Field label="LOB (Interested for)" required error={errors.lobs} className="sm:col-span-2 lg:col-span-3">
<<<<<<< HEAD
            <div className="mt-1 max-w-xl" data-field="lobs">
              <LobMultiSelect label="LOB (Interested for)" options={LOB_OPTIONS} value={form.lobs} onChange={(lobs) => set({ lobs })} error={errors.lobs} />
            </div>
            {form.lobs.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{form.lobs.map((l) => <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{l}</span>)}</div>}
=======
            <div className="flex flex-wrap gap-2 mt-1" data-field="lobs" role="group" aria-label="LOB (Interested for)">
              {LOB_OPTIONS.map((l) => (
                <label key={l} className={cx("px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none", form.lobs.includes(l) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700")}>
                  <input type="checkbox" className="sr-only" checked={form.lobs.includes(l)} onChange={() => toggleLob(l)} /> {l}
                </label>
              ))}
            </div>
>>>>>>> fcbdc78e2a8842fc4a65a6f5728bfc913f1b6b4e
            <p className="text-xs text-gray-500 mt-1">The Channel Partner's login will show only these LOBs.</p>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
          <Btn kind="secondary" onClick={() => save(false)} disabled={!!busy}>{busy === "save" ? "Saving…" : "Save"}</Btn>
          <Btn onClick={() => save(true)} disabled={!!busy}><FaEnvelope /> {busy === "send" ? "Sending…" : "Save and Send"}</Btn>
        </div>
      </Card></div>
    );
  }

  // ---------------- one CP: details + validation ----------------
  if (view) return <CpDetail view={view} reload={(keep) => open(view._id, keep)} back={() => { setView(null); load(); }} msg={msg} setMsg={setMsg} once={once} busy={busy} />;

  // ---------------- list ----------------
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-2xl font-bold text-gray-800">CP Onboarding</h1><p className="text-sm text-gray-500">Channel Partner documentation, verification and CP codes</p></div>
        <Btn onClick={() => { setForm(blank()); setErrors({}); setMsg(null); }}><FaPlus /> New Channel Partner</Btn></div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Card title={`Channel Partners (${list.length})`} actions={<input aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, mobile, ref…" className={cx(inputCls(), "w-64")} />}>
        {!shown.length ? <p className="text-sm text-gray-500">No Channel Partners yet.</p> : (
          <table className="w-full text-sm" data-table="cp-list">
            <thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Ref. No</th><th className="p-2">Name</th><th className="p-2">Mobile / E-mail</th><th className="p-2">LOBs</th><th className="p-2">Documents</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
            <tbody>{pager.pageItems.map((c) => (
              <tr key={c._id} className="border-t align-top">
                <td className="p-2 font-medium">{c.refId}{c.cpCode && <div className="text-xs text-emerald-700">{c.cpCode}</div>}</td>
                <td className="p-2">{c.name}</td><td className="p-2">{c.mobile}<div className="text-xs text-gray-500">{c.email}</div></td>
                <td className="p-2 text-xs">{(c.lobs || []).join(", ")}</td>
                <td className="p-2 text-xs">{c.items ? `${c.items.approved}/${c.items.total} approved${c.items.rejected ? `, ${c.items.rejected} rejected` : ""}` : c.sentAt ? `Link sent ${fmt(c.sentAt)}` : "Not sent"}</td>
                <td className="p-2"><Badge s={c.status} /></td>
                <td className="p-2"><Btn kind="outline" onClick={() => open(c._id)}>Open</Btn></td>
              </tr>))}
            </tbody>
          </table>
        )}
        {shown.length > 0 && <div className="-mx-4 mt-2"><Pagination p={pager} label="Channel Partners" /></div>}
      </Card>
    </div>
  );
}

function CpDetail({ view: v, reload, back, msg, setMsg, once, busy }) {
  const [decisions, setDecisions] = useState({});
  const [mail, setMail] = useState(null);
  const setD = (key, p) => setDecisions((x) => ({ ...x, [key]: { ...(x[key] || {}), ...p } }));
  const approved = v.status === "Approved";
  const sendLink = () => once("send", async () => { try { const r = await cpApi(`/${v._id}/send`, { method: "POST" }); setMsg({ kind: "ok", text: `Documentation link e-mailed to ${r.sentTo}.` }); reload(true); } catch (e) { setMsg({ kind: "error", text: e.message }); } });
  const newLink = () => once("link", async () => { if (!window.confirm("Create a new link? The old one stops working.")) return; try { await cpApi(`/${v._id}/regenerate-link`, { method: "POST" }); setMsg({ kind: "ok", text: "New link created — use Send link to e-mail it." }); reload(true); } catch (e) { setMsg({ kind: "error", text: e.message }); } });
  const saveDecisions = () => once("decide", async () => {
    const list = Object.entries(decisions).map(([key, d]) => ({ key, ...d }));
    try {
      const r = await cpApi(`/${v._id}/validation`, { method: "POST", body: { decisions: list } });
      setDecisions({});
      if (r.cpCode) { const l = r.login || {}; setMsg({ kind: "ok", text: `All documents approved — CP code ${r.cpCode} generated. CRM login: User ID ${l.userId} (or ${l.email}), password ${l.password}${l.mailed ? " — welcome e-mail sent with the Welcome Letter." : " — the e-mail could not be sent; share these details with the Channel Partner."}` }); }
      else setMsg({ kind: r.rejected ? "warn" : "ok", text: r.rejected ? `${r.rejected} item(s) rejected — send the rejection e-mail so the Channel Partner can re-submit.` : "Saved." });
      reload(true);
    } catch (e) { setMsg({ kind: "error", text: [e.message, ...(e.errors || [])].join(" — ") }); }
  });
  const openMail = async () => { try { setMail(await cpApi(`/${v._id}/rejection-draft`)); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const sendMail = () => once("mail", async () => { try { await cpApi(`/${v._id}/rejection-send`, { method: "POST", body: mail }); setMail(null); setMsg({ kind: "ok", text: "Rejection e-mail sent." }); reload(true); } catch (e) { setMail((m) => ({ ...m, error: e.message })); } });
  const info = [["Ref. No", v.refId], ["CP Code", v.cpCode || "—"], ["Name", `${v.salutation || ""} ${v.name}`], ["Father's / Husband's Name", v.fatherName], ["DOB", fmt(v.dob)], ["Mobile", v.mobile], ["E-mail", v.email], ["Address", v.address], ["LOBs", (v.lobs || []).join(", ")]];
  return (
    <div className="p-4 space-y-4">
      <Card title={<span className="flex items-center gap-2"><button type="button" aria-label="Back" onClick={back} className="text-gray-500"><FaArrowLeft /></button>{v.name} — {v.refId} <Badge s={v.status} /></span>}
        actions={<>
          <Btn kind="secondary" onClick={() => openCpPdf(`/${v._id}/welcome-letter`).catch((e) => setMsg({ kind: "error", text: e.message }))}><FaFilePdf /> Welcome Letter</Btn>
          {!approved && <Btn onClick={sendLink} disabled={!!busy}><FaEnvelope /> {busy === "send" ? "Sending…" : v.sentAt ? "Send link again" : "Send link"}</Btn>}
        </>}>
        {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm" data-cp-info>{info.map(([l, x]) => <div key={l}><div className="text-xs text-gray-500">{l}</div><div className="break-words">{x || "—"}</div></div>)}</div>
        {v.link && !approved && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm bg-gray-50 border rounded-lg p-2" data-link>
            <FaLink className="text-indigo-600" /><a href={v.link} target="_blank" rel="noopener noreferrer" className="break-all flex-1 text-indigo-700 underline">{v.link}</a>
            <Btn kind="secondary" onClick={() => navigator.clipboard && navigator.clipboard.writeText(v.link)}><FaCopy /> Copy</Btn>
            <Btn kind="secondary" onClick={newLink} disabled={!!busy}>New link</Btn>
          </div>
        )}
      </Card>
      <Card title="Document Validation" actions={!approved && v.submittedAt && <>
        {v.rejected > 0 && <Btn kind="danger" onClick={openMail}><FaEnvelope /> Rejection e-mail ({v.rejected})</Btn>}
        <Btn onClick={saveDecisions} disabled={!!busy || !Object.keys(decisions).length}>{busy === "decide" ? "Saving…" : `Save decisions${Object.keys(decisions).length ? ` (${Object.keys(decisions).length})` : ""}`}</Btn>
      </>}>
        {!v.submittedAt ? <p className="text-sm text-gray-500">The Channel Partner hasn't submitted the documents yet.</p> : (
          <div className="space-y-2" data-list="cp-items">
            <p className="text-sm"><span className="text-emerald-700">{v.approved} approved</span> · <span className="text-red-600">{v.rejected} rejected</span> · <span className="text-amber-700">{v.pending} pending</span> of {v.items.length}</p>
            {v.items.map((it) => {
              const d = decisions[it.key] || {}; const status = d.status || it.status;
              return (
                <div key={it.key} data-item={it.key} className={cx("border rounded-lg p-3", status === "Approved" ? "border-emerald-200 bg-emerald-50/40" : status === "Rejected" ? "border-red-200 bg-red-50/40" : "border-gray-200")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 flex items-center gap-2">{it.label} <Badge s={status} />{d.status && <span className="text-xs text-indigo-600">(not saved)</span>}</div>
                      <dl className="text-xs text-gray-600 mt-1 grid grid-cols-[auto_1fr] gap-x-3">{it.fields.flatMap(([l, x]) => [<dt key={`${l}l`} className="text-gray-500">{l}</dt>, <dd key={`${l}v`} className="break-words">{x}</dd>])}</dl>
                      {it.files.length > 0 && <div className="flex flex-wrap gap-3 mt-2">{it.files.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline flex items-center gap-1"><FaExternalLinkAlt /> View {l}</a>)}</div>}
                      {it.status === "Rejected" && !d.status && it.remarks && <p className="text-xs text-red-600 mt-1">Rejected: {it.remarks}</p>}
                    </div>
                    {!approved && <div className="flex gap-2">
                      <Btn kind={status === "Approved" ? "success" : "secondary"} onClick={() => setD(it.key, { status: "Approved", remarks: "" })}><FaCheck /> Approve</Btn>
                      <Btn kind={status === "Rejected" ? "danger" : "secondary"} onClick={() => setD(it.key, { status: "Rejected" })}><FaTimes /> Reject</Btn>
                    </div>}
                  </div>
                  {d.status === "Rejected" && <Field label="Remarks (mandatory)" className="mt-2"><input aria-label={`Remarks ${it.label}`} value={d.remarks || ""} onChange={(e) => setD(it.key, { remarks: e.target.value })} className={inputCls(!d.remarks)} /></Field>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {mail && (
        <Modal title="Rejection e-mail" onClose={() => setMail(null)}>
          <div className="space-y-3">
            <Field label="To"><input value={mail.to} onChange={(e) => setMail({ ...mail, to: e.target.value })} className={inputCls()} /></Field>
            <Field label="Subject"><input value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} className={inputCls()} /></Field>
            <Field label="Message"><textarea rows="10" value={mail.body} onChange={(e) => setMail({ ...mail, body: e.target.value })} className={cx(inputCls(), "font-mono text-xs")} /></Field>
            {mail.error && <Notice kind="error">{mail.error}</Notice>}
            <div className="flex justify-end gap-2"><Btn kind="secondary" onClick={() => setMail(null)}>Cancel</Btn><Btn kind="danger" onClick={sendMail} disabled={!!busy}><FaEnvelope /> {busy === "mail" ? "Sending…" : "Send e-Mail"}</Btn></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
