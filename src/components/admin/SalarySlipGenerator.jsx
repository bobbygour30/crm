import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import assets from "../../assets/assets"; // Assumes assets module exists

const defaultEarnings = {
  Basic: 10000,
  Conveyance: 1600,
  "Allowance HRA": 5000,
  "Leave Travel": 833.33,
  "Allowance Medical": 1250,
  Reimbursement: 6316.67,
  "Special Pay": 0
};

const defaultDeductions = {
  "PF (Employee Contribution)": 0,
  "Tax Deducted at Source": 0
};

const SalarySlipGenerator = () => {
  const slipRef = useRef();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Employee management
  const [employees, setEmployees] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    empCode: "ARSYN-44715-05",
    name: "Hemant Verma",
    department: "Sales & Marketing",
    designation: "Executive-Sales & Marketing",
    mop: "Bank Transfer",
    doj: "22-Sep-2025",
    bankAcc: "50100729069796",
    location: "Delhi Office",
    division: "Delhi Region",
    pan: "BUKP V2417F",
    grade: "",
    dob: "02/01/1992",
    uan: "",
    payableDays: 31
  });

  // Month / meta
  const [salaryMonth, setSalaryMonth] = useState("October 2025");

  // Earnings & deductions state
  const [earnings, setEarnings] = useState(defaultEarnings);
  const [deductions, setDeductions] = useState(defaultDeductions);

  // Helpers
  const onEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((s) => ({ ...s, [name]: value }));
  };

  const addOrUpdateEmployee = () => {
    if (!employeeForm.name || !employeeForm.empCode) {
      alert("Emp Code and Name are required");
      return;
    }
    if (editingIndex !== null) {
      const arr = [...employees];
      arr[editingIndex] = { ...employeeForm };
      setEmployees(arr);
      setEditingIndex(null);
    } else {
      setEmployees([...employees, { ...employeeForm }]);
    }
    setEmployeeForm((s) => ({ ...s }));
  };

  const editEmployee = (idx) => {
    setEmployeeForm(employees[idx]);
    setEditingIndex(idx);
  };

  const deleteEmployee = (idx) => {
    if (!confirm("Delete this employee?")) return;
    const arr = employees.filter((_, i) => i !== idx);
    setEmployees(arr);
    setEditingIndex(null);
  };

  const selectEmployee = (idx) => {
    setEmployeeForm(employees[idx]);
  };

  const setEarningValue = (key, value) => {
    setEarnings((s) => ({ ...s, [key]: parseFloat(value) || 0 }));
  };

  const setDeductionValue = (key, value) => {
    setDeductions((s) => ({ ...s, [key]: parseFloat(value) || 0 }));
  };

  const grossPay = Object.values(earnings).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + (Number(b) || 0), 0);
  const netPay = grossPay - totalDeductions;

  const fmt = (n) =>
    n != null ? n.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : "0.00";

  const numberToWords = (num) => {
    if (isNaN(num)) return "";
    const n = Math.abs(Number(num.toFixed(2)));
    const paise = Math.round((n - Math.trunc(n)) * 100);
    const intPart = Math.trunc(n);

    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (num) => {
      if (num === 0) return "Zero";
      if (num < 20) return a[num];
      if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
      if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + inWords(num % 100) : "");
      if (num < 100000) return inWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + inWords(num % 1000) : "");
      if (num < 10000000) return inWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + inWords(num % 100000) : "");
      return inWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + inWords(num % 10000000) : "");
    };

    let words = "Rupees " + inWords(intPart) + (intPart === 0 ? "" : "");
    if (paise > 0) words += " and " + inWords(paise) + " Paise";
    words += " Only.";
    return words;
  };

  const generatePDF = async () => {
    const el = slipRef.current;
    if (!el) {
      console.error("slipRef is not attached to any element");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      const fileName = `SalarySlip_${employeeForm.name || "employee"}_${salaryMonth.replace(/\s/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please check the console for details.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f7fafc] min-h-screen box-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#1a202c]">Salary Slip Generator</h2>

        <div className="">
          {/* Employee Form */}
          <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm min-w-0">
            <h3 className="font-semibold mb-2 text-[#1a202c]">Employee (Add / Edit)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="empCode"
                  value={employeeForm.empCode}
                  onChange={onEmployeeChange}
                  placeholder="Emp. Code"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
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
                  name="grade"
                  value={employeeForm.grade}
                  onChange={onEmployeeChange}
                  placeholder="Grade"
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
                  placeholder="DOB"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
                <input
                  name="doj"
                  value={employeeForm.doj}
                  onChange={onEmployeeChange}
                  placeholder="DOJ"
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
                <input
                  name="payableDays"
                  value={employeeForm.payableDays}
                  onChange={(e) => onEmployeeChange({ target: { name: "payableDays", value: e.target.value } })}
                  placeholder="Payable Days"
                  className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                />
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
                      setEmployeeForm({
                        empCode: "",
                        name: "",
                        department: "",
                        designation: "",
                        mop: "",
                        doj: "",
                        bankAcc: "",
                        location: "",
                        division: "",
                        pan: "",
                        grade: "",
                        dob: "",
                        uan: "",
                        payableDays: 31
                      });
                      setEditingIndex(null);
                    }}
                    className="px-3 py-2 border border-[#d1d5db] rounded-md text-sm hover:bg-[#f3f4f6]"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <h4 className="font-semibold mt-4 text-[#1a202c]">Employees</h4>
                {employees.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No employees added yet.</p>
                ) : (
                  <div className="max-h-40 overflow-auto mt-2 border border-[#d1d5db] rounded-md p-2">
                    <ul className="space-y-1 text-sm">
                      {employees.map((emp, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-[#1a202c]">{emp.name}</div>
                            <div className="text-xs text-[#6b7280]">{emp.empCode} • {emp.department}</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => selectEmployee(idx)}
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
                              onClick={() => deleteEmployee(idx)}
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

          {/* Earnings & Deductions */}
          <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm min-w-0">
            <h3 className="font-semibold mb-2 text-[#1a202c]">Earnings & Deductions</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1 text-[#1a202c]">Earnings</h4>
                <div className="space-y-2">
                  {Object.keys(earnings).map((key) => (
                    <div key={key} className="flex justify-between items-center">
                      <div className="text-sm text-[#1a202c]">{key}</div>
                      <input
                        type="number"
                        value={earnings[key]}
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
                    <div key={key} className="flex justify-between items-center">
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
                <div className="text-sm font-medium text-[#1a202c]">Gross Pay</div>
                <div className="font-semibold text-[#1a202c]">₹ {fmt(grossPay)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-[#1a202c]">Total Deduction</div>
                <div className="font-semibold text-[#1a202c]">₹ {fmt(totalDeductions)}</div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-lg font-bold text-[#1a202c]">Net Salary</div>
                <div className="text-lg font-bold text-[#1a202c]">₹ {fmt(netPay)}</div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-[#1a202c]">Salary Month</label>
              <input
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
                className="border border-[#d1d5db] p-2 rounded-md w-full text-sm"
                placeholder="October 2025"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setEarnings(defaultEarnings);
                  setDeductions(defaultDeductions);
                }}
                className="px-3 py-2 border border-[#d1d5db] rounded-md text-sm hover:bg-[#f3f4f6]"
              >
                Reset to Defaults
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className={`px-3 py-2 rounded-md text-sm text-white ${
                  isGeneratingPDF ? "bg-[#9ca3af] cursor-not-allowed" : "bg-[#16a34a] hover:bg-[#15803d]"
                }`}
              >
                {isGeneratingPDF ? "Generating..." : "Generate PDF"}
              </button>
            </div>
          </div>

          {/* Preview / Payslip */}
          <div className="col-span-3">
            <div
              ref={slipRef}
              className="mx-auto bg-white border-2 border-[#000000] p-4"
              style={{ width: "900px", boxSizing: "border-box" }}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-[#000000] pb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={assets?.logo || "/logo.png"}
                    alt="logo"
                    style={{ height: 60 }}
                    onError={(e) => (e.target.src = "/logo.png")} // Fallback for image loading
                  />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#1e40af]">Arshyan Insurance Marketing & Services Pvt. Ltd</div>
                  <div className="text-sm text-[#1a202c]">Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New Delhi-110089</div>
                  <div className="text-sm text-[#1a202c]">Tel (+9111-43592951), E-mail: sales.support@arshyaninsurance.com</div>
                  <div className="text-sm text-[#1a202c]">Website: www.arshyaninsurance.com | CIN: U66290DL2025PTC441715</div>
                </div>
              </div>

              <div className="text-center font-semibold mt-4 mb-2 text-[#1a202c]">Pay Slip for the month of {salaryMonth}</div>

              {/* Employee info table */}
              <div className="border border-[#000000]">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6] w-1/6">Emp. Code:</td>
                      <td className="border border-[#000000] p-2 w-2/6">{employeeForm.empCode}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6] w-1/6">Location:</td>
                      <td className="border border-[#000000] p-2 w-2/6">{employeeForm.location}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Name:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.name}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Division:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.division}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Department:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.department}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">PAN:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.pan}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Designation:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.designation}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Grade:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.grade}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">MOP:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.mop}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">DOB:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.dob}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">DOJ:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.doj}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">UAN No.:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.uan}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Bank Account No:</td>
                      <td className="border border-[#000000] p-2">{employeeForm.bankAcc}</td>
                      <td className="border border-[#000000] p-2 bg-[#f3f4f6]">Payable Days:</td>
                      <td className="border border-[#000000] p-2 text-right">{employeeForm.payableDays}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Earnings / Deductions table */}
              <div className="mt-3 border border-[#000000]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#e5e7eb]">
                      <th className="border border-[#000000] p-2 text-left">Earning</th>
                      <th className="border border-[#000000] p-2 text-right">Rate</th>
                      <th className="border border-[#000000] p-2 text-right">Monthly</th>
                      <th className="border border-[#000000] p-2 text-right">Arrear</th>
                      <th className="border border-[#000000] p-2 text-right">Total</th>
                      <th className="border border-[#000000] p-2 text-left">Deduction</th>
                      <th className="border border-[#000000] p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(earnings).map((key, idx) => (
                      <tr key={key}>
                        <td className="border border-[#000000] p-2">{key}</td>
                        <td className="border border-[#000000] p-2 text-right">{fmt(earnings[key])}</td>
                        <td className="border border-[#000000] p-2 text-right">{fmt(earnings[key])}</td>
                        <td className="border border-[#000000] p-2 text-right">0.00</td>
                        <td className="border border-[#000000] p-2 text-right">{fmt(earnings[key])}</td>
                        {idx === 0 ? (
                          <>
                            <td className="border border-[#000000] p-2" rowSpan={Object.keys(earnings).length}>
                              {Object.keys(deductions).map((deductionKey) => (
                                <div key={deductionKey} className="text-sm font-semibold">{deductionKey}</div>
                              ))}
                            </td>
                            <td className="border border-[#000000] p-2 text-right" rowSpan={Object.keys(earnings).length}>
                              {Object.keys(deductions).map((deductionKey) => (
                                <div key={deductionKey}>₹ {fmt(deductions[deductionKey])}</div>
                              ))}
                            </td>
                          </>
                        ) : null}
                      </tr>
                    ))}
                    <tr>
                      <td className="border border-[#000000] p-2 font-semibold text-right" colSpan={4}>
                        GROSS PAY
                      </td>
                      <td className="border border-[#000000] p-2 text-right font-semibold">₹ {fmt(grossPay)}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2 font-semibold text-right" colSpan={4}>
                        Net Salary: ₹ {fmt(netPay)}
                      </td>
                      <td className="border border-[#000000] p-2 text-right font-semibold">({numberToWords(netPay)})</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-[#1a202c]">
                  This is a computer generated payslip and does not require any signature.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipGenerator;