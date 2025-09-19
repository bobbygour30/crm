import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceGenerator = () => {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [customerName, setCustomerName] = useState('Mr.Vaibhav Goyal');
  const [refNo, setRefNo] = useState('OG-26-1149-4014-00000028');

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Arshyan Insurance Marketing & Services Pvt Ltd', 20, 20);
    doc.text('212, 1st Floor Block G-3, Sector-16 Rohini New Delhi-110089', 20, 30);
    doc.text(`INVOICE NO:- ${invoiceNo}`, 120, 20);
    doc.text(`INVOICE DATE:- ${invoiceDate || '02-Sep-25'}`, 120, 30); // Default to current date if empty
    doc.text('07ABCCA0500H1ZD', 20, 40);
    doc.text('ABCCA0500H', 20, 50);
    doc.text('Bill To', 20, 60);
    doc.text('M/s. Mobile Master', 20, 70);
    doc.text('H-4/12, Sector 16, Rohini, Delhi, 110089', 20, 80);
    doc.text('Mobile No: +91-9871625373, Email ID: sunnyscrud85@gmail.com', 20, 90);
    doc.text('GSTIN:- 07AKVPG9548E1ZM', 20, 100);
    doc.text('PAN No. AKVPG9548E', 20, 110);
    doc.text(`Vendor Code : ${vendorCode}`, 120, 60);
    doc.text('State Name : Delhi', 120, 70);
    doc.text('State Code : 07', 120, 80);
    doc.text('Particulars', 20, 130);
    doc.text('Mobile Insurance- Services', 20, 140);
    doc.text(`Customer Name : ${customerName}`, 20, 150);
    doc.text(`Ref No. ${refNo}`, 20, 160);

    autoTable(doc, {
      startY: 170,
      head: [['HSN/SAC', 'Amount (INR)']],
      body: [
        ['998311', '₹ 7,626.00'],
        ['CGST 9%', '₹ 686.34'],
        ['SGST 9%', '₹ 686.34'],
        ['Total Amount', '₹ 8,999']
      ]
    });

    doc.text('Rupees Eight Thousand Nine Hundred NinetyEight Paise SixtyEight Only', 20, 250);
    doc.text('COMPANY BANK ACCOUNT DETAILS:-', 20, 260);
    doc.text('NAME : ARSHYAN INSURANCE MARKETING & SERVICES PVT LTD', 20, 270);
    doc.text('BANK NAME : RBL BANK LTD', 20, 280);
    doc.text('CURRENT A/C NO : 409002419528', 20, 290);
    doc.text('IFSC CODE : RATN0000559', 20, 300);
    doc.text('ADDRESS : Sector-7 Rohini Delhi-110085', 20, 310);
    doc.text('For Arshyan Insurance Marketing & Service Pvt Ltd', 20, 320);
    doc.text('Authorised Signatory', 20, 330);

    doc.save('invoice.pdf');
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Generate Invoice</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Invoice No</label>
        <input
          type="text"
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., ARYN/2025-26/204"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
        <input
          type="text"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., 02-Sep-25"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Vendor Code</label>
        <input
          type="text"
          value={vendorCode}
          onChange={(e) => setVendorCode(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., 110089103"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., Mr.Vaibhav Goyal"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Reference No</label>
        <input
          type="text"
          value={refNo}
          onChange={(e) => setRefNo(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., OG-26-1149-4014-00000028"
        />
      </div>
      <button
        onClick={generatePDF}
        className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
      >
        Generate PDF
      </button>
    </div>
  );
};

export default InvoiceGenerator;