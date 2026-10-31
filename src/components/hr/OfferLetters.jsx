// src/components/hr/OfferLetters.jsx — My HR › Offer Letters
import { useEffect, useState } from "react";
import { FaPlus, FaFilePdf, FaEnvelope, FaLink, FaSave, FaTrash, FaArrowLeft, FaCopy } from "react-icons/fa";
import { hrApi, openHrPdf, inr, fmtDate, todayYmd } from "./hrApi";
import { Field, Btn, Card, Modal, Notice, Badge, inputCls, cx } from "./ui";
import MasterSelect from "./MasterSelect";
import SalaryEditor from "./SalaryEditor";

const blankOffer = () => ({
  issuedDate: todayYmd(), name: "", fatherName: "", address: "", designation: "", department: "", reportingManager: "", rank: "",
  dateOfJoining: "", employmentType: "", workSchedule: "", jobVenue: "", candidateEmail: "", candidateMobile: "",
  earnings: { basic: "", hra: "", medical: "", bonus: "" }, deductions: [], insurance: { gpa: "", gmc: "" }, additionalTerms: [],
});
const ymd = (v) => (v ? String(v).slice(0, 10) : "");
const DROPDOWNS = [
  ["designation", "Designation"], ["department", "Department"], ["reportingManager", "Reporting Manager and Designation"], ["rank", "Rank"],
  ["employmentType", "Employment Type"], ["workSchedule", "Working Hour / Schedule"], ["jobVenue", "Job Venue"],
];

export default function OfferLetters({ masters, setMasters, settings }) {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null); // offer being edited (or new)
  const [tab, setTab] = useState("basic");
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState("");
  const [mail, setMail] = useState(null);

  const load = async () => { try { setList(await hrApi("/offers")); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  useEffect(() => { load(); }, []);

  const open = async (id) => {
    setErrors({}); setMsg(null); setTab("basic");
    if (!id) return setEditing(blankOffer());
    try {
      const o = await hrApi(`/offers/${id}`);
      setEditing({ ...blankOffer(), ...o, issuedDate: ymd(o.issuedDate), dateOfJoining: ymd(o.dateOfJoining), earnings: { ...o.earnings }, insurance: { ...o.insurance } });
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const set = (patch) => setEditing((p) => ({ ...p, ...patch }));
  const locked = editing?.status === "Completed";

  const save = async () => {
    setBusy("save"); setMsg(null); setErrors({});
    try {
      const saved = editing._id ? await hrApi(`/offers/${editing._id}`, { method: "PUT", body: editing }) : await hrApi("/offers", { method: "POST", body: editing });
      setEditing((p) => ({ ...p, _id: saved._id, refId: saved.refId, status: saved.status }));
      setMsg({ kind: "ok", text: `Saved ${saved.refId}.` });
      load();
      return saved;
    } catch (e) {
      const map = {}; (e.errors || []).forEach((x) => { map[x.field] = x.message; });
      setErrors(map);
      if (Object.keys(map).some((k) => !k.startsWith("earnings") && k !== "deductions")) setTab("basic");
      setMsg({ kind: "error", text: e.message });
      return null;
    } finally { setBusy(""); }
  };
  const preview = async () => { const s = editing._id ? editing : await save(); if (s) openHrPdf(`/offers/${s._id || editing._id}/letter`).catch((e) => setMsg({ kind: "error", text: e.message })); };
  const openMail = async () => {
    const s = await save();
    if (!s) return;
    try { setMail({ ...(await hrApi(`/offers/${s._id}/email-draft`)), to: editing.candidateEmail || "" }); } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const sendMail = async () => {
    setBusy("send");
    try {
      const r = await hrApi(`/offers/${editing._id}/send`, { method: "POST", body: { to: mail.to, subject: mail.subject, body: mail.body } });
      setMail(null); set({ status: r.status, link: r.link });
      setMsg({ kind: "ok", text: `Offer sent to ${r.sentTo}. The candidate can now fill in the documentation form.` });
      load();
    } catch (e) { setMail((m) => ({ ...m, error: e.message })); } finally { setBusy(""); }
  };
  const newLink = async () => {
    if (!window.confirm("Create a new link? The old link will stop working.")) return;
    try { const r = await hrApi(`/offers/${editing._id}/regenerate-link`, { method: "POST" }); set({ link: r.link }); setMsg({ kind: "ok", text: "New link created — send it to the candidate." }); } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };

  if (!editing) {
    return (
      <Card title="Offer Letters" actions={<Btn onClick={() => open(null)}><FaPlus /> New Offer Letter</Btn>}>
        {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
        {!list.length ? <p className="text-sm text-gray-500">No offer letters yet.</p> : (
          <table className="w-full text-sm" data-table="offers">
            <thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Ref.</th><th className="p-2">Candidate</th><th className="p-2">Position</th><th className="p-2">Joining</th><th className="p-2">CTC / month</th><th className="p-2">Documents</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o._id} className="border-t align-top">
                  <td className="p-2 font-medium">{o.refId}</td>
                  <td className="p-2">{o.name}{o.employeeCode && <div className="text-xs text-emerald-700">{o.employeeCode}</div>}</td>
                  <td className="p-2">{o.designation}<div className="text-xs text-gray-500">{o.department}</div></td>
                  <td className="p-2">{fmtDate(o.dateOfJoining)}</td>
                  <td className="p-2">{inr(o.ctc)}</td>
                  <td className="p-2 text-xs">{o.items.total ? `${o.items.approved}/${o.items.total} approved${o.items.rejected ? `, ${o.items.rejected} rejected` : ""}` : "—"}</td>
                  <td className="p-2"><Badge s={o.status} /></td>
                  <td className="p-2"><Btn kind="outline" onClick={() => open(o._id)}>Open</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    );
  }

  const tabs = [["basic", "Basic Details"], ["salary", "Salary"], ["terms", "Additional Terms"]];
  return (
    <Card
      title={<span className="flex items-center gap-2"><button type="button" onClick={() => { setEditing(null); load(); }} aria-label="Back" className="text-gray-500 hover:text-gray-800"><FaArrowLeft /></button>{editing.refId ? `Offer ${editing.refId}` : "New Offer Letter"} {editing.status && <Badge s={editing.status} />}</span>}
      actions={<>
        <Btn kind="secondary" onClick={preview} disabled={!!busy}><FaFilePdf /> Preview PDF</Btn>
        {!locked && <Btn kind="secondary" onClick={save} disabled={!!busy}><FaSave /> {busy === "save" ? "Saving…" : "Save"}</Btn>}
        {!locked && <Btn onClick={openMail} disabled={!!busy}><FaEnvelope /> {editing.status && editing.status !== "Draft" ? "Send again" : "Send to Candidate"}</Btn>}
      </>}
    >
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      {locked && <div className="mb-3"><Notice kind="ok">Documentation complete — employee code <b>{editing.employeeCode}</b>. Salary changes now go through Promotions.</Notice></div>}
      {editing.link && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm bg-gray-50 border rounded-lg p-2" data-link>
          <FaLink className="text-indigo-600" /> <span className="break-all flex-1">{editing.link}</span>
          <Btn kind="secondary" onClick={() => navigator.clipboard && navigator.clipboard.writeText(editing.link)}><FaCopy /> Copy</Btn>
          {!locked && <Btn kind="secondary" onClick={newLink}>New link</Btn>}
        </div>
      )}
      <div className="flex gap-1 border-b mb-4" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cx("px-4 py-2 text-sm -mb-px border-b-2", tab === k ? "border-indigo-600 text-indigo-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-800")}>{l}</button>
        ))}
      </div>
      <fieldset disabled={locked}>
        {tab === "basic" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Issued Date"><input type="date" data-field="issuedDate" value={editing.issuedDate} onChange={(e) => set({ issuedDate: e.target.value })} className={inputCls()} /></Field>
            <Field label="Name" required error={errors.name}><input data-field="name" value={editing.name} onChange={(e) => set({ name: e.target.value.toUpperCase() })} className={cx(inputCls(errors.name), "uppercase")} /></Field>
            <Field label="Father's / Husband's Name" required error={errors.fatherName}><input data-field="fatherName" value={editing.fatherName} onChange={(e) => set({ fatherName: e.target.value })} className={inputCls(errors.fatherName)} /></Field>
            <Field label="Address" required error={errors.address} className="sm:col-span-2 lg:col-span-3"><textarea data-field="address" rows="2" value={editing.address} onChange={(e) => set({ address: e.target.value })} className={inputCls(errors.address)} /></Field>
            {DROPDOWNS.slice(0, 4).map(([k, l]) => (
              <Field key={k} label={l}><MasterSelect type={k} label={l} value={editing[k]} onChange={(v) => set({ [k]: v })} masters={masters} setMasters={setMasters} withEmail={k === "reportingManager"} /></Field>
            ))}
            <Field label="Date of Joining" required error={errors.dateOfJoining}><input type="date" data-field="dateOfJoining" value={editing.dateOfJoining} onChange={(e) => set({ dateOfJoining: e.target.value })} className={inputCls(errors.dateOfJoining)} /></Field>
            {DROPDOWNS.slice(4).map(([k, l]) => (
              <Field key={k} label={l}><MasterSelect type={k} label={l} value={editing[k]} onChange={(v) => set({ [k]: v })} masters={masters} setMasters={setMasters} /></Field>
            ))}
            <Field label="Candidate e-mail" error={errors.candidateEmail} hint="The offer and documentation link go here"><input data-field="candidateEmail" type="email" value={editing.candidateEmail} onChange={(e) => set({ candidateEmail: e.target.value })} className={inputCls(errors.candidateEmail)} /></Field>
            <Field label="Candidate mobile"><input data-field="candidateMobile" inputMode="numeric" maxLength="10" value={editing.candidateMobile} onChange={(e) => set({ candidateMobile: e.target.value.replace(/\D/g, "") })} className={inputCls()} /></Field>
          </div>
        )}
        {tab === "salary" && <SalaryEditor value={editing} onChange={(v) => set({ earnings: v.earnings, deductions: v.deductions, insurance: v.insurance })} settings={settings} disabled={locked} />}
        {tab === "terms" && (
          <div className="space-y-2" data-section="terms">
            <p className="text-sm text-gray-600">Terms added here appear in the letter after the standard terms (a)–(h), in this order.</p>
            {(editing.additionalTerms || []).map((t, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-sm text-gray-500 pt-2 w-8">({String.fromCharCode(105 + i)})</span>
                <textarea data-field={`term_${i}`} rows="2" value={t} onChange={(e) => set({ additionalTerms: editing.additionalTerms.map((x, k) => (k === i ? e.target.value : x)) })} className={inputCls()} />
                <button type="button" aria-label={`Delete term ${i + 1}`} onClick={() => set({ additionalTerms: editing.additionalTerms.filter((_, k) => k !== i) })} className="p-2 text-red-500 hover:text-red-700"><FaTrash /></button>
              </div>
            ))}
            <Btn kind="outline" onClick={() => set({ additionalTerms: [...(editing.additionalTerms || []), ""] })}><FaPlus /> Add Term</Btn>
          </div>
        )}
      </fieldset>

      {mail && (
        <Modal title="Send offer letter" onClose={() => setMail(null)}>
          <div className="space-y-3">
            <Field label="To" required><input data-field="mailTo" type="email" value={mail.to} onChange={(e) => setMail({ ...mail, to: e.target.value })} className={inputCls()} /></Field>
            <Field label="Subject"><input value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} className={inputCls()} /></Field>
            <Field label="Message" hint="Edit as needed — keep the link. The offer letter PDF is attached."><textarea data-field="mailBody" rows="12" value={mail.body} onChange={(e) => setMail({ ...mail, body: e.target.value })} className={cx(inputCls(), "font-mono text-xs")} /></Field>
            {mail.error && <Notice kind="error">{mail.error}</Notice>}
            <div className="flex justify-end gap-2"><Btn kind="secondary" onClick={() => setMail(null)}>Cancel</Btn><Btn onClick={sendMail} disabled={busy === "send"}><FaEnvelope /> {busy === "send" ? "Sending…" : "Send e-Mail"}</Btn></div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
