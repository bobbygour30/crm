// src/components/reports/PolicyReports.jsx
// ============================================================
// Reports tab (Admin) / Reports page (other users).
//   • Leads not yet converted to Quote
//   • Active Policies          — Motor / Health / PA / Mobile / Travel / Other
//   • Renewal Alert Policies   — Motor / Health / PA / Mobile / Travel / Other
//   • EMI Dues                 — Health / Life / ULIP / Other
//   • Expired Policies         — Motor / Health / PA / Mobile / Travel / Other
//   • All Policies             — for the Policy Status filter
// Filters: Date Range, Policy Type, Insurer, LOB, Source of Business (Lead Of), Policy Status.
// The server decides what each user sees: Admin = every lead + money columns;
// other users = only their own leads, without the admin-only columns.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaFileExcel, FaSyncAlt, FaFilter, FaUserClock, FaShieldAlt, FaBell, FaCalendarAlt, FaHourglassEnd, FaListUl, FaSearch,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const CATEGORIES = ["Motor", "Health", "PA", "Mobile", "Travel", "Other"];
const CATEGORY_LABEL = { Motor: "Motor Insurance", Health: "Health Insurance", PA: "PA", Mobile: "Mobile Insurance", Travel: "Travel Insurance", Other: "Other" };
const EMI_CATEGORIES = ["Health", "Life", "ULIP", "Other"];
const POLICY_TYPES = ["Fresh", "Renewal", "Portability"];
const POLICY_STATUSES = ["Active", "Renewed", "Expired", "Cancel", "Portability"];
const RENEWAL_WINDOWS = [7, 15, 30, 45, 60, 90];

const todayISO = () => new Date().toISOString().split("T")[0];
const addDaysISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};
const daysFromToday = (iso) => (iso ? Math.round((new Date(iso + "T00:00:00") - new Date(todayISO() + "T00:00:00")) / 86400000) : null);
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const money = (v) => (v || v === 0 ? `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—");
const cx = (...c) => c.filter(Boolean).join(" ");

// Which rows belong to which report, and which date the Date Range filter uses
const REPORTS = [
  { key: "leads", label: "Leads (Not Quoted)", icon: FaUserClock, dateField: "createdAt", dateLabel: "Lead created", groups: CATEGORIES, groupOf: (r) => r.category,
    match: (r) => !r.quoted && !r.issued && !r.cancelled },
  { key: "active", label: "Active Policies", icon: FaShieldAlt, dateField: "policyStartDate", dateLabel: "Policy start", groups: CATEGORIES, groupOf: (r) => r.category,
    match: (r) => r.policyStatus === "Active" },
  { key: "renewal", label: "Renewal Alerts", icon: FaBell, dateField: "policyExpiryDate", dateLabel: "Policy expiry", groups: CATEGORIES, groupOf: (r) => r.category,
    match: (r, ctx) => r.policyStatus === "Active" && r.policyExpiryDate && r.policyExpiryDate >= todayISO() && r.policyExpiryDate <= addDaysISO(ctx.window) },
  { key: "emi", label: "EMI Dues", icon: FaCalendarAlt, dateField: "nextDueDate", dateLabel: "Next EMI due", groups: EMI_CATEGORIES, groupOf: (r) => r.emiCategory,
    match: (r) => r.issued && r.instalment && r.emiPending > 0 && !r.cancelled },
  { key: "expired", label: "Expired Policies", icon: FaHourglassEnd, dateField: "policyExpiryDate", dateLabel: "Policy expiry", groups: CATEGORIES, groupOf: (r) => r.category,
    match: (r) => r.policyStatus === "Expired" },
  { key: "all", label: "All Policies", icon: FaListUl, dateField: "policyStartDate", dateLabel: "Policy start", groups: CATEGORIES, groupOf: (r) => r.category,
    match: (r) => r.issued || r.cancelled },
];

const statusBadge = (s) =>
  ({
    Active: "bg-emerald-100 text-emerald-800", Renewed: "bg-sky-100 text-sky-800", Expired: "bg-gray-200 text-gray-700",
    Cancel: "bg-red-100 text-red-700",
  }[s] || "bg-yellow-100 text-yellow-800");

const PAGE_SIZE = 50;

export default function PolicyReports() {
  const [rows, setRows] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState("leads");
  const [group, setGroup] = useState("All");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ from: "", to: "", policyType: "", insurer: "", lob: "", leadOf: "", policyStatus: "", search: "", window: 30 });
  const setFilter = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/reports`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.msg || `Server error ${res.status}`);
      setRows(data.rows || []);
      setRole(data.role || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const isAdmin = role === "admin";
  const def = REPORTS.find((r) => r.key === report);

  // filter options come from the data the user can see
  const options = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return { insurers: uniq(rows.map((r) => r.insurer)), lobs: uniq(rows.map((r) => r.lob)), leadOf: uniq(rows.map((r) => r.leadOf)) };
  }, [rows]);

  // rows after the filters (before the report / category split) — used for the counts too
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filters.policyType && r.policyType !== filters.policyType) return false;
      if (filters.insurer && r.insurer !== filters.insurer) return false;
      if (filters.lob && r.lob !== filters.lob) return false;
      if (filters.leadOf && r.leadOf !== filters.leadOf) return false;
      if (filters.policyStatus) {
        if (filters.policyStatus === "Portability" ? r.policyType !== "Portability" : r.policyStatus !== filters.policyStatus) return false;
      }
      if (q && ![r.name, r.mobileNo, r.leadCode, r.policyNumber, r.email].some((v) => String(v || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, filters]);

  const inDateRange = (r, d) => {
    const v = r[d.dateField];
    if (filters.from && (!v || v < filters.from)) return false;
    if (filters.to && (!v || v > filters.to)) return false;
    return true;
  };
  const reportRows = (d) => filtered.filter((r) => d.match(r, { window: Number(filters.window) }) && inDateRange(r, d));
  const counts = useMemo(() => Object.fromEntries(REPORTS.map((d) => [d.key, reportRows(d).length])), [filtered, filters.from, filters.to, filters.window]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = useMemo(() => {
    const list = reportRows(def);
    const sorted = [...list].sort((a, b) => {
      const k = def.dateField;
      if (report === "renewal" || report === "emi") return String(a[k] || "9999").localeCompare(String(b[k] || "9999")); // soonest first
      return String(b[k] || "").localeCompare(String(a[k] || "")); // newest first
    });
    return sorted;
  }, [def, filtered, filters.from, filters.to, filters.window]); // eslint-disable-line react-hooks/exhaustive-deps

  const groupCounts = useMemo(() => {
    const c = {};
    current.forEach((r) => { const g = def.groupOf(r); c[g] = (c[g] || 0) + 1; });
    return c;
  }, [current, def]);
  const visible = group === "All" ? current : current.filter((r) => def.groupOf(r) === group);
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ---- columns ----
  const columns = [
    { key: "leadCode", label: "Lead Code" },
    { key: "name", label: "Customer" },
    { key: "mobileNo", label: "Mobile" },
    { key: "lob", label: "LOB" },
    ...(report === "leads"
      ? [{ key: "stage", label: "Stage", render: (r) => (r.stage === "Lead" ? "Lead" : "Quote (not requested)") }, { key: "createdAt", label: "Created", render: (r) => fmtDate(r.createdAt) }]
      : [
          { key: "insurer", label: "Insurer" },
          { key: "policyNumber", label: "Policy No." },
          { key: "policyType", label: "Policy Type" },
          { key: "policyStatus", label: "Status", render: (r) => <span className={cx("px-2 py-0.5 rounded-full text-xs", statusBadge(r.policyStatus))}>{r.policyStatus || r.status}</span> },
          { key: "policyStartDate", label: "Start", render: (r) => fmtDate(r.policyStartDate) },
          { key: "policyExpiryDate", label: "Expiry", render: (r) => fmtDate(r.policyExpiryDate) },
        ]),
    ...(report === "renewal" ? [{ key: "daysLeft", label: "Days Left", render: (r) => { const d = daysFromToday(r.policyExpiryDate); return <span className={cx("font-medium", d <= 7 ? "text-red-600" : d <= 15 ? "text-orange-600" : "text-gray-700")}>{d}</span>; } }] : []),
    ...(report === "expired" ? [{ key: "daysAgo", label: "Expired (days ago)", render: (r) => Math.abs(daysFromToday(r.policyExpiryDate) || 0) }] : []),
    ...(report === "emi"
      ? [
          { key: "paymentTerm", label: "Paying Term" },
          { key: "emi", label: "EMIs Paid", render: (r) => `${r.emiReceived} / ${r.emiTotal}` },
          { key: "nextDueDate", label: "Next Due", render: (r) => { const d = daysFromToday(r.nextDueDate); return <span className={cx(d !== null && d < 0 && "text-red-600 font-medium")}>{fmtDate(r.nextDueDate)}{d !== null && d < 0 ? " (overdue)" : ""}</span>; } },
        ]
      : []),
    ...(report !== "leads" ? [{ key: "grossPremium", label: "Gross Premium", render: (r) => money(r.grossPremium) }] : []),
    ...(isAdmin && report !== "leads" ? [{ key: "netPremium", label: "Net Premium", render: (r) => money(r.netPremium) }, { key: "arshyanProfit", label: "Arshyan Profit", render: (r) => money(r.arshyanProfit) }] : []),
    { key: "leadOf", label: "Lead Of", render: (r) => [r.leadOf, r.source && r.source !== r.leadOf ? r.source : ""].filter(Boolean).join(" · ") || "—" },
  ];

  const exportExcel = () => {
    const plain = (r, c) => {
      if (c.key === "emi") return `${r.emiReceived} / ${r.emiTotal}`;
      if (c.key === "daysLeft") return daysFromToday(r.policyExpiryDate);
      if (c.key === "daysAgo") return Math.abs(daysFromToday(r.policyExpiryDate) || 0);
      if (c.key === "stage") return r.stage;
      if (c.key === "policyStatus") return r.policyStatus || r.status;
      if (c.key === "leadOf") return [r.leadOf, r.source].filter(Boolean).join(" · ");
      return r[c.key] ?? "";
    };
    const data = visible.map((r) => Object.fromEntries([["Category", def.groupOf(r)], ...columns.map((c) => [c.label, plain(r, c)])]));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, def.label.slice(0, 30));
    XLSX.writeFile(wb, `${def.key}_report_${group === "All" ? "all" : group.toLowerCase()}_${todayISO()}.xlsx`);
  };

  const filtersActive = Object.entries(filters).some(([k, v]) => k !== "window" && v);
  const sel = "w-full p-2 border border-gray-300 rounded-lg text-sm bg-white";

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">{isAdmin ? "All leads and policies" : "Your leads and policies"}{rows.length ? ` · ${rows.length} records` : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-2"><FaSyncAlt /> Refresh</button>
          <button onClick={exportExcel} disabled={!visible.length} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-2"><FaFileExcel /> Export Excel</button>
        </div>
      </div>

      {/* report tabs with counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="tablist" aria-label="Report">
        {REPORTS.map((d) => {
          const Icon = d.icon;
          const on = d.key === report;
          return (
            <button
              key={d.key} role="tab" aria-selected={on} onClick={() => { setReport(d.key); setGroup("All"); setPage(1); }}
              className={cx("text-left p-3 rounded-xl border transition-colors", on ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 hover:border-indigo-300")}
            >
              <div className="flex items-center gap-2 text-xs font-medium"><Icon /> {d.label}</div>
              <div className={cx("text-2xl font-bold mt-1", on ? "text-white" : "text-gray-800")}>{loading ? "…" : counts[d.key]}</div>
            </button>
          );
        })}
      </div>

      {/* filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
          <FaFilter className="text-indigo-600" /> Filters
          {filtersActive && (
            <button onClick={() => setFilter({ from: "", to: "", policyType: "", insurer: "", lob: "", leadOf: "", policyStatus: "", search: "" })} className="ml-auto text-xs text-red-600 hover:text-red-800">Clear filters</button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Date Range — {def.dateLabel}</label>
            <div className="flex gap-2">
              <input type="date" aria-label="From date" value={filters.from} onChange={(e) => setFilter({ from: e.target.value })} className={sel} />
              <input type="date" aria-label="To date" value={filters.to} onChange={(e) => setFilter({ to: e.target.value })} className={sel} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Policy Type</label>
            <select value={filters.policyType} onChange={(e) => setFilter({ policyType: e.target.value })} className={sel}>
              <option value="">All</option>
              {POLICY_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Insurer</label>
            <select value={filters.insurer} onChange={(e) => setFilter({ insurer: e.target.value })} className={sel}>
              <option value="">All</option>
              {options.insurers.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">LOB</label>
            <select value={filters.lob} onChange={(e) => setFilter({ lob: e.target.value })} className={sel}>
              <option value="">All</option>
              {options.lobs.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Source of Business (Lead Of)</label>
            <select value={filters.leadOf} onChange={(e) => setFilter({ leadOf: e.target.value })} className={sel}>
              <option value="">All</option>
              {options.leadOf.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Policy Status</label>
            <select value={filters.policyStatus} onChange={(e) => setFilter({ policyStatus: e.target.value })} className={sel}>
              <option value="">All</option>
              {POLICY_STATUSES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {report === "renewal" && (
            <div>
              <label className="text-xs font-medium text-gray-600">Renewal Window</label>
              <select value={filters.window} onChange={(e) => setFilter({ window: e.target.value })} className={sel}>
                {RENEWAL_WINDOWS.map((n) => <option key={n} value={n}>Expiring in next {n} days</option>)}
              </select>
            </div>
          )}
          <div className={report === "renewal" ? "" : "lg:col-span-2"}>
            <label className="text-xs font-medium text-gray-600">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input type="text" value={filters.search} onChange={(e) => setFilter({ search: e.target.value })} placeholder="Name, mobile, lead code, policy no." className={`${sel} pl-8`} />
            </div>
          </div>
        </div>
      </div>

      {/* category breakdown */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category">
        {["All", ...def.groups].map((g) => {
          const n = g === "All" ? current.length : groupCounts[g] || 0;
          const on = g === group;
          return (
            <button
              key={g} role="tab" aria-selected={on} onClick={() => { setGroup(g); setPage(1); }}
              className={cx("px-3 py-1.5 rounded-full border text-sm", on ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300")}
            >
              {g === "All" ? "All" : report === "emi" ? g : CATEGORY_LABEL[g]} <span className="ml-1 text-xs text-gray-500">({n})</span>
            </button>
          );
        })}
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-6 text-sm text-red-700 bg-red-50">Could not load the report: {error}</div>
        ) : loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading report…</div>
        ) : !visible.length ? (
          <div className="p-8 text-center text-gray-500 text-sm">No records for this report{filtersActive ? " with these filters" : ""}.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-600">
                  <tr>{columns.map((c) => <th key={c.key} className="px-3 py-2 whitespace-nowrap">{c.label}</th>)}</tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={`${r.origin}-${r.id}`} className="border-t hover:bg-gray-50">
                      {columns.map((c) => (
                        <td key={c.key} className="px-3 py-2 whitespace-nowrap">{c.render ? c.render(r) : r[c.key] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-gray-600">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 border rounded disabled:opacity-40">Previous</button>
                <span className="px-2 py-1">Page {page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 border rounded disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
      {!isAdmin && role && <p className="text-xs text-gray-500">You see the leads you created or were assigned, with the details you can fill.</p>}
    </div>
  );
}
