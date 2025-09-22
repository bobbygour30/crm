import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import assets from "../../assets/assets"; // Ensure your logo is correctly imported

const InvoiceGenerator = () => {
  const [invoiceNo, setInvoiceNo] = useState("ARYN/2025-26/204");
  const [invoiceDate, setInvoiceDate] = useState("24-Jul-25");
  const [vendorCode, setVendorCode] = useState("110089103");
  const [customerName, setCustomerName] = useState("Mr. Vaibhav Goyal");
  const [refNo, setRefNo] = useState("OG-26-1149-4014-00000028");
  const [baseAmount, setBaseAmount] = useState(7626.0); // Default base amount
  const [billToCompany, setBillToCompany] = useState("M/s. Mobile Master");
  const [billToAddress, setBillToAddress] = useState("H-4/12, Sector 16, Rohini, Delhi, 110089");
  const [billToMobile, setBillToMobile] = useState("+91-9871625373");
  const [billToEmail, setBillToEmail] = useState("sunnyscrud85@gmail.com");
  const [billToGSTIN, setBillToGSTIN] = useState("07AKVPG9548E1ZM");
  const [billToPAN, setBillToPAN] = useState("AKVPG9548E");
  const [serviceDescription, setServiceDescription] = useState("Mobile Insurance - Services");
  const invoiceRef = useRef();

  // Function to convert number to words
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

    const [integerPart, decimalPart = "0"] = num.toFixed(2).split(".");
    let words = "";
    let numInt = parseInt(integerPart);

    if (numInt === 0) {
      words = "Zero";
    } else {
      let i = 0;
      while (numInt > 0) {
        if (numInt % 1000 !== 0) {
          words = convertLessThanThousand(numInt % 1000) + (thousands[i] ? " " + thousands[i] : "") + (words ? " " + words : "");
        }
        numInt = Math.floor(numInt / 1000);
        i++;
      }
    }

    const paise = parseInt(decimalPart);
    let paiseWords = "";
    if (paise > 0) {
      paiseWords = convertLessThanThousand(paise) + " Paise";
    }

    return "Rupees " + words + (paiseWords ? " and " + paiseWords : "") + " Only";
  };

  // Calculate CGST, SGST, and Total Amount
  const cgst = baseAmount * 0.09;
  const sgst = baseAmount * 0.09;
  const totalAmount = baseAmount + cgst + sgst;

  const convertOklchToRgb = (element) => {
    const walker = document.createTreeWalker(element, Node.ELEMENT_NODE);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const computedStyle = window.getComputedStyle(node);
      const properties = ["color", "backgroundColor", "borderColor"];
      properties.forEach((prop) => {
        const value = computedStyle[prop];
        if (value.includes("oklch")) {
          node.style[prop] = "#000000"; // Fallback to black for unsupported oklch
        }
      });
    }
  };

  const generatePDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      convertOklchToRgb(element);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#000000]">
        Generate Invoice
      </h2>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Invoice No
          </label>
          <input
            type="text"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
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
            onChange={(e) => setVendorCode(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
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
            onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)}
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
          <input
            type="text"
            value={billToCompany}
            onChange={(e) => setBillToCompany(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Address
          </label>
          <input
            type="text"
            value={billToAddress}
            onChange={(e) => setBillToAddress(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Mobile
          </label>
          <input
            type="text"
            value={billToMobile}
            onChange={(e) => setBillToMobile(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To Email
          </label>
          <input
            type="email"
            value={billToEmail}
            onChange={(e) => setBillToEmail(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To GSTIN
          </label>
          <input
            type="text"
            value={billToGSTIN}
            onChange={(e) => setBillToGSTIN(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Bill To PAN
          </label>
          <input
            type="text"
            value={billToPAN}
            onChange={(e) => setBillToPAN(e.target.value)}
            className="mt-1 block w-full border border-[#000000] rounded-md shadow-sm text-[#000000] focus:ring-[#4b0082] focus:border-[#4b0082]"
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
        className="mt-8 border border-[#000000] text-sm p-4 mx-auto"
        style={{ width: "800px", minHeight: "1120px", background: "#ffffff", margin: "0 auto", padding: "20px" }}
      >
        <div className="text-center mb-4">
          <img src={assets.logo} alt="Arshyan Insurance Logo" className="h-16 mx-auto mb-2" />
          <h1 className="font-bold text-[#000080] text-xl">Arshyan Insurance Marketing & Services Pvt. Ltd</h1>
          <p className="text-[#000000]">
            Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New Delhi-110089
          </p>
          <p className="text-[#000000]">Tel (+9111-43592951), E-mail: sales.support@arshyaninsurance.com</p>
          <p className="text-[#000000]">
            website: www.arshyaninsurance.com | CIN: U66290DL2025PTC441715
          </p>
        </div>

        <div className="bg-[#e5e7eb] text-center font-bold py-2 border-y border-[#000000] text-[#000000]">
          TAX INVOICE
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-[#000000]">
            <p><strong>Arshyan Insurance Marketing & Services Pvt Ltd</strong></p>
            <p>212, 1st Floor Block G-3, Sector-16 Rohini New Delhi-110089</p>
            <p>07ABCCA0500H1ZD</p>
            <p>ABCCA0500H</p>
          </div>
          <div className="text-[#000000]">
            <p><strong>INVOICE NO:</strong> {invoiceNo}</p>
            <p><strong>INVOICE DATE:</strong> {invoiceDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-[#000000]">
            <p><strong>Bill To</strong></p>
            <p>{billToCompany}</p>
            <p>{billToAddress}</p>
            <p><strong>Mobile:</strong> {billToMobile}</p>
            <p><strong>Email:</strong> {billToEmail}</p>
            <p><strong>GSTIN:</strong> {billToGSTIN}</p>
            <p><strong>PAN:</strong> {billToPAN}</p>
          </div>
          <div className="text-[#000000]">
            <p><strong>Vendor Code:</strong> {vendorCode}</p>
            <p><strong>State Name:</strong> Delhi</p>
            <p><strong>State Code:</strong> 07</p>
          </div>
        </div>

        <table className="w-full mt-4 border border-[#000000] text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#000000] p-2 text-[#000000]"><strong>Particulars</strong></th>
              <th className="border border-[#000000] p-2 text-[#000000]"><strong>HSN/SAC</strong></th>
              <th className="border border-[#000000] p-2 text-[#000000]"><strong>Amount (INR)</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#000000] p-2 text-[#000000]">
                {serviceDescription}<br />
                <strong>Customer Name:</strong> {customerName}<br />
                <strong>Ref No:</strong> {refNo}
              </td>
              <td className="border border-[#000000] p-2 text-[#000000] text-center">
                998311<br />
                CGST 9%<br />
                SGST 9%
              </td>
              <td className="border border-[#000000] p-2 text-[#000000] text-right">
                ₹ {baseAmount.toFixed(2)}<br />
                ₹ {cgst.toFixed(2)}<br />
                ₹ {sgst.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border border-[#000000] p-2"></td>
              <td className="border border-[#000000] p-2 text-[#000000] font-bold text-right"><strong>Total Amount</strong></td>
              <td className="border border-[#000000] p-2 text-[#000000] font-bold text-right">₹ {totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="border-y border-[#000000] p-2 mt-4 text-[#000000]">
          {numberToWords(totalAmount)}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-[#000000]">
            <p><strong>COMPANY BANK ACCOUNT DETAILS :-</strong></p>
            <p><strong>NAME:</strong> ARSHYAN INSURANCE MARKETING & SERVICES PVT LTD</p>
            <p><strong>BANK NAME:</strong> RBL BANK LTD</p>
            <p><strong>CURRENT A/C NO:</strong> 409002419528</p>
            <p><strong>IFSC CODE:</strong> RATN0000559</p>
            <p><strong>ADDRESS:</strong> Sector-7 Rohini Delhi-110085</p>
          </div>
          <div className="text-right text-[#000000]">
            <p>For Arshyan Insurance Marketing & Service Pvt Ltd</p>
            <div className="h-12" /> {/* Space for stamp/sign */}
            <p><strong>Authorised Signatory</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;