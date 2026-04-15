import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import assets from "../../assets/assets";

// Default earnings structure
const defaultEarnings = {
  Basic: 0,
  Incentive: 0,
  "Allowance HRA": 0,
  "Allowance Medical": 0,
  "Other Allowances": 0,
};

const defaultDeductions = {
  "PF (Employee Contribution)": 0,
  "Tax Deducted at Source": 0,
};

const monthsList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SalarySlipGenerator = () => {
  const slipRef = useRef();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Employee form with all earning fields (MANUAL AMOUNTS)
  const [employeeForm, setEmployeeForm] = useState({
    empCode: "",
    name: "",
    department: "Sales & Marketing",
    designation: "Executive-Sales & Marketing",
    mop: "Bank Transfer",
    doj: "",
    bankAcc: "",
    location: "Delhi Office",
    division: "Delhi Region",
    pan: "",
    bankName: "",
    dob: "",
    uan: "",
    basicSalary: "",
    incentiveAmount: 0,
    hraAmount: 0,
    medicalAllowance: 1500,
    otherAllowancesAmount: 0,
    pfAmount: 0,
    tdsAmount: 0,
  });

  const [salarySlips, setSalarySlips] = useState([]);

  // Month and Year selection state
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(
    monthsList[new Date().getMonth()],
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Filter states for salary slips table
  const [filterEmployeeName, setFilterEmployeeName] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Generate years array (10 years back and 10 years forward)
  const generateYears = () => {
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };
  const yearsList = generateYears();

  // Get current month and year as string
  const getSalaryMonthString = () => {
    return `${selectedMonth} ${selectedYear}`;
  };

  const [payableDays, setPayableDays] = useState(30);
  const [earnings, setEarnings] = useState(defaultEarnings);
  const [deductions, setDeductions] = useState(defaultDeductions);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // Total days in month - for display only
  const getTotalDaysInMonth = () => {
    const monthIndex = monthsList.indexOf(selectedMonth);
    return new Date(selectedYear, monthIndex + 1, 0).getDate();
  };

  const totalDaysInMonth = getTotalDaysInMonth();

  // Calculate per day salary based on 30 days (fixed)
  const perDaySalary = employeeForm.basicSalary
    ? Number(employeeForm.basicSalary) / 30
    : 0;

  // Calculate earnings based on employee settings and payable days (using fixed 30 days as base)
  useEffect(() => {
    if (!employeeForm.basicSalary || employeeForm.basicSalary <= 0) {
      setEarnings({
        Basic: 0,
        Incentive: 0,
        "Allowance HRA": 0,
        "Allowance Medical": 0,
        "Other Allowances": 0,
      });
      setDeductions({
        "PF (Employee Contribution)": 0,
        "Tax Deducted at Source": 0,
      });
      return;
    }

    const monthlyBasic = Number(employeeForm.basicSalary);
    const prorataFactor = payableDays / 30;

    const newEarnings = {
      Basic: (monthlyBasic / 30) * payableDays,
      Incentive: Number(employeeForm.incentiveAmount) * prorataFactor,
      "Allowance HRA": Number(employeeForm.hraAmount) * prorataFactor,
      "Allowance Medical":
        Number(employeeForm.medicalAllowance) * prorataFactor,
      "Other Allowances":
        Number(employeeForm.otherAllowancesAmount) * prorataFactor,
    };

    setEarnings(newEarnings);

    setDeductions({
      "PF (Employee Contribution)":
        Number(employeeForm.pfAmount) * prorataFactor,
      "Tax Deducted at Source": Number(employeeForm.tdsAmount) * prorataFactor,
    });
  }, [
    employeeForm.basicSalary,
    employeeForm.incentiveAmount,
    employeeForm.hraAmount,
    employeeForm.medicalAllowance,
    employeeForm.otherAllowancesAmount,
    employeeForm.pfAmount,
    employeeForm.tdsAmount,
    payableDays,
  ]);

  useEffect(() => {
    fetchEmployees();
    fetchSalarySlips();
  }, []);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/salary/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error("fetchEmployees error", e);
    }
  };

  const fetchSalarySlips = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/salary/slips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSalarySlips(await res.json());
    } catch (e) {
      console.error("fetchSalarySlips error", e);
    }
  };

  // Search employees by name or empCode
  const searchEmployees = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE}/api/salary/employees/search?q=${encodeURIComponent(searchText)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowSearchDropdown(data.length > 0);
      }
    } catch (e) {
      console.error("Search error:", e);
    }
  };

  // Replace the selectEmployee function
  const selectEmployee = (emp) => {
    setEmployeeForm({
      empCode: emp.empCode,
      name: emp.name,
      department: emp.department || "Sales & Marketing",
      designation: emp.designation || "Executive-Sales & Marketing",
      mop: emp.mop || "Bank Transfer",
      doj: emp.doj || "",
      bankAcc: emp.bankAcc || "",
      location: emp.location || "Delhi Office",
      division: emp.division || "Delhi Region",
      pan: emp.pan || "",
      bankName: emp.bankName || "",
      dob: emp.dob || "",
      uan: emp.uan || "",
      basicSalary: emp.basicSalary || "",
      incentiveAmount: emp.incentiveAmount || 0,
      hraAmount: emp.hraAmount || 0,
      medicalAllowance: emp.medicalAllowance || 1500,
      otherAllowancesAmount: emp.otherAllowancesAmount || 0,
      pfAmount: emp.pfAmount || 0,
      tdsAmount: emp.tdsAmount || 0,
    });
    // Store the employee ID for update
    setSelectedEmployeeId(emp._id);
    setEditingIndex(-1); // Use -1 to indicate we're editing a searched employee
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Add this new state
  const onEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((s) => ({ ...s, [name]: value }));
  };

  const addOrUpdateEmployee = async () => {
  if (!employeeForm.name) return alert("Name is required");
  if (!employeeForm.empCode) return alert("Employee Code is required");
  if (!employeeForm.basicSalary || employeeForm.basicSalary <= 0)
    return alert("Basic Salary is required");

  const token = localStorage.getItem("token");

  // First, check if an employee with this empCode already exists
  try {
    // Try to find existing employee by empCode
    const checkRes = await fetch(
      `${API_BASE}/api/salary/employees/check?empCode=${encodeURIComponent(employeeForm.empCode)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (checkRes.ok) {
      const existingEmp = await checkRes.json();
      if (existingEmp && existingEmp._id) {
        // Update existing employee instead of creating new
        const payload = {
          name: employeeForm.name,
          department: employeeForm.department,
          designation: employeeForm.designation,
          mop: employeeForm.mop,
          doj: employeeForm.doj,
          bankAcc: employeeForm.bankAcc,
          location: employeeForm.location,
          division: employeeForm.division,
          pan: employeeForm.pan,
          bankName: employeeForm.bankName,
          dob: employeeForm.dob,
          uan: employeeForm.uan,
          basicSalary: employeeForm.basicSalary,
          incentiveAmount: employeeForm.incentiveAmount,
          hraAmount: employeeForm.hraAmount,
          medicalAllowance: employeeForm.medicalAllowance,
          otherAllowancesAmount: employeeForm.otherAllowancesAmount,
          pfAmount: employeeForm.pfAmount,
          tdsAmount: employeeForm.tdsAmount,
        };

        const updateRes = await fetch(
          `${API_BASE}/api/salary/employees/${existingEmp._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (updateRes.ok) {
          await fetchEmployees();
          setEditingIndex(null);
          setSelectedEmployeeId(null);
          alert("Employee updated successfully!");
        } else {
          throw new Error("Update failed");
        }
        return;
      }
    }
  } catch (err) {
    console.log("No existing employee found, creating new one");
  }

  // If no existing employee found, create new
  const payload = { ...employeeForm };

  if (!payload.empCode || !payload.empCode.startsWith("ARSYN-44715-")) {
    delete payload.empCode;
  }

  try {
    const res = await fetch(`${API_BASE}/api/salary/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || "Failed to save employee");
    }

    await fetchEmployees();
    alert("Employee added successfully!");
  } catch (e) {
    alert(e.message || "Save failed");
  }
};

  const editEmployee = (idx) => {
    const emp = employees[idx];
    setEmployeeForm({
      empCode: emp.empCode, // Preserve original empCode
      name: emp.name,
      department: emp.department || "Sales & Marketing",
      designation: emp.designation || "Executive-Sales & Marketing",
      mop: emp.mop || "Bank Transfer",
      doj: emp.doj || "",
      bankAcc: emp.bankAcc || "",
      location: emp.location || "Delhi Office",
      division: emp.division || "Delhi Region",
      pan: emp.pan || "",
      bankName: emp.bankName || "",
      dob: emp.dob || "",
      uan: emp.uan || "",
      basicSalary: emp.basicSalary || "",
      incentiveAmount: emp.incentiveAmount || 0,
      hraAmount: emp.hraAmount || 0,
      medicalAllowance: emp.medicalAllowance || 1500,
      otherAllowancesAmount: emp.otherAllowancesAmount || 0,
      pfAmount: emp.pfAmount || 0,
      tdsAmount: emp.tdsAmount || 0,
    });
    setEditingIndex(idx);
  };

  const deleteEmployee = async (id) => {
    if (!confirm("Delete this employee?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/salary/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchEmployees();
    } catch (e) {
      alert("Delete failed");
    }
  };

  // === EARNINGS / DEDUCTIONS MANUAL OVERRIDE ===
  const setEarningValue = (key, value) => {
    setEarnings((s) => ({ ...s, [key]: parseFloat(value) || 0 }));
  };
  const setDeductionValue = (key, value) => {
    setDeductions((s) => ({ ...s, [key]: parseFloat(value) || 0 }));
  };

  const grossPay = Object.values(earnings).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );
  const totalDeductions = Object.values(deductions).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );
  const netPay = grossPay - totalDeductions;

  const fmt = (n) =>
    n != null
      ? n.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      : "0.00";

  const numberToWords = (num) => {
    if (isNaN(num)) return "";
    const n = Math.abs(Number(num.toFixed(2)));
    const paise = Math.round((n - Math.trunc(n)) * 100);
    const intPart = Math.trunc(n);
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const inWords = (num) => {
      if (num === 0) return "Zero";
      if (num < 20) return a[num];
      if (num < 100)
        return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
      if (num < 1000)
        return (
          a[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 ? " " + inWords(num % 100) : "")
        );
      if (num < 100000)
        return (
          inWords(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 ? " " + inWords(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          inWords(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 ? " " + inWords(num % 100000) : "")
        );
      return (
        inWords(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 ? " " + inWords(num % 10000000) : "")
      );
    };
    let words = "Rupees " + inWords(intPart) + (intPart === 0 ? "" : "");
    if (paise > 0) words += " and " + inWords(paise) + " Paise";
    words += " Only.";
    return words;
  };

  // === GENERATE & SAVE PDF ===
  const generatePDF = async () => {
    if (!employeeForm.name) return alert("Select or add an employee first");
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 900,
        height: 1200,
      });
      const imgData = canvas.toDataURL("image/png");
      const salaryMonthString = getSalaryMonthString();
      const slipData = {
        employee: employeeForm,
        salaryMonth: salaryMonthString,
        earnings,
        deductions,
        grossPay,
        totalDeductions,
        netPay,
        numberInWords: numberToWords(netPay),
        payableDays,
        totalDaysInMonth: 30,
      };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/salary/slips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ html: imgData, slipData }),
      });
      if (!res.ok) throw new Error("Server error");

      alert("Salary slip saved successfully!");
      fetchSalarySlips();

      const data = await res.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // === DELETE SLIP ===
  const handleDeleteSlip = async (id) => {
    if (!confirm("Delete this salary slip?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/salary/slips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchSalarySlips();
    } catch (e) {
      alert("Delete failed");
    }
  };

  // Filtered salary slips based on search criteria
  const filteredSalarySlips = salarySlips.filter((slip) => {
    const matchesName =
      slip.employee?.name
        ?.toLowerCase()
        .includes(filterEmployeeName.toLowerCase()) || !filterEmployeeName;
    const matchesMonth =
      !filterMonth ||
      (slip.salaryMonth && slip.salaryMonth.includes(filterMonth));
    const matchesYear =
      !filterYear ||
      (slip.salaryMonth && slip.salaryMonth.includes(filterYear.toString()));
    return matchesName && matchesMonth && matchesYear;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilterEmployeeName("");
    setFilterMonth("");
    setFilterYear("");
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f7fafc] min-h-screen box-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#1a202c]">
          Salary Slip Generator
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Form */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2 text-[#1a202c]">
              Employee (Search & Select)
            </h3>

            {/* Search Existing Employee */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Existing Employee
              </label>
              <input
                type="text"
                placeholder="Type employee name or code to search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchEmployees(e.target.value);
                }}
                className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
              />
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((emp) => (
                    <div
                      key={emp._id}
                      onClick={() => selectEmployee(emp)}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                    >
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-xs text-gray-500">
                        Code: {emp.empCode} | Dept: {emp.department}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center text-gray-400 text-sm my-2">- OR -</div>

            <h4 className="font-semibold mb-2 text-[#1a202c]">
              Add/Edit Employee Manually
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="empCode"
                  value={employeeForm.empCode}
                  onChange={onEmployeeChange}
                  placeholder="Emp Code (e.g. ARSYN-44715-01)"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm font-bold text-blue-600"
                  readOnly={
                    editingIndex !== null || selectedEmployeeId !== null
                  }
                />
                <input
                  name="name"
                  value={employeeForm.name}
                  onChange={onEmployeeChange}
                  placeholder="Name"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="department"
                  value={employeeForm.department}
                  onChange={onEmployeeChange}
                  placeholder="Department"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="designation"
                  value={employeeForm.designation}
                  onChange={onEmployeeChange}
                  placeholder="Designation"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="location"
                  value={employeeForm.location}
                  onChange={onEmployeeChange}
                  placeholder="Location"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="division"
                  value={employeeForm.division}
                  onChange={onEmployeeChange}
                  placeholder="Division"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="pan"
                  value={employeeForm.pan}
                  onChange={onEmployeeChange}
                  placeholder="PAN"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="bankName"
                  value={employeeForm.bankName}
                  onChange={onEmployeeChange}
                  placeholder="Bank Name"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="mop"
                  value={employeeForm.mop}
                  onChange={onEmployeeChange}
                  placeholder="MOP"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="dob"
                  value={employeeForm.dob}
                  onChange={onEmployeeChange}
                  placeholder="DOB (DD/MM/YYYY)"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="doj"
                  value={employeeForm.doj}
                  onChange={onEmployeeChange}
                  placeholder="DOJ (DD/MM/YYYY)"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="uan"
                  value={employeeForm.uan}
                  onChange={onEmployeeChange}
                  placeholder="UAN No."
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="bankAcc"
                  value={employeeForm.bankAcc}
                  onChange={onEmployeeChange}
                  placeholder="Bank Account No."
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm col-span-2"
                />
              </div>

              <div className="border-t border-[#e5e7eb] pt-3 mt-2">
                <h4 className="font-medium text-sm text-[#1a202c] mb-2">
                  Salary Structure (Monthly Amounts)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Basic Salary (Monthly) *
                    </label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={employeeForm.basicSalary || ""}
                      onChange={onEmployeeChange}
                      placeholder="30000"
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Incentive (Monthly Amount ₹)
                    </label>
                    <input
                      type="number"
                      name="incentiveAmount"
                      value={employeeForm.incentiveAmount}
                      onChange={onEmployeeChange}
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                      step="100"
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      HRA (Monthly Amount ₹)
                    </label>
                    <input
                      type="number"
                      name="hraAmount"
                      value={employeeForm.hraAmount}
                      onChange={onEmployeeChange}
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                      step="100"
                      placeholder="e.g., 12000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Medical Allowance (Monthly Amount ₹)
                    </label>
                    <input
                      type="number"
                      name="medicalAllowance"
                      value={employeeForm.medicalAllowance}
                      onChange={onEmployeeChange}
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                      step="100"
                      placeholder="e.g., 1500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Other Allowances (Monthly Amount ₹)
                    </label>
                    <input
                      type="number"
                      name="otherAllowancesAmount"
                      value={employeeForm.otherAllowancesAmount}
                      onChange={onEmployeeChange}
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                      step="100"
                      placeholder="e.g., 3000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      PF (Monthly Amount ₹)
                    </label>
                    <input
                      type="number"
                      name="pfAmount"
                      value={employeeForm.pfAmount}
                      onChange={onEmployeeChange}
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                      step="100"
                      placeholder="e.g., 3600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      TDS (Monthly Amount ₹)
                    </label>
                    <input
                      type="number"
                      name="tdsAmount"
                      value={employeeForm.tdsAmount}
                      onChange={onEmployeeChange}
                      className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                      min="0"
                      step="100"
                      placeholder="e.g., 2000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addOrUpdateEmployee}
                  className="bg-[#2563eb] text-white px-3 py-2 rounded-md hover:bg-[#1d4ed8] text-sm"
                >
                  {editingIndex !== null ? "Update" : "Add Employee"}
                </button>
                {editingIndex !== null && (
                  <button
                    onClick={() => {
                      setEditingIndex(null);
                      setSelectedEmployeeId(null);
                      setEmployeeForm({
                        empCode: "",
                        name: "",
                        department: "Sales & Marketing",
                        designation: "Executive-Sales & Marketing",
                        mop: "Bank Transfer",
                        doj: "",
                        bankAcc: "",
                        location: "Delhi Office",
                        division: "Delhi Region",
                        pan: "",
                        bankName: "",
                        dob: "",
                        uan: "",
                        basicSalary: "",
                        incentiveAmount: 0,
                        hraAmount: 0,
                        medicalAllowance: 1500,
                        otherAllowancesAmount: 0,
                        pfAmount: 0,
                        tdsAmount: 0,
                      });
                    }}
                    className="px-3 py-2 border border-[#d1d5db] rounded-md text-sm hover:bg-[#f3f4f6]"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <h4 className="font-semibold mt-4 text-[#1a202c]">
                  Employees List
                </h4>
                {employees.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">
                    No employees added yet.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-auto mt-2 border border-[#d1d5db] rounded-md p-2">
                    <ul className="space-y-1 text-sm">
                      {employees.map((emp, idx) => (
                        <li
                          key={emp._id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium text-[#1a202c]">
                              {emp.name}
                            </div>
                            <div className="text-xs text-[#6b7280]">
                              {emp.empCode} • ₹
                              {Number(emp.basicSalary || 0).toLocaleString(
                                "en-IN",
                              )}
                              /month
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => selectEmployee(emp)}
                              className="px-2 py-1 text-xs border border-[#d1d5db] rounded-md hover:bg-[#f3f4f6]"
                              title="Select"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => editEmployee(idx)}
                              className="px-2 py-1 text-xs bg-[#facc15] rounded-md hover:bg-[#eab308]"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEmployee(emp._id)}
                              className="px-2 py-1 text-xs bg-[#ef4444] text-white rounded-md hover:bg-[#dc2626]"
                              title="Delete"
                            >
                              Del
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Earnings & Deductions - Keep same */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2 text-[#1a202c]">
              Earnings & Deductions
            </h3>
            <div className="mb-4 p-3 bg-[#dbeafe] rounded-md border border-[#93c5fd]">
              <label className="block text-sm font-medium text-[#1e40af] mb-1">
                Payable Days (Fixed at 30 days)
              </label>
              <input
                type="number"
                value={payableDays}
                onChange={(e) =>
                  setPayableDays(Math.max(0, Number(e.target.value) || 0))
                }
                min="0"
                max="31"
                className="border border-[#3b82f6] p-2 rounded-md w-full text-sm font-bold text-[#1e40af] bg-white"
              />
              <div className="mt-2 text-xs text-[#1e40af]">
                Per Day Salary: ₹{fmt(perDaySalary)} | Base Days: 30 | Payable:{" "}
                {payableDays} days
              </div>
            </div>
            <div className="text-xs text-[#6b7280] mb-2">
              Salary is calculated on 30 days base • Payable: {payableDays} days
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1 text-[#1a202c]">Earnings</h4>
                <div className="space-y-2">
                  {Object.keys(earnings).map((key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <div className="text-sm text-[#1a202c]">{key}</div>
                      <input
                        type="number"
                        value={earnings[key].toFixed(2)}
                        onChange={(e) => setEarningValue(key, e.target.value)}
                        className="w-32 border border-[#d1d5db] p-1 rounded-md text-right text-sm"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-[#1a202c]">Deductions</h4>
                <div className="space-y-2">
                  {Object.keys(deductions).map((key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <div className="text-sm text-[#1a202c]">{key}</div>
                      <input
                        type="number"
                        value={deductions[key]}
                        onChange={(e) => setDeductionValue(key, e.target.value)}
                        className="w-32 border border-[#d1d5db] p-1 rounded-md text-right text-sm"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-[#d1d5db] pt-3">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-[#1a202c]">
                  Gross Pay
                </div>
                <div className="font-semibold text-[#1a202c]">
                  ₹ {fmt(grossPay)}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-[#1a202c]">
                  Total Deduction
                </div>
                <div className="font-semibold text-[#1a202c]">
                  ₹ {fmt(totalDeductions)}
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-lg font-bold text-[#1a202c]">
                  Net Salary
                </div>
                <div className="text-lg font-bold text-[#1a202c]">
                  ₹ {fmt(netPay)}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#1a202c] mb-1">
                Salary Month
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 border border-[#d1d5db] p-2 rounded-md text-sm"
                >
                  {monthsList.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="flex-1 border border-[#d1d5db] p-2 rounded-md text-sm"
                >
                  {yearsList.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#6b7280] mt-1">
                Selected: {selectedMonth} {selectedYear} (Total days:{" "}
                {totalDaysInMonth})
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setPayableDays(30);
                }}
                className="px-3 py-2 border border-[#d1d5db] rounded-md text-sm hover:bg-[#f3f4f6]"
              >
                Reset to 30 Days
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className={`px-3 py-2 rounded-md text-sm text-white ${isGeneratingPDF ? "bg-[#9ca3af]" : "bg-[#16a34a] hover:bg-[#15803d]"}`}
              >
                {isGeneratingPDF ? "Generating..." : "Generate & Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Preview / Payslip - Keep same */}
        <div className="mt-6">
          <div
            ref={slipRef}
            className="mx-auto bg-white border-2 border-[#000000] p-4"
            style={{ width: "900px", boxSizing: "border-box" }}
          >
            <div className="flex justify-between items-start border-b border-[#000000] pb-2">
              <div className="flex items-center gap-3">
                <img
                  src={assets?.logo || "/logo.png"}
                  alt="logo"
                  style={{ height: 60 }}
                  onError={(e) => (e.target.src = "/logo.png")}
                />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#1e40af]">
                  Arshyan Insurance Marketing & Services Pvt. Ltd
                </div>
                <div className="text-sm text-[#1a202c]">
                  Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New
                  Delhi-110089
                </div>
                <div className="text-sm text-[#1a202c]">
                  Tel (+9111-43592951), E-mail:
                  sales.support@arshyaninsurance.com
                </div>
                <div className="text-sm text-[#1a202c]">
                  Website: www.arshyaninsurance.com | CIN: U66290DL2025PTC441715
                </div>
              </div>
            </div>
            <div className="text-center font-semibold mt-4 mb-2 text-[#1a202c]">
              Pay Slip for the month of {getSalaryMonthString()}
            </div>
            <div className="border border-[#000000]">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6] w-1/6">
                      Emp. Code:
                    </td>
                    <td className="border border-[#000000] p-2 w-2/6">
                      {employeeForm.empCode}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6] w-1/6">
                      Location:
                    </td>
                    <td className="border border-[#000000] p-2 w-2/6">
                      {employeeForm.location}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Name:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.name}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Division:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.division}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Department:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.department}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      PAN:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.pan}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Designation:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.designation}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Bank Name:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.bankName}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      MOP:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.mop}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      DOB:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.dob}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      DOJ:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.doj}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      UAN No.:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.uan}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Bank Account No:
                    </td>
                    <td className="border border-[#000000] p-2">
                      {employeeForm.bankAcc}
                    </td>
                    <td className="border border-[#000000] p-2 bg-[#f3f4f6]">
                      Payable Days:
                    </td>
                    <td className="border border-[#000000] p-2 text-right">
                      {payableDays} / 30{" "}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 border border-[#000000]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#e5e7eb]">
                    <th className="border border-[#000000] p-2 text-left">
                      Earning
                    </th>
                    <th className="border border-[#000000] p-2 text-right">
                      Monthly
                    </th>
                    <th className="border border-[#000000] p-2 text-right">
                      Payable Amount
                    </th>
                    <th className="border border-[#000000] p-2 text-left">
                      Deduction
                    </th>
                    <th className="border border-[#000000] p-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(earnings).map((key, idx) => {
                    const monthlyValue =
                      key === "Basic"
                        ? Number(employeeForm.basicSalary || 0)
                        : key === "Incentive"
                          ? Number(employeeForm.incentiveAmount || 0)
                          : key === "Allowance HRA"
                            ? Number(employeeForm.hraAmount || 0)
                            : key === "Allowance Medical"
                              ? Number(employeeForm.medicalAllowance || 0)
                              : key === "Other Allowances"
                                ? Number(
                                    employeeForm.otherAllowancesAmount || 0,
                                  )
                                : 0;
                    return (
                      <tr key={key}>
                        <td className="border border-[#000000] p-2">{key}</td>
                        <td className="border border-[#000000] p-2 text-right">
                          {fmt(monthlyValue)}
                        </td>
                        <td className="border border-[#000000] p-2 text-right">
                          {fmt(earnings[key])}
                        </td>
                        {idx === 0 && (
                          <>
                            <td
                              className="border border-[#000000] p-2"
                              rowSpan={Object.keys(earnings).length}
                            >
                              {Object.keys(deductions).map((k) => (
                                <div
                                  key={k}
                                  className="text-sm font-semibold py-1"
                                >
                                  {k}
                                </div>
                              ))}
                            </td>
                            <td
                              className="border border-[#000000] p-2 text-right"
                              rowSpan={Object.keys(earnings).length}
                            >
                              {Object.keys(deductions).map((k) => (
                                <div key={k} className="py-1">
                                  ₹ {fmt(deductions[k])}
                                </div>
                              ))}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-[#000000] p-2 font-semibold text-right"
                    >
                      GROSS PAY
                    </td>
                    <td className="border border-[#000000] p-2 text-right font-semibold">
                      ₹ {fmt(grossPay)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-[#000000] p-2 font-semibold text-right"
                    >
                      Net Salary: ₹ {fmt(netPay)}
                    </td>
                    <td className="border border-[#000000] p-2 text-right font-semibold">
                      ({numberToWords(netPay)})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-sm font-semibold text-[#1a202c]">
              This is a computer generated payslip and does not require any
              signature.
            </div>
          </div>
        </div>

        {/* Generated Salary Slips with Filters - Keep same */}
        <div className="mt-12 border-t pt-6">
          <h3 className="text-xl font-bold mb-4 text-[#1a202c]">
            Generated Salary Slips ({filteredSalarySlips.length})
          </h3>

          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3 text-[#1a202c]">Filter Slips</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Filter by Employee Name..."
                value={filterEmployeeName}
                onChange={(e) => setFilterEmployeeName(e.target.value)}
                className="border border-[#d1d5db] p-2 rounded-md text-sm"
              />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border border-[#d1d5db] p-2 rounded-md text-sm"
              >
                <option value="">All Months</option>
                {monthsList.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="border border-[#d1d5db] p-2 rounded-md text-sm"
              >
                <option value="">All Years</option>
                {yearsList.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {filteredSalarySlips.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No salary slips found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f3f4f6]">
                    <th className="border border-[#d1d5db] p-2 text-left">
                      Month
                    </th>
                    <th className="border border-[#d1d5db] p-2 text-left">
                      Employee
                    </th>
                    <th className="border border-[#d1d5db] p-2 text-right">
                      Net Pay
                    </th>
                    <th className="border border-[#d1d5db] p-2 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalarySlips.map((slip) => (
                    <tr key={slip._id} className="hover:bg-[#f9fafb]">
                      <td className="border border-[#d1d5db] p-2">
                        {slip.salaryMonth}
                      </td>
                      <td className="border border-[#d1d5db] p-2">
                        {slip.employee?.name || "N/A"}
                      </td>
                      <td className="border border-[#d1d5db] p-2 text-right">
                        ₹{" "}
                        {slip.netPay.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border border-[#d1d5db] p-2 text-center">
                        <div className="flex justify-center gap-2 text-xs">
                          <a
                            href={slip.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2563eb] hover:underline"
                          >
                            View
                          </a>
                          <a
                            href={slip.pdfUrl}
                            download
                            className="text-[#16a34a] hover:underline"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDeleteSlip(slip._id)}
                            className="text-[#ef4444] hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalarySlipGenerator;
