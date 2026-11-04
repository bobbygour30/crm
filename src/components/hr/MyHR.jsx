// src/components/hr/MyHR.jsx — My HR (Admin / HR). The sidebar sub-menu picks the section.
import { useEffect, useState } from "react";
import { hrApi } from "./hrApi";
import { Notice } from "./ui";
import OfferLetters from "./OfferLetters";
import DocumentValidation from "./DocumentValidation";
import Employees from "./Employees";
import HrAttendance from "./HrAttendance";
import { SalaryRegister, SalarySlips } from "./SalaryRegister";
<<<<<<< HEAD
import { Assets, Confirmations, Exits, Relieving, PromotionHike, HrDocuments, ManagerInbox } from "./HrPhase2";
=======
import Promotions from "./Promotions";
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
import HrSettings from "./HrSettings";

export const HR_SECTIONS = [
  ["offers", "Offer Letters"], ["validation", "Document Validation"], ["employees", "Employees"], ["attendance", "HR Attendance"],
<<<<<<< HEAD
  ["salary", "Salary Register"], ["slips", "HR Salary Slip"], ["promotions", "Promotion & Hike"], ["assets", "Assets"], ["confirmation", "Confirmation Letter"],
  ["exits", "Employee Exit"], ["relieving", "Relieving Letter"], ["documents", "Documents"], ["settings", "Settings"],
=======
  ["salary", "Salary Register"], ["slips", "HR Salary Slip"], ["promotions", "Promotions"], ["settings", "Settings"],
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
];

export default function MyHR({ section = "offers" }) {
  const [masters, setMasters] = useState({});
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const loadMasters = () => hrApi("/masters").then(setMasters).catch((e) => setError(e.message));
  useEffect(() => {
    loadMasters();
    hrApi("/settings").then(setSettings).catch((e) => setError(e.message));
  }, []);
  const title = (HR_SECTIONS.find(([k]) => k === section) || HR_SECTIONS[0])[1];
  const common = { masters, setMasters, settings };
  return (
    <div className="p-4 space-y-4" data-hr-section={section}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My HR</h1>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {!settings ? <p className="text-sm text-gray-500">Loading…</p> : (
        <>
          {section === "offers" && <OfferLetters {...common} />}
          {section === "validation" && <DocumentValidation onEmployeeCreated={() => setReloadKey((k) => k + 1)} />}
          {section === "employees" && <Employees settings={settings} reloadKey={reloadKey} />}
          {section === "attendance" && <HrAttendance />}
          {section === "salary" && <SalaryRegister />}
          {section === "slips" && <SalarySlips />}
<<<<<<< HEAD
          {section === "promotions" && <><ManagerInbox /><PromotionHike {...common} /></>}
          {section === "assets" && <Assets {...common} />}
          {section === "confirmation" && <Confirmations />}
          {section === "exits" && <Exits />}
          {section === "relieving" && <Relieving />}
          {section === "documents" && <HrDocuments />}
=======
          {section === "promotions" && <Promotions {...common} />}
>>>>>>> 5d13cd44b411a586f5e28353e0498f39984a697e
          {section === "settings" && <HrSettings settings={settings} setSettings={setSettings} reloadMasters={loadMasters} />}
        </>
      )}
    </div>
  );
}
