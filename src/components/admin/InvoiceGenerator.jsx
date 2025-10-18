import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import assets from "../../assets/assets"; // Ensure your logo is correctly imported

const InvoiceGenerator = () => {
  const [invoiceCount, setInvoiceCount] = useState(1);
  const [invoiceNo, setInvoiceNo] = useState(`ARYN/2025-26/${String(1).padStart(4, "0")}`);
  const [vendorCode, setVendorCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [refNo, setRefNo] = useState("OG-26-1149-4014-00000028");
  const [baseAmount, setBaseAmount] = useState(7626);
  const [billToCompany, setBillToCompany] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [billToMobile, setBillToMobile] = useState("");
  const [billToEmail, setBillToEmail] = useState("");
  const [billToGSTIN, setBillToGSTIN] = useState("");
  const [billToPAN, setBillToPAN] = useState("");
  const [serviceDescription, setServiceDescription] = useState("Mobile Insurance - Services");

  // Vendor management
  const [vendors, setVendors] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: "",
    gst: "",
    pan: "",
    address: "",
    mobile: "",
    email: "",
    stateCode: "",
    code: ""
  });

  const invoiceRef = useRef();

  // Get current date in DD-MM-YYYY format
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('-');
  };

  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setVendorForm({ ...vendorForm, [name]: value });
    if (name === "name") {
      setBillToCompany(value); // Sync vendor name with bill to company
    }
  };

  const handleBillToCompanyChange = (e) => {
    const value = e.target.value;
    setBillToCompany(value);
    const selectedVendor = vendors.find((v) => v.name === value);
    if (selectedVendor) {
      setVendorCode(selectedVendor.code);
      setBillToAddress(selectedVendor.address || "");
      setBillToMobile(selectedVendor.mobile || "");
      setBillToEmail(selectedVendor.email || "");
      setBillToGSTIN(selectedVendor.gst || "");
      setBillToPAN(selectedVendor.pan || "");
    } else {
      setVendorCode("");
      setBillToAddress("");
      setBillToMobile("");
      setBillToEmail("");
      setBillToGSTIN("");
      setBillToPAN("");
    }
  };

  const addOrUpdateVendor = () => {
    if (!vendorForm.name) return alert("Vendor Name is required");

    if (editingIndex !== null) {
      const updatedVendors = [...vendors];
      updatedVendors[editingIndex] = { ...vendorForm, code: updatedVendors[editingIndex].code };
      setVendors(updatedVendors);
      setEditingIndex(null);
    } else {
      const newVendor = {
        ...vendorForm,
        code: `110089${String(vendors.length + 10).padStart(2, "0")}`
      };
      setVendors([...vendors, newVendor]);
      setVendorCode(newVendor.code);
      setBillToCompany(newVendor.name); // Sync new vendor name with bill to company
    }

    setVendorForm({
      name: "",
      gst: "",
      pan: "",
      address: "",
      mobile: "",
      email: "",
      stateCode: "",
      code: ""
    });
  };

  const editVendor = (index) => {
    setVendorForm(vendors[index]);
    setVendorCode(vendors[index].code);
    setEditingIndex(index);
    setBillToCompany(vendors[index].name); // Sync when editing
  };

  // PDF and number-to-words logic
  const numberToWords = (num) => {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Million", "Billion"];

    if (num === 0) return "Zero";
    const convertLessThanThousand = (n) => {
      if (n === 0) return "";
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
      return units[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
    };

    let words = "";
    let numInt = num;
    let i = 0;
    while (numInt > 0) {
      if (numInt % 1000 !== 0) {
        words = convertLessThanThousand(numInt % 1000) + (thousands[i] ? " " + thousands[i] : "") + (words ? " " + words : "");
      }
      numInt = Math.floor(numInt / 1000);
      i++;
    }

    return "Rupees " + words + " Only";
  };

  const cgst = Math.round(baseAmount * 0.09);
  const sgst = Math.round(baseAmount * 0.09);
  const totalAmount = Math.round(baseAmount + cgst + sgst);

  const generatePDF = async () => {
    if (!billToCompany) {
      alert("Please enter a Bill To Company");
      return;
    }
    if (!vendorCode && vendors.length > 0) {
      alert("Please select a vendor with a valid vendor code");
      return;
    }

    const element = invoiceRef.current;
    if (!element) {
      console.error("Invoice element not found");
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPosition = (pageHeight - imgHeight) / 2 > margin ? (pageHeight - imgHeight) / 2 : margin;
      pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      pdf.save(`invoice-${invoiceNo}.pdf`);

      // Increment invoice number after generating PDF
      setInvoiceCount((prev) => {
        const newCount = prev + 1;
        setInvoiceNo(`ARYN/2025-26/${String(newCount).padStart(4, "0")}`);
        return newCount;
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
        Generate Invoice
      </h2>
      <div className="border p-4 rounded-md mb-6 bg-gray-50">
        <h3 className="font-bold mb-2 text-gray-900">Add Vendor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
            <input
              type="text"
              name="name"
              value={vendorForm.name}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GST Number</label>
            <input
              type="text"
              name="gst"
              value={vendorForm.gst}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PAN Number</label>
            <input
              type="text"
              name="pan"
              value={vendorForm.pan}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={vendorForm.address}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={vendorForm.mobile}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={vendorForm.email}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State Code</label>
            <input
              type="text"
              name="stateCode"
              value={vendorForm.stateCode}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={addOrUpdateVendor}
          className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {editingIndex !== null ? "Update Vendor" : "Add Vendor"}
        </button>

        {/* Vendors List */}
        {vendors.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold mb-2 text-gray-900">Vendors List</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Code</th>
                    <th className="border border-gray-300 p-2 text-left">Name</th>
                    <th className="border border-gray-300 p-2 text-left">GST</th>
                    <th className="border border-gray-300 p-2 text-left">PAN</th>
                    <th className="border border-gray-300 p-2 text-left">Mobile</th>
                    <th className="border border-gray-300 p-2 text-left">Email</th>
                    <th className="border border-gray-300 p-2 text-left">State Code</th>
                    <th className="border border-gray-300 p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 p-2">{v.code}</td>
                      <td className="border border-gray-300 p-2">{v.name}</td>
                      <td className="border border-gray-300 p-2">{v.gst}</td>
                      <td className="border border-gray-300 p-2">{v.pan}</td>
                      <td className="border border-gray-300 p-2">{v.mobile}</td>
                      <td className="border border-gray-300 p-2">{v.email}</td>
                      <td className="border border-gray-300 p-2">{v.stateCode}</td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => editVendor(idx)}
                          className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice No
          </label>
          <input
            type="text"
            value={invoiceNo}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice Date
          </label>
          <input
            type="text"
            value={getCurrentDate()}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vendor Code
          </label>
          <input
            type="text"
            value={vendorCode}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Base Amount (INR)
          </label>
          <input
            type="number"
            value={baseAmount}
            onChange={(e) => setBaseAmount(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reference No
          </label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill To Company
          </label>
          <input
            type="text"
            value={billToCompany}
            onChange={handleBillToCompanyChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill To Address
          </label>
          <input
            type="text"
            value={billToAddress}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill To Mobile
          </label>
          <input
            type="text"
            value={billToMobile}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill To Email
          </label>
          <input
            type="email"
            value={billToEmail}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill To GSTIN
          </label>
          <input
            type="text"
            value={billToGSTIN}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill To PAN
          </label>
          <input
            type="text"
            value={billToPAN}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Service Description
          </label>
          <input
            type="text"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={generatePDF}
        className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Generate PDF
      </button>

      {/* Invoice Template */}
      <div
        ref={invoiceRef}
        className="text-sm mx-auto mt-6"
        style={{
          width: "800px",
          minHeight: "1120px",
          background: "#ffffff",
          padding: "20px",
          border: "2px solid #000000",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
          <img
            src={assets.logo}
            alt="Arshyan Insurance Logo"
            className="h-16"
          />
          <div className="text-right text-gray-900">
            <h1 className="font-bold text-blue-900 text-lg">
              Arshyan Insurance Marketing & Services Pvt. Ltd
            </h1>
            <p>
              Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New Delhi-110089
            </p>
            <p>
              Tel (+9111-43592951), E-mail: sales.support@arshyaninsurance.com
            </p>
            <p>
              website: www.arshyaninsurance.com | CIN: U66290DL2025PTC441715
            </p>
          </div>
        </div>

        {/* Tax Invoice Label */}
        <div className="bg-gray-100 text-center font-bold py-2 border-y border-gray-900 mt-2 text-gray-900">
          TAX INVOICE
        </div>

        {/* Company & Invoice Info */}
        <div className="grid grid-cols-2 border border-gray-900 mt-2">
          <div className="p-2 text-gray-900 border-r border-gray-900">
            <p>
              <strong>Arshyan Insurance Marketing & Services Pvt Ltd</strong>
            </p>
            <p>212, 1st Floor Block G-3, Sector-16 Rohini New Delhi-110089</p>
            <p>07ABCCA0500H1ZD</p>
            <p>ABCCA0500H</p>
          </div>
          <div className="p-2 text-gray-900">
            <p>
              <strong>INVOICE NO:</strong> {invoiceNo}
            </p>
            <p>
              <strong>INVOICE DATE:</strong> {getCurrentDate()}
            </p>
          </div>
        </div>

        {/* Bill To & Vendor Info */}
        <div className="grid grid-cols-2 border border-gray-900 mt-2">
          <div className="p-2 text-gray-900 border-r border-gray-900">
            <p>
              <strong>Bill To</strong>
            </p>
            <p>{billToCompany}</p>
            <p>{billToAddress}</p>
            <p>
              <strong>Mobile:</strong> {billToMobile}
            </p>
            <p>
              <strong>Email:</strong> {billToEmail}
            </p>
            <p>
              <strong>GSTIN:</strong> {billToGSTIN}
            </p>
            <p>
              <strong>PAN:</strong> {billToPAN}
            </p>
          </div>
          <div className="p-2 text-gray-900">
            <p>
              <strong>Vendor Code:</strong> {vendorCode}
            </p>
            <p>
              <strong>State Name:</strong> Delhi
            </p>
            <p>
              <strong>State Code:</strong> 07
            </p>
          </div>
        </div>

        {/* Particulars Table */}
        <table className="w-full mt-2 border border-gray-900 text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-900">
              <th className="border border-gray-900 p-2">Particulars</th>
              <th className="border border-gray-900 p-2">HSN/SAC</th>
              <th className="border border-gray-900 p-2">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 text-gray-900">
                <div className="space-y-1">
                  <div>{serviceDescription}</div>
                  <div>
                    <strong>Customer Name:</strong> {customerName}
                  </div>
                  <div>
                    <strong>Ref No:</strong> {refNo}
                  </div>
                </div>
              </td>
              <td className="border border-gray-900 p-2 text-center text-gray-900">
                <div className="space-y-1">
                  <div>998311</div>
                  <div>CGST 9%</div>
                  <div>SGST 9%</div>
                </div>
              </td>
              <td className="border border-gray-900 p-2 text-right text-gray-900">
                <div className="space-y-1">
                  <div>₹ {baseAmount.toLocaleString('en-IN')}</div>
                  <div>₹ {cgst.toLocaleString('en-IN')}</div>
                  <div>₹ {sgst.toLocaleString('en-IN')}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-900 p-2"></td>
              <td className="border border-gray-900 p-2 font-bold text-right text-gray-900">
                Total Amount
              </td>
              <td className="border border-gray-900 p-2 font-bold text-right text-gray-900">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border border-gray-900 p-2 mt-2 text-gray-900">
          {numberToWords(totalAmount)}
        </div>

        {/* Bank Details & Sign */}
        <div className="grid grid-cols-2 border border-gray-900 mt-2">
          <div className="p-2 text-gray-900 border-r border-gray-900">
            <p>
              <strong>COMPANY BANK ACCOUNT DETAILS :-</strong>
            </p>
            <p>
              <strong>NAME:</strong> ARSHYAN INSURANCE MARKETING & SERVICES PVT LTD
            </p>
            <p>
              <strong>BANK NAME:</strong> RBL BANK LTD
            </p>
            <p>
              <strong>CURRENT A/C NO:</strong> 409002419528
            </p>
            <p>
              <strong>IFSC CODE:</strong> RATN0000559
            </p>
            <p>
              <strong>ADDRESS:</strong> Sector-7 Rohini Delhi-110085
            </p>
          </div>
          <div className="p-2 text-right text-gray-900 flex flex-col justify-end">
            <p>For Arshyan Insurance Marketing & Service Pvt Ltd</p>
            <div className="h-12" />
            <p>
              <strong>Authorised Signatory</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;