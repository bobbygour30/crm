import React, { useState, useEffect } from "react";

const EmployeeSalarySlipViewer = () => {
  const [form, setForm] = useState({
    month: "",
    year: "",
  });

  const [slipData, setSlipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const fetchEmployeeDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingEmployee(false);
      setError("Please login to view your salary slips");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/salary/employee/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEmployeeInfo(data);
      } else {
        const error = await res.json();
        setError(error.msg || "Failed to fetch employee details");
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setNotFound(false);
    setSlipData(null);
  };

  const fetchSalarySlip = async (e) => {
    e.preventDefault();

    if (!form.month || !form.year) {
      setError("Please select both month and year");
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);
    setSlipData(null);

    const monthYearString = `${form.month} ${form.year}`;
    const token = localStorage.getItem("token");

    try {
      // Use the existing salary route that has the data
      const res = await fetch(
        `${API_BASE}/api/salary/slips/public/employee?month=${encodeURIComponent(monthYearString)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

      setSlipData(result.data);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  if (loadingEmployee) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 mt-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-600">Loading employee information...</p>
        </div>
      </div>
    );
  }

  if (error && !employeeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 mt-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 mt-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-10">
          View Your Salary Slip
        </h1>

        {employeeInfo && (
          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Employee Code</p>
                <p className="font-semibold text-lg text-blue-900">{employeeInfo.empCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-lg text-blue-900">{employeeInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="text-gray-700">{employeeInfo.designation || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-gray-700">{employeeInfo.department || "-"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <form onSubmit={fetchSalarySlip} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Month
              </label>
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              >
                <option value="">-- Select Month --</option>
                {monthsList.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Year
              </label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              >
                <option value="">-- Select Year --</option>
                {yearsList.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                }`}
              >
                {loading ? "Searching..." : "Search Salary Slip"}
              </button>
            </div>
          </form>

          {error && <p className="text-red-600 text-center mt-6 font-medium">{error}</p>}
          {notFound && (
            <p className="text-orange-600 text-center mt-6 font-medium">
              No salary slip found for {form.month} {form.year}.
            </p>
          )}
        </div>

        {slipData && slipData.pdfUrl && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Salary Slip Found!
              </h3>
              <p className="text-gray-600 mb-6">
                Salary slip for {slipData.salaryMonth} is available
              </p>
              <button
                onClick={() => handleViewPDF(slipData.pdfUrl)}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Salary Slip PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalarySlipViewer;  