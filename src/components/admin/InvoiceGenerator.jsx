import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import assets from "../../assets/assets"; // Ensure your logo is correctly imported

const vendorOptions = [
  "Bajaj Allianz Gengeral Insurance Co Ltd",
  "Tata Aig General Insurance Co Ltd",
  "HDFC Ergo General Insurance Co Ltd",
  "ICICI Lombard General Insurance Co Ltd",
  "Digit General Insurance Co Ltd",
  "Reliance General Insurance Co Ltd",
  "SBI General Insurance Co Ltd",
  "Future General General Insurance Co Ltd",
  "Magma HDI General Insurance Co Ltd",
  "Royal Sundram Genetal Insurance Co Ltd",
  "kotak Mahinrda General Insurance Co Ltd",
  "Liberty General Insurance Co Ltd",
  "Shriram General Insurance Co Ltd",
  "United India General Insurance Co Ltd",
  "Oriental General Insurance Co Ltd",
  "National General Insurance Co Ltd",
  "New India General Insurance Co Ltd",
  "Chola MS General Insurance Co Ltd",
  "Universal Sompo General Insurance Co Ltd",
  "Iffco tokio General Insurance Co Ltd",
  "ICICI Prudential Life Insurance",
  "TATA AIA Life Insurance",
  "HDFC Life Insurance",
  "Reliance Nippon Life Insurance",
  "Axis Max Life Insurance",
  "Niva Bupa Health Insurance",
  "Care Health Insurance",
  "Star Health Insurance",
  "Aditya Birla Health Insurance",
  "Bajaj Allianz Life Insurance"
];

const InvoiceGenerator = () => {
  const [invoiceCount, setInvoiceCount] = useState(1);
  const [invoiceNo, setInvoiceNo] = useState(`ARYN/2025-26/${String(1).padStart(4, "0")}`);
  const [invoiceDate, setInvoiceDate] = useState("");
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

  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setVendorForm({ ...vendorForm, [name]: value });
    if (name === "name") {
      const selectedVendor = vendors.find((v) => v.name === value);
      if (selectedVendor) {
        setVendorCode(selectedVendor.code);
        setVendorForm({ ...vendorForm, name: value, code: selectedVendor.code });
      } else {
        setVendorCode("");
        setVendorForm({ ...vendorForm, name: value, code: "" });
      }
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
      alert("Please select a Bill To Company");
      return;
    }
    if (!vendorCode) {
      alert("Please select a vendor with a valid vendor code");
      return;
    }

    const element = invoiceRef.current;
    if (!element) return;

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
      pdf.save("invoice.pdf");

      // Increment invoice number after generating PDF
      setInvoiceCount((prev) => {
        const newCount = prev + 1;
        setInvoiceNo(`ARYN/2025-26/${String(newCount).padStart(4, "0")}`);
        return newCount;
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#000000]">
        Generate Invoice
      </h2>
      <div className="border p-4 rounded-md mb-6 bg-[#f9f9f9]">
        <h3 className="font-bold mb-2 text-[#000000]">Add Vendor</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#000000]">Vendor Name</label>
            <select
              name="name"
              value={vendorForm.name}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            >
              <option value="">Select Vendor</option>
              {vendorOptions.map((vendor, idx) => (
                <option key={idx} value={vendor}>{vendor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000]">GST Number</label>
            <input
              type="text"
              name="gst"
              value={vendorForm.gst}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000]">PAN Number</label>
            <input
              type="text"
              name="pan"
              value={vendorForm.pan}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000]">Address</label>
            <input
              type="text"
              name="address"
              value={vendorForm.address}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000]">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={vendorForm.mobile}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000]">Email</label>
            <input
              type="email"
              name="email"
              value={vendorForm.email}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000]">State Code</label>
            <input
              type="text"
              name="stateCode"
              value={vendorForm.stateCode}
              onChange={handleVendorInputChange}
              className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
            />
          </div>
        </div>
        <button
          onClick={addOrUpdateVendor}
          className="mt-3 bg-[#4b0082] text-white px-4 py-2 rounded-md hover:bg-[#3f0071]"
        >
          {editingIndex !== null ? "Update Vendor" : "Add Vendor"}
        </button>

        {/* Vendors List */}
        {vendors.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold mb-2 text-[#000000]">Vendors List</h4>
            <table className="w-full border border-[#000000] text-sm">
              <thead className="bg-[#e5e7eb]">
                <tr>
                  <th className="border p-2">Code</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">GST</th>
                  <th className="border p-2">PAN</th>
                  <th className="border p-2">Mobile</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">State Code</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, idx) => (
                  <tr key={idx}>
                    <td className="border p-1 text-center">{v.code}</td>
                    <td className="border p-1">{v.name}</td>
                    <td className="border p-1">{v.gst}</td>
                    <td className="border p-1">{v.pan}</td>
                    <td className="border p-1">{v.mobile}</td>
                    <td className="border p-1">{v.email}</td>
                    <td className="border p-1 text-center">{v.stateCode}</td>
                    <td className="border p-1 text-center">
                      <button
                        onClick={() => editVendor(idx)}
                        className="bg-[#4b0082] text-white px-2 py-1 rounded hover:bg-[#3f0071]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Invoice No
          </label>
          <input
            type="text"
            value={invoiceNo}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Invoice Date
          </label>
          <input
            type="text"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Vendor Code
          </label>
          <input
            type="text"
            value={vendorCode}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Base Amount (INR)
          </label>
          <input
            type="number"
            value={baseAmount}
            onChange={(e) => setBaseAmount(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Reference No
          </label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Company
          </label>
          <select
            value={billToCompany}
            onChange={handleBillToCompanyChange}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          >
            <option value="">Select Company</option>
            {vendorOptions.map((vendor, idx) => (
              <option key={idx} value={vendor}>{vendor}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Address
          </label>
          <input
            type="text"
            value={billToAddress}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Mobile
          </label>
          <input
            type="text"
            value={billToMobile}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Email
          </label>
          <input
            type="email"
            value={billToEmail}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To GSTIN
          </label>
          <input
            type="text"
            value={billToGSTIN}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To PAN
          </label>
          <input
            type="text"
            value={billToPAN}
            readOnly
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] bg-gray-100"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-[#000000]">
            Service Description
          </label>
          <input
            type="text"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
      </div>

      <button
        onClick={generatePDF}
        className="w-full bg-[#4b0082] text-white p-2 rounded-md hover:bg-[#3f0071]"
      >
        Generate PDF
      </button>

      {/* Invoice Template */}
      <div
        ref={invoiceRef}
        className="text-sm mx-auto"
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
        <div className="flex justify-between items-center border-b border-[#000000] pb-2">
          <img
            src={assets.logo}
            alt="Arshyan Insurance Logo"
            className="h-16"
          />
          <div className="text-right text-[#000000]">
            <h1 className="font-bold text-[#000080] text-lg">
              Arshyan Insurance Marketing & Services Pvt. Ltd
            </h1>
            <p>
              Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New
              Delhi-110089
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
        <div className="bg-[#e5e7eb] text-center font-bold py-2 border-y border-[#000000] mt-2 text-[#000000]">
          TAX INVOICE
        </div>

        {/* Company & Invoice Info */}
        <div className="grid grid-cols-2 border border-[#000000] mt-2">
          <div className="p-2 text-[#000000] border-r border-[#000000]">
            <p>
              <strong>Arshyan Insurance Marketing & Services Pvt Ltd</strong>
            </p>
            <p>212, 1st Floor Block G-3, Sector-16 Rohini New Delhi-110089</p>
            <p>07ABCCA0500H1ZD</p>
            <p>ABCCA0500H</p>
          </div>
          <div className="p-2 text-[#000000]">
            <p>
              <strong>INVOICE NO:</strong> {invoiceNo}
            </p>
            <p>
              <strong>INVOICE DATE:</strong> {invoiceDate}
            </p>
          </div>
        </div>

        {/* Bill To & Vendor Info */}
        <div className="grid grid-cols-2 border border-[#000000] mt-2">
          <div className="p-2 text-[#000000] border-r border-[#000000]">
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
          <div className="p-2 text-[#000000]">
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
        <table className="w-full mt-2 border border-[#000000] text-sm">
          <thead>
            <tr className="bg-[#e5e7eb] text-[#000000]">
              <th className="border border-[#000000] p-2">Particulars</th>
              <th className="border border-[#000000] p-2">HSN/SAC</th>
              <th className="border border-[#000000] p-2">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#000000] p-2 text-[#000000]">
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
              <td className="border border-[#000000] p-2 text-center text-[#000000]">
                <div className="space-y-1">
                  <div>998311</div>
                  <div>CGST 9%</div>
                  <div>SGST 9%</div>
                </div>
              </td>
              <td className="border border-[#000000] p-2 text-right text-[#000000]">
                <div className="space-y-1">
                  <div>₹ {baseAmount}</div>
                  <div>₹ {cgst}</div>
                  <div>₹ {sgst}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-[#000000] p-2"></td>
              <td className="border border-[#000000] p-2 font-bold text-right text-[#000000]">
                Total Amount
              </td>
              <td className="border border-[#000000] p-2 font-bold text-right text-[#000000]">
                ₹ {totalAmount}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border border-[#000000] p-2 mt-2 text-[#000000]">
          {numberToWords(totalAmount)}
        </div>

        {/* Bank Details & Sign */}
        <div className="grid grid-cols-2 border border-[#000000] mt-2">
          <div className="p-2 text-[#000000] border-r border-[#000000]">
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
          <div className="p-2 text-right text-[#000000] flex flex-col justify-end">
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