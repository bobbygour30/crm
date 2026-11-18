// src/components/dashboard/BrdDashboard.jsx — Admin Dashboard (TERM LOB & Dashboard BRD)
// Every number opens its report (drill-down) with an Excel export.
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { FaFileExcel, FaSyncAlt, FaTimes, FaExternalLinkAlt, FaFilter } from "react-icons/fa";
import Pagination, { usePagination } from "../lob/Pagination";
import {
  CATEGORY_LABEL, REPORT_COLUMNS, applyFilters, buildWorkbookAoa, computeDashboard, defaultFilters, describeFilters, displayCell,
  fileNameFor, filterOptions, fmtDate, money, monthLabel, searchRows, todayIst, totalsFor, addDays,
} from "./dashboardMetrics";

const API = import.meta.env.VITE_BACKEND_URL;
const LEAD_REPORTS = ["leads", "policies", "emi", "turnover", "payout", "mobile"];
const cx = (...c) => c.filter(Boolean).join(" ");
const inputCls = "w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none";

// open a lead from a report row (the lead page opens it once loaded)
const openLead = (row) => {
  try { window.sessionStorage.setItem("crm-open-lead", JSON.stringify({ id: row.id, origin: row.origin })); } catch { /* storage blocked */ }
  window.history.pushState({}, "", row.origin === "EmployeeLead" ? "/admin/employee-leads" : "/admin/leads");
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const fyStart = () => { const t = todayIst(); const y = Number(t.slice(0, 4)) - (Number(t.slice(5, 7)) < 4 ? 1 : 0); return `${y}-04-01`; };
const PRESETS = [
  ["Last 90 days", () => ({ from: addDays(todayIst(), -89), to: todayIst() })],
  ["This month", () => ({ from: `${todayIst().slice(0, 7)}-01`, to: todayIst() })],
  ["This financial year", () => ({ from: fyStart(), to: todayIst() })],
  ["All time", () => ({ from: "", to: "" })],
];

function Tile({ tile, big, tone = "indigo", onOpen }) {
  if (!tile) return null;
  const tones = { indigo: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50", emerald: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50", amber: "border-amber-200 hover:border-amber-400 hover:bg-amber-50", rose: "border-rose-200 hover:border-rose-400 hover:bg-rose-50", sky: "border-sky-200 hover:border-sky-400 hover:bg-sky-50" };
  const value = tile.kind === "money" ? money(tile.value) : tile.value.toLocaleString("en-IN");
  return (
    <button type="button" onClick={() => onOpen(tile)} data-tile={tile.key} title={tile.hint || "Open the report"}
      aria-label={`${tile.label}: ${value} — open the report`}
      className={cx("group text-left rounded-xl border bg-white transition-colors w-full cursor-pointer", tones[tone], big ? "p-4" : "p-3")}>
      <div className={cx("font-bold text-gray-800 tabular-nums", big ? "text-3xl" : "text-xl")}>{value}</div>
      <div className={cx("text-gray-600 mt-1 flex items-center gap-1", big ? "text-sm font-medium" : "text-xs")}>{tile.label}<FaExternalLinkAlt className="opacity-0 group-hover:opacity-60 h-2.5 w-2.5" /></div>
    </button>
  );
}

function Block({ title, big, children, tone, onOpen, note }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4" data-block={title}>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-3">
        {(Array.isArray(big) ? big : [big]).filter(Boolean).length > 1
          ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{big.map((b) => <Tile key={b.key} tile={b} big tone={tone} onOpen={onOpen} />)}</div>
          : <Tile tile={Array.isArray(big) ? big[0] : big} big tone={tone} onOpen={onOpen} />}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{children}</div>
        {note && <p className="text-xs text-gray-500">{note}</p>}
      </div>
    </div>
  );
}

function DrillDown({ tile, section, filtersText, onClose }) {
  const cols = REPORT_COLUMNS[tile.report];
  const [q, setQ] = useState("");
  const rows = useMemo(() => searchRows(tile.rows, cols, q), [tile, cols, q]);
  const pager = usePagination(rows, { resetKeys: [q] });
  const totals = totalsFor(cols, rows);
  const isLead = LEAD_REPORTS.includes(tile.report);
  const title = `${section} — ${tile.label}`;
  useEffect(() => { const esc = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", esc); return () => window.removeEventListener("keydown", esc); }, [onClose]);
  const exportExcel = () => {
    const aoa = buildWorkbookAoa({ title, filtersText, cols, rows });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 7 }, ...cols.map((col) => ({ wch: Math.min(40, Math.max(12, col.label.length + 2)) }))];
    ws["!merges"] = [0, 1, 2, 3].map((r) => ({ s: { r, c: 0 }, e: { r, c: Math.min(cols.length, 8) } }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, fileNameFor(title));
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={title} data-drilldown={tile.key}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[94vh] flex flex-col">
        <div className="p-4 border-b flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{filtersText}</p>
            <p className="text-sm mt-1"><b>{rows.length}</b> record(s){tile.kind === "money" && <> · Total <b>{money(tile.value)}</b></>}{tile.hint && <span className="text-gray-500"> · {tile.hint}</span>}</p>
          </div>
          <input aria-label="Search the report" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={cx(inputCls, "max-w-xs")} />
          <button type="button" onClick={exportExcel} disabled={!rows.length} className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"><FaFileExcel /> Export Excel</button>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 text-gray-400 hover:text-gray-700"><FaTimes /></button>
        </div>
        <div className="overflow-auto flex-1">
          {!rows.length ? <p className="p-6 text-sm text-gray-500">No records for these filters.</p> : (
            <table className="w-full text-xs" data-table="drilldown">
              <thead className="bg-gray-50 text-gray-500 sticky top-0"><tr>
                <th className="p-2 text-left">#</th>
                {cols.map((col) => <th key={col.key} className={cx("p-2 whitespace-nowrap", col.type === "money" || col.type === "number" ? "text-right" : "text-left")}>{col.label}</th>)}
                {isLead && <th className="p-2" />}
              </tr></thead>
              <tbody>
                {pager.pageItems.map((r, i) => (
                  <tr key={r.id || r.employeeCode || r.refId || i} className="border-t hover:bg-gray-50">
                    <td className="p-2 text-gray-400">{pager.from + i}</td>
                    {cols.map((col) => <td key={col.key} className={cx("p-2", col.type === "money" || col.type === "number" ? "text-right tabular-nums whitespace-nowrap" : "")}>{displayCell(col, r)}</td>)}
                    {isLead && <td className="p-2"><button type="button" onClick={() => { onClose(); openLead(r); }} className="text-indigo-600 underline whitespace-nowrap">Open</button></td>}
                  </tr>
                ))}
              </tbody>
              {Object.keys(totals).length > 0 && (
                <tfoot><tr className="border-t-2 bg-gray-50 font-semibold" data-totals>
                  <td className="p-2">Total</td>
                  {cols.map((col) => <td key={col.key} className="p-2 text-right tabular-nums whitespace-nowrap">{col.key in totals ? (col.type === "money" ? money(totals[col.key]) : totals[col.key]) : ""}</td>)}
                  {isLead && <td />}
                </tr></tfoot>
              )}
            </table>
          )}
        </div>
        {rows.length > 0 && <Pagination p={pager} label="records" />}
      </div>
    </div>
  );
}

export default function BrdDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [drill, setDrill] = useState(null); // { tile, section }
  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/dashboard`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || `Server error ${res.status}`);
      setData(d);
    } catch (e) { setError(e.message || "Could not load the dashboard"); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const opts = useMemo(() => filterOptions(data?.rows || []), [data]);
  const filtered = useMemo(() => applyFilters(data?.rows || [], filters), [data, filters]);
  const t = useMemo(() => computeDashboard(filtered, data || {}), [filtered, data]);
  const filtersText = describeFilters(filters);
  const set = (p) => setFilters((f) => ({ ...f, ...p }));
  const open = (section) => (tile) => setDrill({ tile, section });
  const cov = t._payoutCoverage || {};
  const sel = (label, key, options, render = (o) => o) => (
    <label className="text-xs font-medium text-gray-600">{label}
      <select aria-label={label} value={filters[key]} onChange={(e) => set({ [key]: e.target.value })} className={cx(inputCls, "mt-1")}>
        <option value="">All</option>{options.map((o) => <option key={o} value={o}>{render(o)}</option>)}
      </select>
    </label>
  );
  return (
    <div className="p-4 space-y-4" data-dashboard>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1 className="text-2xl font-bold text-gray-800">Dashboard</h1><p className="text-sm text-gray-500">Click any number to open its report · {data ? `Updated ${new Date(data.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}</p></div>
        <button type="button" onClick={load} disabled={loading} className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"><FaSyncAlt className={loading ? "animate-spin" : ""} /> {loading ? "Loading…" : "Refresh"}</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4" data-filters>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"><FaFilter className="text-indigo-500" /> Filter</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <label className="text-xs font-medium text-gray-600">Start Date<input type="date" aria-label="Start Date" value={filters.from} max={filters.to || undefined} onChange={(e) => set({ from: e.target.value })} className={cx(inputCls, "mt-1")} /></label>
          <label className="text-xs font-medium text-gray-600">End Date<input type="date" aria-label="End Date" value={filters.to} min={filters.from || undefined} onChange={(e) => set({ to: e.target.value })} className={cx(inputCls, "mt-1")} /></label>
          {sel("LOB", "category", opts.categories, (o) => CATEGORY_LABEL[o] || o)}
          {sel("Insurer", "insurer", opts.insurers)}
          {sel("Source of Business", "leadOf", opts.leadOf)}
          {sel("Booking Month (Payment Date)", "bookingMonth", opts.bookingMonths, monthLabel)}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          {PRESETS.map(([label, fn]) => <button key={label} type="button" onClick={() => set(fn())} className="px-2.5 py-1 rounded-full border border-gray-300 hover:bg-gray-50">{label}</button>)}
          <button type="button" onClick={() => setFilters(defaultFilters())} className="px-2.5 py-1 rounded-full text-indigo-700 underline">Reset</button>
          <span className="text-gray-500 ml-auto">{filtersText} · Date Range = lead created date</span>
        </div>
      </div>

      {error && <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm" role="alert">{error}</div>}
      {!data && !error && <p className="text-sm text-gray-500">Loading…</p>}
      {data && (
        <>
          <h2 className="text-lg font-semibold text-gray-700">Business</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Block title="Lead" big={t.leadsTotal} onOpen={open("Lead")}>
              <Tile tile={t.lead} onOpen={open("Lead")} /><Tile tile={t.quoteProcess} tone="sky" onOpen={open("Lead")} /><Tile tile={t.lost} tone="rose" onOpen={open("Lead")} /><Tile tile={t.converted} tone="emerald" onOpen={open("Lead")} />
            </Block>
            <Block title="Policy" big={t.policiesTotal} tone="emerald" onOpen={open("Policy")}>
              <Tile tile={t.active} tone="emerald" onOpen={open("Policy")} /><Tile tile={t.renewal} tone="amber" onOpen={open("Policy")} /><Tile tile={t.emi} tone="sky" onOpen={open("Policy")} /><Tile tile={t.expired} tone="rose" onOpen={open("Policy")} />
            </Block>
            <Block title="TurnOver" big={t.turnover} onOpen={open("TurnOver")} note="Issued policies in the filters.">
              <Tile tile={t.netPremium} onOpen={open("TurnOver")} /><Tile tile={t.gst} onOpen={open("TurnOver")} /><Tile tile={t.gross} onOpen={open("TurnOver")} />
            </Block>
            <Block title="PayOut (All LOB Except Mobile)" big={t.profit} tone="emerald" onOpen={open("PayOut (All LOB Except Mobile)")}
              note={cov.nonMobileTotal ? `PayOut figures from ${cov.nonMobile} of ${cov.nonMobileTotal} policies (the rest haven't reached Arshyan Profit yet).` : undefined}>
              <Tile tile={t.insurerPayout} onOpen={open("PayOut (All LOB Except Mobile)")} /><Tile tile={t.gstReturn} onOpen={open("PayOut (All LOB Except Mobile)")} /><Tile tile={t.tds} tone="rose" onOpen={open("PayOut (All LOB Except Mobile)")} /><Tile tile={t.cashback} tone="amber" onOpen={open("PayOut (All LOB Except Mobile)")} />
            </Block>
          </div>
          <Block title="PayOut (Mobile)" big={[t.mProfit, t.mChart]} tone="emerald" onOpen={open("PayOut (Mobile)")}
            note={cov.mobileTotal ? `PayOut figures from ${cov.mobile} of ${cov.mobileTotal} Mobile policies.` : undefined}>
            <Tile tile={t.mInsurerPayout} onOpen={open("PayOut (Mobile)")} /><Tile tile={t.mGstReturn} onOpen={open("PayOut (Mobile)")} /><Tile tile={t.mTds} tone="rose" onOpen={open("PayOut (Mobile)")} /><Tile tile={t.mCashback} tone="amber" onOpen={open("PayOut (Mobile)")} />
          </Block>

          <h2 className="text-lg font-semibold text-gray-700">Employee Records <span className="text-sm font-normal text-gray-500">— today, {fmtDate(data.today)}</span></h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Block title="Active Employees" big={t.empActiveTotal} onOpen={open("Employee Records")}
              note={data.sunday ? "Today is Sunday — a weekly off." : data.holiday ? `Today is a holiday (${data.holiday}).` : "Absent = not marked present and not on approved leave."}>
              <Tile tile={t.present} tone="emerald" onOpen={open("Employee Records")} /><Tile tile={t.onLeave} tone="amber" onOpen={open("Employee Records")} /><Tile tile={t.absent} tone="rose" onOpen={open("Employee Records")} />
            </Block>
            <Block title="Total Employees" big={t.empTotal} onOpen={open("Employee Records")}>
              <Tile tile={t.empActive} tone="emerald" onOpen={open("Employee Records")} /><Tile tile={t.onNotice} tone="amber" onOpen={open("Employee Records")} /><Tile tile={t.left} tone="rose" onOpen={open("Employee Records")} /><Tile tile={t.assets} onOpen={open("Employee Records")} /><Tile tile={t.onboarding} tone="sky" onOpen={open("Employee Records")} />
            </Block>
          </div>
        </>
      )}
      {drill && <DrillDown tile={drill.tile} section={drill.section} filtersText={drill.section === "Employee Records" ? `Employees as on ${fmtDate(data.today)}` : filtersText} onClose={() => setDrill(null)} />}
    </div>
  );
}