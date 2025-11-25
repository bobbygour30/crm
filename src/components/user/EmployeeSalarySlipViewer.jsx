// src/components/EmployeeSalarySlipViewer.jsx
import React, { useState } from "react";
import assets from "../../assets/assets";

const EmployeeSalarySlipViewer = () => {
  const [form, setForm] = useState({
    empCode: "",
    name: "",
    month: "",
  });

  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setNotFound(false);
    setSlip(null);
  };

  const fetchSalarySlip = async (e) => {
    e.preventDefault();

    if (!form.empCode || !form.name || !form.month) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);
    setSlip(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/salary/slips/public?empCode=${encodeURIComponent(
          form.empCode.trim()
        )}&name=${encodeURIComponent(form.name.trim())}&month=${encodeURIComponent(
          form.month.trim()
        )}`
      );

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true);
        } else {
          setError(result.msg || "Failed to fetch salary slip");
        }
        return;
      }

      setSlip(result.data); // We return { success: true, data: slip }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    n != null
      ? Number(n).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 mt-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-10">
          View Your Salary Slip
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <form onSubmit={fetchSalarySlip} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee Code
              </label>
              <input
                type="text"
                name="empCode"
                value={form.empCode}
                onChange={handleChange}
                placeholder="e.g., ARSYN-44715-01"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Bobby"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Salary Month
              </label>
              <input
                type="text"
                name="month"
                value={form.month}
                onChange={handleChange}
                placeholder="e.g., November 2025"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-3 text-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                }`}
              >
                {loading ? "Searching..." : "View Salary Slip"}
              </button>
            </div>
          </form>

          {error && <p className="text-red-600 text-center mt-6 font-medium">{error}</p>}
          {notFound && (
            <p className="text-orange-600 text-center mt-6 font-medium">
              No salary slip found for the given details.
            </p>
          )}
        </div>

        {/* Salary Slip Display */}
        {slip && slip.employee && (
          <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-2xl mt-12">
            {/* Header */}
            <div className="p-8 border-b-4 border-black flex justify-between items-start bg-gradient-to-b from-blue-50 to-white">
              <img
                src={assets?.logo || "/logo.png"}
                alt="Logo"
                className="h-20"
                onError={(e) => (e.target.src = "/logo.png")}
              />
              <div className="text-right">
                <h2 className="text-2xl font-bold text-blue-900">
                  Arshyan Insurance Marketing & Services Pvt. Ltd
                </h2>
                <p className="text-sm mt-2">Office No.212, 1st Floor, Block-G3</p>
                <p className="text-sm">Sector-16 Rohini, New Delhi-110089</p>
                <p className="text-sm">Tel: (+9111-43592951)</p>
              </div>
            </div>

            <div className="text-center py-6 text-900 text-2xl font-bold">
              Pay Slip for the month of {slip.salaryMonth}
            </div>

            {/* Employee Info Table */}
            <div className="px-8">
              <table className="w-full text-sm border-2 border-black mb-8">
                <tbody>
                  <tr>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Emp. Code:</td>
                    <td className="border border-black p-3">{slip.employee.empCode}</td>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Location:</td>
                    <td className="border border-black p-3">{slip.employee.location || "-"}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Name:</td>
                    <td className="border border-black p-3 font-semibold">{slip.employee.name}</td>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Division:</td>
                    <td className="border border-black p-3">{slip.employee.division || "-"}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Department:</td>
                    <td className="border border-black p-3">{slip.employee.department}</td>
                    <td className="border border-black p-3 bg-gray-200 font-bold">PAN:</td>
                    <td className="border border-black p-3">{slip.employee.pan || "-"}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Designation:</td>
                    <td className="border border-black p-3">{slip.employee.designation}</td>
                    <td className="border border-black p-3 bg-gray-200 font-bold">Bank A/c:</td>
                    <td className="border border-black p-3">{slip.employee.bankAcc || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Earnings & Deductions – FIXED: No 'eval' keyword */}
            <div className="px-8 pb-8">
              <table className="w-full text-sm border-2 border-black">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black p-3 text-left font-bold">Earnings</th>
                    <th className="border border-black p-3 text-right font-bold">Amount (₹)</th>
                    <th className="border border-black p-3 text-left font-bold">Deductions</th>
                    <th className="border border-black p-3 text-right font-bold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const earnings = Object.entries(slip.earnings || {});
                    const deductions = Object.entries(slip.deductions || {});
                    const maxRows = Math.max(earnings.length, deductions.length);

                    return Array.from({ length: maxRows }, (_, i) => {
                      const earning = earnings[i];
                      const deduction = deductions[i];

                      const earningKey = earning ? earning[0] : "";
                      const earningValue = earning ? earning[1] : null;
                      const deductionKey = deduction ? deduction[0] : "";
                      const deductionValue = deduction ? deduction[1] : null;

                      return (
                        <tr key={i}>
                          <td className="border border-black p-3">{earningKey}</td>
                          <td className="border border-black p-3 text-right">
                            {earningValue !== null ? fmt(earningValue) : ""}
                          </td>
                          <td className="border border-black p-3">{deductionKey}</td>
                          <td className="border border-black p-3 text-right">
                            {deductionValue !== null ? fmt(deductionValue) : ""}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                  <tr className="font-bold bg-gray-100">
                    <td className="border border-black p-3 text-right">Gross Pay</td>
                    <td className="border border-black p-3 text-right">₹ {fmt(slip.grossPay)}</td>
                    <td className="border border-black p-3 text-right">Total Deductions</td>
                    <td className="border border-black p-3 text-right">₹ {fmt(slip.totalDeductions)}</td>
                  </tr>
                  <tr className="font-bold text-xl bg-blue-900 text-white">
                    <td colSpan={2} className="border border-black p-4 text-right">
                      Net Salary: ₹ {fmt(slip.netPay)}
                    </td>
                    <td colSpan={2} className="border border-black p-4">
                      ({slip.numberInWords || "Rupees One Lakh Fifty Thousand Only"})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center py-6 text-gray-600 italic text-lg">
              This is a computer-generated payslip and does not require a signature.
            </div>

            {/* Download Button */}
            <div className="text-center pb-12">
              <a
                href={slip.pdfUrl}
                target="_blank"
                download={`Salary_Slip_${slip.employee.empCode}_${slip.salaryMonth}.pdf`}
                className="inline-block px-12 py-5 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-xl shadow-2xl shadow-2xl transition transform hover:scale-105"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalarySlipViewer;