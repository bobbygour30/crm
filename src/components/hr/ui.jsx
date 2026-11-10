// src/components/hr/ui.jsx — small shared pieces for My HR screens
export const cx = (...c) => c.filter(Boolean).join(" ");
export const inputCls = (err, disabled) =>
  cx("w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none", err ? "border-red-500" : "border-gray-300", disabled ? "bg-gray-100 text-gray-600" : "bg-white");

export function Field({ label, required, error, hint, children, className }) {
  return (
    <div className={className}>
      {label && <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</label>}
      {children}
      {error ? <p className="text-red-500 text-xs mt-1">{error}</p> : hint ? <p className="text-gray-500 text-xs mt-1">{hint}</p> : null}
    </div>
  );
}

export function Btn({ kind = "primary", className, ...p }) {
  const k = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-indigo-300 text-indigo-700 hover:bg-indigo-50",
  }[kind];
  return <button type="button" {...p} className={cx("px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50", k, className)} />;
}

export function Card({ title, actions, children, className }) {
  return (
    <section className={cx("bg-white rounded-2xl shadow-sm border border-gray-100 p-4", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {title && <h3 className="text-base font-semibold text-gray-800">{title}</h3>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={cx("bg-white rounded-2xl shadow-xl w-full max-h-[92vh] overflow-y-auto p-5", wide ? "max-w-4xl" : "max-w-2xl")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Notice({ kind = "info", children }) {
  const k = { info: "bg-indigo-50 border-indigo-200 text-indigo-800", ok: "bg-emerald-50 border-emerald-200 text-emerald-800", error: "bg-red-50 border-red-200 text-red-700", warn: "bg-amber-50 border-amber-200 text-amber-800" }[kind];
  return <div className={cx("border rounded-lg p-3 text-sm", k)} role={kind === "error" ? "alert" : undefined}>{children}</div>;
}

export const STATUS_BADGE = {
  Draft: "bg-gray-100 text-gray-700", Sent: "bg-sky-100 text-sky-800", Submitted: "bg-indigo-100 text-indigo-800", "Under Review": "bg-amber-100 text-amber-800",
  "Rejected Items": "bg-red-100 text-red-700", Completed: "bg-emerald-100 text-emerald-800", Approved: "bg-emerald-100 text-emerald-800", Rejected: "bg-red-100 text-red-700",
  Pending: "bg-amber-100 text-amber-800", Active: "bg-emerald-100 text-emerald-800", Inactive: "bg-gray-200 text-gray-600",
};
export const Badge = ({ s }) => <span className={cx("px-2 py-0.5 rounded-full text-xs whitespace-nowrap", STATUS_BADGE[s] || "bg-gray-100 text-gray-700")}>{s}</span>;
