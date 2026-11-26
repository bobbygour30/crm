// src/components/access/AdminRightsGate.jsx — lets an Employee / CP with "Admin Rights" open the Admin panel
// (only the Admin modules assigned to them); everyone else goes back to their CRM.
import { Navigate } from "react-router-dom";
import { useMyAccess } from "./myAccess";

export default function AdminRightsGate({ children }) {
  const { ready, adminModules } = useMyAccess();
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  return adminModules.length ? children : <Navigate to="/" replace />;
}
