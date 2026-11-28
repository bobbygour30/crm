// src/components/access/AdminRightsGate.jsx — an Employee / CP opening /admin goes to Admin Rights inside their own CRM
import { Navigate } from "react-router-dom";
import { useMyAccess } from "./myAccess";

export default function AdminRightsGate() {
  const { ready, adminModules } = useMyAccess();
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  return <Navigate to={adminModules.length ? "/rights" : "/"} replace />;
}
