// src/components/InvoiceGenerator.jsx
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import assets from "../../assets/assets";

const InvoiceGenerator = () => {
  // ------------------- STATE -------------------
  const [vendors, setVendors] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [vendorForm, setVendorForm] = useState({
    name: "", gst: "", pan: "", address: "", mobile: "", email: "", stateCode: ""
  });
  const [editingVendor, setEditingVendor] = useState(null); // <-- THIS CONTROLS EDIT MODE

  const [form, setForm] = useState({
    customerName: "",
    refNo: "OG-26-1149-4014-00000028",
    baseAmount: 7626,
    billToCompany: "",
    serviceDescription: "Mobile Insurance - Services",
  });

  const [billTo, setBillTo] = useState({
    address: "", mobile: "", email: "", gstin: "", pan: ""
  });

  const invoiceRef = useRef();
  const previewRef = useRef();

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // ------------------- FETCH DATA -------------------
  useEffect(() => {
    fetchVendors();
    fetchNextInvoiceNo();
  }, []);

  const fetchVendors = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    try {
      const res = await fetch(`${API_BASE}/api/invoice/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Fetch vendors failed:", err);
        alert(`Failed to load vendors: ${err.msg || res.status}`);
        return;
      }

      const data = await res.json();
      setVendors(data);
    } catch (e) {
      console.error("Network error:", e);
      alert("Network error. Check backend.");
    }
  };

  const fetchNextInvoiceNo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/invoice/next-invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const { invoiceNo } = await res.json();
      setInvoiceNo(invoiceNo);
    } catch (e) {
      console.error("fetchNextInvoiceNo error", e);
    }
  };

  // ------------------- EDIT VENDOR -------------------
  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      name: vendor.name,
      gst: vendor.gst || "",
      pan: vendor.pan || "",
      address: vendor.address || "",
      mobile: vendor.mobile || "",
      email: vendor.email || "",
      stateCode: vendor.stateCode || "",
    });
    window.scrollTo(0, 0); // Scroll to form
  };

  const cancelEdit = () => {
    setEditingVendor(null);
    setVendorForm({ name: "", gst: "", pan: "", address: "", mobile: "", email: "", stateCode: "" });
  };

  // ------------------- DELETE VENDOR -------------------
  const handleDeleteVendor = async (id) => {
    if (!confirm("Delete this vendor?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/invoice/vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchVendors();
    } catch (e) {
      alert("Delete failed");
    }
  };

  // ------------------- BILL-TO LOGIC -------------------
  const handleBillToCompanyChange = (e) => {
    const company = e.target.value;
    setForm({ ...form, billToCompany: company });
    const v = vendors.find((v) => v.name === company);
    setBillTo(
      v
        ? {
            address: v.address || "",
            mobile: v.mobile || "",
            email: v.email || "",
            gstin: v.gst || "",
            pan: v.pan || "",
          }
        : { address: "", mobile: "", email: "", gstin: "", pan: "" }
    );
    generatePreview();
  };

  // ------------------- VENDOR CRUD -------------------
  const handleAddOrUpdateVendor = async () => {
    if (!vendorForm.name) return alert("Vendor name is required");
    const token = localStorage.getItem("token");
    const url = editingVendor
      ? `${API_BASE}/api/invoice/vendors/${editingVendor._id}`
      : `${API_BASE}/api/invoice/vendors`;
    const method = editingVendor ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || "Failed");
      }
      cancelEdit();
      fetchVendors();
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  // ------------------- LIVE PREVIEW -------------------
  const generatePreview = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 595,
        height: 842,
      });
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      console.error("preview error", e);
    }
  };
  useEffect(() => {
    const t = setTimeout(generatePreview, 300);
    return () => clearTimeout(t);
  }, [form, billTo, invoiceNo]);

  // ------------------- GENERATE PDF -------------------
  const generatePDF = async () => {
    if (!form.billToCompany) return alert("Select Bill To Company");

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 595,
        height: 842,
      });

      const imgData = canvas.toDataURL("image/png");

      const invoiceData = {
        invoiceNo,
        date: new Date().toLocaleDateString("en-GB").split("/").join("-"),
        vendorCode: vendors.find((v) => v.name === form.billToCompany)?.code || "",
        customerName: form.customerName,
        refNo: form.refNo,
        baseAmount: form.baseAmount,
        cgst: Math.round(form.baseAmount * 0.09),
        sgst: Math.round(form.baseAmount * 0.09),
        totalAmount: Math.round(form.baseAmount * 1.18),
        billTo: { company: form.billToCompany, ...billTo },
        serviceDescription: form.serviceDescription,
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/invoice/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ html: imgData, invoiceData }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const txt = await res.text();
        throw new Error("Server error (check payload size)");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || `HTTP ${res.status}`);

      alert("PDF saved successfully!");
      fetchNextInvoiceNo();
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
  };

  // ------------------- UTILS -------------------
  const numberToWords = (num) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven1", "Eight", "Nine"];
    const b = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const c = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const d = ["", "Thousand", "Million"];
    const convert = (n) => {
      if (n === 0) return "";
      if (n < 10) return a[n];
      if (n < 20) return b[n - 10];
      if (n < 100) return c[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    };
    let words = "", i = 0;
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk) words = convert(chunk) + (d[i] ? " " + d[i] : "") + (words ? " " + words : "");
      num = Math.floor(num / 1000);
      i++;
    }
    return "Rupees " + words + " Only";
  };

  const cgst = Math.round(form.baseAmount * 0.09);
  const sgst = Math.round(form.baseAmount * 0.09);
  const totalAmount = form.baseAmount + cgst + sgst;

  // ------------------- JSX -------------------
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">Generate Invoice</h2>

      {/* ---------- VENDOR FORM ---------- */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="font-bold mb-2">
          {editingVendor ? `Edit Vendor: ${editingVendor.name}` : "Add New Vendor"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["name","gst","pan","address","mobile","email","stateCode"].map(f=>(
            <input
              key={f}
              placeholder={f.toUpperCase()}
              value={vendorForm[f]}
              onChange={e=>setVendorForm({...vendorForm,[f]:e.target.value})}
              className="border p-2 rounded text-sm"
            />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={handleAddOrUpdateVendor} className="bg-indigo-600 text-white px-4 py-2 rounded">
            {editingVendor ? "Update" : "Add"} Vendor
          </button>
          {editingVendor && (
            <button onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ---------- VENDOR LIST ---------- */}
      <div className="border p-4 rounded bg-blue-50">
        <h3 className="font-bold mb-2">Vendors ({vendors.length})</h3>
        {vendors.length === 0 ? (
          <p className="text-gray-500 text-sm">No vendors yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vendors.map((v) => (
              <div key={v._id} className="border p-3 rounded bg-white text-sm">
                <div><strong>{v.name}</strong> ({v.code})</div>
                <div>{v.mobile} | {v.email}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEditVendor(v)}
                    className="text-blue-600 underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(v._id)}
                    className="text-red-600 underline text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- INVOICE FORM ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input value={invoiceNo} readOnly className="border p-2 bg-gray-100" placeholder="Invoice No" />
        <input value={new Date().toLocaleDateString("en-GB").split("/").join("-")} readOnly className="border p-2 bg-gray-100" placeholder="Date" />
        <input value={vendors.find(v=>v.name===form.billToCompany)?.code||""} readOnly className="border p-2 bg-gray-100" placeholder="Vendor Code" />
        <input value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} className="border p-2" placeholder="Customer Name" />
        <input type="number" value={form.baseAmount} onChange={e=>setForm({...form,baseAmount:parseInt(e.target.value)||0})} className="border p-2" placeholder="Base Amount" />
        <input value={form.refNo} readOnly className="border p-2 bg-gray-100" placeholder="Ref No" />
        <select value={form.billToCompany} onChange={handleBillToCompanyChange} className="border p-2">
          <option value="">Select Vendor</option>
          {vendors.map(v=><option key={v._id} value={v.name}>{v.name}</option>)}
        </select>
        {["address","mobile","email","gstin","pan"].map(k=>(
          <input key={k} value={billTo[k]} readOnly className="border p-2 bg-gray-100" placeholder={k.charAt(0).toUpperCase()+k.slice(1)} />
        ))}
        <input value={form.serviceDescription} onChange={e=>setForm({...form,serviceDescription:e.target.value})} className="border p-2 sm:col-span-2" placeholder="Service Description" />
      </div>

      <button onClick={generatePDF} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded text-lg font-medium transition">
        Generate & Save PDF
      </button>

      {/* ---------- LIVE PREVIEW ---------- */}
      {previewUrl && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Live Preview</h3>
          <img src={previewUrl} alt="preview" className="w-full border shadow-sm" style={{ maxWidth: "595px" }} />
        </div>
      )}

      {/* ---------- HIDDEN A4 TEMPLATE (PDF) ---------- */}
      <div ref={invoiceRef} style={{ position: "absolute", left: "-9999px", top: 0, width: "595px", height: "842px", background: "#fff", padding: "20px", boxSizing: "border-box", fontSize: "11px", lineHeight: "1.3", fontFamily: "Arial, sans-serif" }}>
        <InvoiceTemplate invoiceNo={invoiceNo} form={form} billTo={billTo} vendors={vendors} cgst={cgst} sgst={sgst} totalAmount={totalAmount} numberToWords={numberToWords} />
      </div>

      <div ref={previewRef} style={{ position: "absolute", left: "-9999px", top: 0, width: "595px", height: "842px", background: "#fff", padding: "20px", boxSizing: "border-box", fontSize: "11px", lineHeight: "1.3", fontFamily: "Arial, sans-serif" }}>
        <InvoiceTemplate invoiceNo={invoiceNo} form={form} billTo={billTo} vendors={vendors} cgst={cgst} sgst={sgst} totalAmount={totalAmount} numberToWords={numberToWords} />
      </div>
    </div>
  );
};

/* ==================== INVOICE TEMPLATE ==================== */
const InvoiceTemplate = ({ invoiceNo, form, billTo, vendors, cgst, sgst, totalAmount, numberToWords }) => (
  <div style={{ width: "100%", height: "100%" }}>

    {/* ----- HEADER ----- */}
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #000", paddingBottom: "6px" }}>
      <img src={assets.logo} alt="Logo" style={{ height: "55px" }} />
      <div style={{ textAlign: "right", fontSize: "10px" }}>
        <strong style={{ fontSize: "14px", color: "#1e40af" }}>
          Arshyan Insurance Marketing & Services Pvt. Ltd
        </strong><br />
        Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New Delhi-110089<br />
        Tel (+9111-43592951), E-mail: sales.support@arshyaninsurance.com<br />
        website: www.arshyaninsurance.com | CIN: U66290DL2025PTC441715
      </div>
    </div>

    {/* ----- TITLE ----- */}
    <div style={{
      backgroundColor: "#f3f4f6",
      textAlign: "center",
      fontWeight: "bold",
      padding: "6px",
      marginTop: "6px",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
    }}>
      TAX INVOICE
    </div>

    {/* ----- COMPANY & INVOICE INFO ----- */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #000", marginTop: "6px" }}>
      <div style={{ padding: "6px", borderRight: "1px solid #000", fontSize: "10px" }}>
        <strong>Arshyan Insurance Marketing & Services Pvt Ltd</strong><br />
        212, 1st Floor Block G-3, Sector-16 Rohini New Delhi-110089<br />
        07ABCCA0500H1ZD<br />
        ABCCA0500H
      </div>
      <div style={{ padding: "6px", fontSize: "10px" }}>
        <strong>INVOICE NO:</strong> {invoiceNo}<br />
        <strong>INVOICE DATE:</strong> {new Date().toLocaleDateString("en-GB").split("/").join("-")}
      </div>
    </div>

    {/* ----- BILL TO ----- */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #000", marginTop: "6px" }}>
      <div style={{ padding: "6px", borderRight: "1px solid #000", fontSize: "10px" }}>
        <strong>Bill To</strong><br />
        {form.billToCompany}<br />
        {billTo.address}<br />
        <strong>Mobile:</strong> {billTo.mobile}<br />
        <strong>Email:</strong> {billTo.email}<br />
        <strong>GSTIN:</strong> {billTo.gstin}<br />
        <strong>PAN:</strong> {billTo.pan}
      </div>
      <div style={{ padding: "6px", fontSize: "10px" }}>
        <strong>Vendor Code:</strong> {vendors.find(v=>v.name===form.billToCompany)?.code || ""}<br />
        <strong>State Name:</strong> Delhi<br />
        <strong>State Code:</strong> 07
      </div>
    </div>

    {/* ----- TABLE ----- */}
    <table style={{ width: "100%", marginTop: "6px", borderCollapse: "collapse", fontSize: "10px" }}>
      <thead>
        <tr style={{ backgroundColor: "#f3f4f6" }}>
          <th style={{ border: "1px solid #000", padding: "6px" }}>Particulars</th>
          <th style={{ border: "1px solid #000", padding: "6px" }}>HSN/SAC</th>
          <th style={{ border: "1px solid #000", padding: "6px" }}>Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: "1px solid #000", padding: "6px" }}>
            {form.serviceDescription}<br />
            <strong>Customer Name:</strong> {form.customerName}<br />
            <strong>Ref No:</strong> {form.refNo}
          </td>
          <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
            998311<br />
            CGST 9%<br />
            SGST 9%
          </td>
          <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>
            ₹ {form.baseAmount.toLocaleString("en-IN")}<br />
            ₹ {cgst.toLocaleString("en-IN")}<br />
            ₹ {sgst.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style={{ border: "1px solid #000", padding: "6px" }}></td>
          <td style={{ border: "1px solid #000", padding: "6px", fontWeight: "bold", textAlign: "right" }}>
            Total Amount
          </td>
          <td style={{ border: "1px solid #000", padding: "6px", fontWeight: "bold", textAlign: "right" }}>
            ₹ {totalAmount.toLocaleString("en-IN")}
          </td>
        </tr>
      </tbody>
    </table>

    {/* ----- AMOUNT IN WORDS ----- */}
    <div style={{ border: "1px solid #000", padding: "6px", marginTop: "6px", fontSize: "10px" }}>
      {numberToWords(totalAmount)}
    </div>

    {/* ----- BANK & SIGNATURE ----- */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #000", marginTop: "6px" }}>
      <div style={{ padding: "6px", borderRight: "1px solid #000", fontSize: "10px" }}>
        <strong>COMPANY BANK ACCOUNT DETAILS :-</strong><br />
        <strong>NAME:</strong> ARSHYAN INSURANCE MARKETING & SERVICES PVT LTD<br />
        <strong>BANK NAME:</strong> RBL BANK LTD<br />
        <strong>CURRENT A/C NO:</strong> 409002419528<br />
        <strong>IFSC CODE:</strong> RATN0000559<br />
        <strong>ADDRESS:</strong> Sector-7 Rohini Delhi-110085
      </div>
      <div style={{ padding: "6px", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end", gap: "4px" }}>
        <p style={{ margin: 0, fontSize: "10px" }}>For Arshyan Insurance Marketing & Service Pvt Ltd</p>
        <img src={assets.stamp} alt="Stamp" style={{ width: "110px", height: "110px", objectFit: "contain" }} />
        <p style={{ margin: 0, fontSize: "10px" }}><strong>Authorised Signatory</strong></p>
      </div>
    </div>
  </div>
);

export default InvoiceGenerator;