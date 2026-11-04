// src/components/hr/DocumentValidation.jsx — My HR › Document Validation
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaEnvelope, FaExternalLinkAlt, FaArrowLeft } from "react-icons/fa";
import { hrApi } from "./hrApi";
import { Field, Btn, Card, Modal, Notice, Badge, inputCls, cx } from "./ui";

export default function DocumentValidation({ onEmployeeCreated }) {
  const [offers, setOffers] = useState([]);
  const [current, setCurrent] = useState(null); // { offer, items, ... }
  const [decisions, setDecisions] = useState({}); // key -> { status, remarks }
  const [msg, setMsg] = useState(null);
  const [mail, setMail] = useState(null);
  const [busy, setBusy] = useState("");

  const load = async () => { try { setOffers((await hrApi("/offers")).filter((o) => ["Submitted", "Under Review", "Rejected Items", "Completed"].includes(o.status))); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  useEffect(() => { load(); }, []);
  // keepMsg: reload after a save without clearing the message that was just shown
  const open = async (id, keepMsg = false) => { if (!keepMsg) setMsg(null); setDecisions({}); try { setCurrent(await hrApi(`/offers/${id}/validation`)); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const setD = (key, patch) => setDecisions((p) => ({ ...p, [key]: { ...(p[key] || {}), ...patch } }));

  const save = async () => {
    const list = Object.entries(decisions).map(([key, d]) => ({ key, ...d }));
    if (!list.length) return setMsg({ kind: "warn", text: "Approve or reject at least one item first." });
    setBusy("save");
    try {
      const r = await hrApi(`/offers/${current.offer._id}/validation`, { method: "POST", body: { decisions: list } });
      setDecisions({});
      if (r.employeeCode) { setMsg({ kind: "ok", text: `All documents approved — employee code ${r.employeeCode} generated.` }); onEmployeeCreated && onEmployeeCreated(); }
      else setMsg({ kind: r.rejected ? "warn" : "ok", text: r.rejected ? `${r.rejected} item(s) rejected — send the rejection e-mail so the candidate can re-submit.` : "Saved." });
      await open(current.offer._id, true); load();
    } catch (e) { setMsg({ kind: "error", text: [e.message, ...(e.errors || [])].join(" — ") }); } finally { setBusy(""); }
  };
  const openMail = async () => { try { setMail(await hrApi(`/offers/${current.offer._id}/rejection-draft`)); } catch (e) { setMsg({ kind: "error", text: e.message }); } };
  const sendMail = async () => {
    setBusy("mail");
    try { await hrApi(`/offers/${current.offer._id}/rejection-send`, { method: "POST", body: mail }); setMail(null); setMsg({ kind: "ok", text: "Rejection e-mail sent. The candidate can re-submit the rejected items through the same link." }); await open(current.offer._id, true); load(); }
    catch (e) { setMail((m) => ({ ...m, error: e.message })); } finally { setBusy(""); }
  };

  if (!current) {
    return (
      <Card title="Document Validation">
        {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
        {!offers.length ? <p className="text-sm text-gray-500">No submitted documentation yet.</p> : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="p-2">Ref.</th><th className="p-2">Candidate</th><th className="p-2">Progress</th><th className="p-2">Status</th><th className="p-2"></th></tr></thead>
            <tbody>{offers.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-2 font-medium">{o.refId}</td><td className="p-2">{o.name}<div className="text-xs text-gray-500">{o.designation}</div></td>
                <td className="p-2 text-xs">{o.items.approved}/{o.items.total} approved{o.items.rejected ? `, ${o.items.rejected} rejected` : ""}{o.items.pending ? `, ${o.items.pending} pending` : ""}</td>
                <td className="p-2"><Badge s={o.status} />{o.employeeCode && <div className="text-xs text-emerald-700 mt-1">{o.employeeCode}</div>}</td>
                <td className="p-2"><Btn kind="outline" onClick={() => open(o._id)}>Review</Btn></td>
              </tr>))}
            </tbody>
          </table>
        )}
      </Card>
    );
  }

  const done = current.offer.status === "Completed";
  return (
    <Card
      title={<span className="flex items-center gap-2"><button type="button" aria-label="Back" onClick={() => { setCurrent(null); load(); }} className="text-gray-500 hover:text-gray-800"><FaArrowLeft /></button>{current.offer.name} — {current.offer.refId} <Badge s={current.offer.status} /></span>}
      actions={!done && <>
        {current.rejected > 0 && <Btn kind="danger" onClick={openMail}><FaEnvelope /> Rejection e-mail ({current.rejected})</Btn>}
        <Btn onClick={save} disabled={busy === "save" || !Object.keys(decisions).length}>{busy === "save" ? "Saving…" : `Save decisions${Object.keys(decisions).length ? ` (${Object.keys(decisions).length})` : ""}`}</Btn>
      </>}
    >
      <div className="flex flex-wrap gap-3 text-sm mb-3"><span className="text-emerald-700">{current.approved} approved</span><span className="text-red-600">{current.rejected} rejected</span><span className="text-amber-700">{current.pending} pending</span><span className="text-gray-500">of {current.items.length}</span></div>
      {msg && <div className="mb-3"><Notice kind={msg.kind}>{msg.text}</Notice></div>}
      {done && <div className="mb-3"><Notice kind="ok">Documentation complete — employee code <b>{current.offer.employeeCode}</b>.</Notice></div>}
      <div className="space-y-2" data-list="items">
        {current.items.map((it) => {
          const d = decisions[it.key] || {};
          const status = d.status || it.status;
          return (
            <div key={it.key} data-item={it.key} className={cx("border rounded-lg p-3", status === "Approved" ? "border-emerald-200 bg-emerald-50/40" : status === "Rejected" ? "border-red-200 bg-red-50/40" : "border-gray-200")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 flex items-center gap-2">{it.label} <Badge s={status} />{d.status && <span className="text-xs text-indigo-600">(not saved)</span>}</div>
                  <dl className="text-xs text-gray-600 mt-1 grid grid-cols-[auto_1fr] gap-x-3">
                    {it.fields.flatMap(([l, v]) => [<dt key={`${l}-l`} className="text-gray-500">{l}</dt>, <dd key={`${l}-v`} className="break-words">{v}</dd>])}
                  </dl>
                  {it.files.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{it.files.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline flex items-center gap-1"><FaExternalLinkAlt /> View {l}</a>)}</div>}
                  {it.status === "Rejected" && !d.status && it.remarks && <p className="text-xs text-red-600 mt-1">Rejected: {it.remarks}</p>}
                </div>
                {!done && (
                  <div className="flex gap-2">
                    <Btn kind={status === "Approved" ? "success" : "secondary"} onClick={() => setD(it.key, { status: "Approved", remarks: "" })}><FaCheck /> Approve</Btn>
                    <Btn kind={status === "Rejected" ? "danger" : "secondary"} onClick={() => setD(it.key, { status: "Rejected" })}><FaTimes /> Reject</Btn>
                  </div>
                )}
              </div>
              {d.status === "Rejected" && (
                <Field label="Remarks (mandatory)" className="mt-2"><input data-field={`remarks_${it.key}`} value={d.remarks || ""} onChange={(e) => setD(it.key, { remarks: e.target.value })} className={inputCls(!d.remarks)} placeholder="What is wrong and what to upload" /></Field>
              )}
            </div>
          );
        })}
      </div>
      {mail && (
        <Modal title="Rejection e-mail (one mail for all rejected items)" onClose={() => setMail(null)}>
          <div className="space-y-3">
            <Field label="To" required><input value={mail.to} onChange={(e) => setMail({ ...mail, to: e.target.value })} className={inputCls()} /></Field>
            <Field label="CC" hint="Reporting manager / assigned employee for follow-up"><input data-field="mailCc" value={mail.cc} onChange={(e) => setMail({ ...mail, cc: e.target.value })} className={inputCls()} /></Field>
            <Field label="Subject"><input value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} className={inputCls()} /></Field>
            <Field label="Message"><textarea rows="12" value={mail.body} onChange={(e) => setMail({ ...mail, body: e.target.value })} className={cx(inputCls(), "font-mono text-xs")} /></Field>
            {mail.error && <Notice kind="error">{mail.error}</Notice>}
            <div className="flex justify-end gap-2"><Btn kind="secondary" onClick={() => setMail(null)}>Cancel</Btn><Btn kind="danger" onClick={sendMail} disabled={busy === "mail"}><FaEnvelope /> {busy === "mail" ? "Sending…" : "Send e-Mail"}</Btn></div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
