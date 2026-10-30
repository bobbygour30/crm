// src/components/admin/BulkUploadModal.jsx
// Bulk Upload for the Lead table: LOB + Section decide the template; the filled sheet is
// checked in the browser first, then the valid rows are sent to /api/leads/bulk in batches.
import { useState } from "react";
import { FaTimes, FaDownload, FaUpload, FaCheckCircle, FaExclamationTriangle, FaFileExcel } from "react-icons/fa";
import { BULK_LOBS, BULK_SECTIONS, buildTemplate, parseUpload, columnsFor } from "../lob/bulkUpload";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const BATCH = 50;

export default function BulkUploadModal({ onClose, onUploaded }) {
  const [lob, setLob] = useState("Health");
  const [section, setSection] = useState("Lead");
  const [parsed, setParsed] = useState(null); // { rows, missingHeaders, unknownHeaders, fileName }
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const reset = () => { setParsed(null); setResult(null); setError(""); };
  const columns = columnsFor(lob, section);
  const valid = parsed ? parsed.rows.filter((r) => !r.errors.length) : [];
  const invalid = parsed ? parsed.rows.filter((r) => r.errors.length) : [];

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    reset();
    if (!/\.(xlsx|xls)$/i.test(file.name)) return setError("Please choose the .xlsx template file.");
    setBusy("check");
    try {
      const out = await parseUpload(file, lob, section);
      if (!out.rows.length) setError("The sheet has no data rows.");
      setParsed({ ...out, fileName: file.name });
    } catch (err) {
      setError("Could not read the file: " + err.message);
    } finally {
      setBusy("");
    }
  };

  const upload = async () => {
    setBusy("upload");
    setError("");
    const results = [];
    try {
      for (let i = 0; i < valid.length; i += BATCH) {
        const rows = valid.slice(i, i + BATCH).map((r) => ({ rowNo: r.rowNo, lead: r.lead }));
        const res = await fetch(`${API_BASE}/api/leads/bulk`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.results) results.push(...data.results);
        else throw new Error(data.error || `Server error ${res.status}`);
      }
    } catch (err) {
      setError(/failed to fetch/i.test(err.message) ? "Couldn't reach the server — check the connection and try again." : err.message);
    } finally {
      const created = results.filter((r) => r.ok).length;
      setResult({ created, failed: results.filter((r) => !r.ok), total: results.length });
      setBusy("");
      if (created) onUploaded && onUploaded(created);
    }
  };

  const sel = "w-full p-2 border border-gray-300 rounded-lg text-sm bg-white";
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Bulk upload">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><FaFileExcel className="text-green-600" /> Bulk Upload Leads</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bulk-lob" className="text-sm font-medium text-gray-700">LOB</label>
            <select id="bulk-lob" value={lob} onChange={(e) => { setLob(e.target.value); reset(); }} className={sel}>
              {BULK_LOBS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bulk-section" className="text-sm font-medium text-gray-700">Section</label>
            <select id="bulk-section" value={section} onChange={(e) => { setSection(e.target.value); reset(); }} className={sel}>
              {BULK_SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          The template has the <b>{BULK_SECTIONS.find((s) => s.key === section).label}</b> columns plus every section before it ({columns.length} columns
          {section === "Documents" ? "; documents are links, e.g. OneDrive share links" : ""}). Its “Instructions” sheet lists the allowed values.
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          <button type="button" onClick={() => buildTemplate(lob, section)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm">
            <FaDownload /> Download Template
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 text-sm">
            <FaUpload /> {busy === "check" ? "Checking…" : "Choose Filled File"}
            <input type="file" accept=".xlsx,.xls" onChange={onFile} className="hidden" aria-label="Filled template" disabled={!!busy} />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">{error}</p>}

        {parsed && !result && (
          <div className="mt-5 space-y-3" data-bulk="preview">
            <p className="text-sm text-gray-700"><b>{parsed.fileName}</b>: {parsed.rows.length} row(s) — <span className="text-green-700 font-medium">{valid.length} ready</span>{invalid.length ? <>, <span className="text-red-600 font-medium">{invalid.length} with problems</span></> : null}</p>
            {parsed.missingHeaders.length > 0 && (
              <p className="text-sm text-red-700">Missing required columns: {parsed.missingHeaders.join(", ")} — download the template for this LOB and Section.</p>
            )}
            {parsed.unknownHeaders.length > 0 && <p className="text-xs text-amber-700">Ignored columns (not in this template): {parsed.unknownHeaders.join(", ")}</p>}
            {invalid.length > 0 && (
              <div className="border border-red-200 rounded-lg max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {invalid.slice(0, 100).map((r) => (
                      <tr key={r.rowNo} className="border-b border-red-100 align-top">
                        <td className="p-2 font-medium text-red-700 w-16">Row {r.rowNo}</td>
                        <td className="p-2 text-red-700">{r.errors.join(" · ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">Clear</button>
              <button type="button" onClick={upload} disabled={!valid.length || !!busy || parsed.missingHeaders.length > 0} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center gap-2">
                <FaUpload /> {busy === "upload" ? "Uploading…" : `Upload ${valid.length} lead(s)`}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-5 space-y-2" data-bulk="result">
            <p className="text-sm flex items-center gap-2 text-green-700"><FaCheckCircle /> {result.created} lead(s) created.</p>
            {result.failed.length > 0 && (
              <>
                <p className="text-sm flex items-center gap-2 text-red-700"><FaExclamationTriangle /> {result.failed.length} row(s) not created:</p>
                <ul className="text-xs text-red-700 list-disc pl-6 max-h-40 overflow-y-auto">
                  {result.failed.map((r) => <li key={r.rowNo}>Row {r.rowNo}: {r.error}</li>)}
                </ul>
              </>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">Upload another file</button>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
