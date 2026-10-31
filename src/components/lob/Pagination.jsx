// src/components/lob/Pagination.jsx — client-side pagination for the lead tables
import { useEffect, useState } from "react";

export const PAGE_SIZES = [10, 25, 50, 100];

/**
 * @param items      the full (filtered) list
 * @param resetKeys  values that should send the user back to page 1 (search / filters) —
 *                   NOT the list itself, so editing a lead on page 3 keeps you on page 3
 */
export function usePagination(items, { pageSize: initial = 25, resetKeys = [] } = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initial);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => { setPage(1); }, resetKeys); // eslint-disable-line react-hooks/exhaustive-deps
  const current = Math.min(page, pages); // stays valid when the list shrinks (e.g. after a delete)
  return {
    page: current,
    setPage,
    pageSize,
    setPageSize: (n) => { setPageSizeState(n); setPage(1); },
    pages,
    total,
    from: total ? (current - 1) * pageSize + 1 : 0,
    to: Math.min(current * pageSize, total),
    pageItems: items.slice((current - 1) * pageSize, current * pageSize),
  };
}

/** 1 … 4 5 [6] 7 8 … 20 */
const pageList = (current, pages) => {
  const out = [];
  const add = (p) => { if (!out.includes(p)) out.push(p); };
  add(1);
  for (let p = Math.max(2, current - 2); p <= Math.min(pages - 1, current + 2); p++) add(p);
  if (pages > 1) add(pages);
  return out.reduce((acc, p, i) => { if (i && p - out[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, []);
};

export default function Pagination({ p, label = "leads" }) {
  if (!p.total) return null;
  const btn = "min-w-[2rem] h-8 px-2 rounded-md text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50" aria-label="Pagination" data-pagination>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span data-range>Showing <b>{p.from}</b>–<b>{p.to}</b> of <b>{p.total}</b> {label}</span>
        <label className="flex items-center gap-1 ml-2">
          <span className="hidden sm:inline">Rows</span>
          <select aria-label="Rows per page" value={p.pageSize} onChange={(e) => p.setPageSize(Number(e.target.value))} className="border border-gray-300 rounded-md px-1 py-1 text-sm bg-white">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      {p.pages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" className={`${btn} bg-white border-gray-300 hover:bg-gray-100`} disabled={p.page <= 1} onClick={() => p.setPage(p.page - 1)} aria-label="Previous page">‹ Prev</button>
          {pageList(p.page, p.pages).map((x, i) =>
            x === "…" ? <span key={`e${i}`} className="px-1 text-gray-400">…</span> : (
              <button key={x} type="button" aria-current={x === p.page ? "page" : undefined} onClick={() => p.setPage(x)}
                className={`${btn} ${x === p.page ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 hover:bg-gray-100"}`}>{x}</button>
            ))}
          <button type="button" className={`${btn} bg-white border-gray-300 hover:bg-gray-100`} disabled={p.page >= p.pages} onClick={() => p.setPage(p.page + 1)} aria-label="Next page">Next ›</button>
        </div>
      )}
    </nav>
  );
}