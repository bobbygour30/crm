// src/components/access/RightsArea.jsx — "Admin Rights" inside an Employee / CP's own CRM (/rights/<module>)
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminApp from "../admin/AdminApp";
import { useMyAccess, moduleRoot, ADMIN_LABELS } from "./myAccess";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function RightsArea({ handleLogout }) {
  const { ready, adminModules } = useMyAccess();
  const location = useLocation();
  const navigate = useNavigate();
  if (!ready) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!adminModules.length) return <Navigate to="/" replace />;
  const tab = decodeURIComponent(location.pathname.replace(/^\/rights\/?/, ""));
  if (!adminModules.includes(tab)) return <Navigate to={`/rights/${adminModules[0]}`} replace />; // one redirect to a valid module, no loop
  const roots = [...new Set(adminModules.map(moduleRoot))];
  const root = moduleRoot(tab);
  const subs = adminModules.filter((k) => moduleRoot(k) === root && k !== root);
  const go = (k) => navigate(`/rights/${k}`);
  return (
    <div className="p-4 space-y-3" data-rights-area>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gray-700 mr-2">Admin Rights</span>
        {roots.map((r) => (
          <button key={r} type="button" onClick={() => go(adminModules.find((k) => moduleRoot(k) === r))} data-rights-tab={r}
            className={cx("px-3 py-1.5 rounded-full text-sm border cursor-pointer", r === root ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50")}>
            {ADMIN_LABELS[r] || r}
          </button>
        ))}
      </div>
      {subs.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b pb-2" data-rights-subtabs>
          {subs.map((k) => (
            <button key={k} type="button" onClick={() => go(k)} data-rights-sub={k}
              className={cx("px-3 py-1 rounded text-xs cursor-pointer", k === tab ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50")}>{ADMIN_LABELS[k] || k}</button>
          ))}
        </div>
      )}
      <AdminApp embedded embeddedTab={tab} handleLogout={handleLogout} />
    </div>
  );
}
