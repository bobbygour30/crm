// src/components/WelcomeLetterGenerator.jsx
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import assets from "../../assets/assets";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

const useToast = () => {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  return { toast, show: (msg) => setToast(msg) };
};

// Utility: format date YYYY-MM-DD -> DD-MM-YYYY
const formatDisplayDate = (isoDate) => {
  if (!isoDate) return "____/__/____";
  try {
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return isoDate;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  } catch (e) {
    return isoDate;
  }
};

// Utility: today's date in YYYY-MM-DD
const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* -----------------------
   Const arrays (GST & Insurers)
   ----------------------- */
const gstOptions = [0, 5, 12, 18];

const insurerOptions = [
  "BAJAJ GENERAL INSURANCE LIMITED",
  "Tata Aig General Insurance Co Ltd",
];

// Premium Data
const premiumWithGST = {
  "0-20000": { 1: 2000, 2: 4620, 3: 7638 },
  "20001-30000": { 1: 2821, 2: 5313, 3: 7929 },
  "30001-35000": { 1: 3126, 2: 5937, 3: 8578 },
  "35001-50000": { 1: 3500, 2: 6373, 3: 9489 },
  "50001-75000": { 1: 5313, 2: 8749, 3: 11698 },
  "75001-100000": { 1: 6248, 2: 10748, 3: 14298 },
  "100001-125000": { 1: 7210, 2: 13709, 3: 20345 },
  "125001-150000": { 1: 8054, 2: 15599, 3: 23099 },
  "150001-200000": { 1: 11698, 2: 21348, 3: 33799 },
  "200001-250000": { 1: 14298, 2: 25998, 3: 40298 },
};

const netPremiumData = {
  "0-20000": { 1: 1695, 2: 3915, 3: 6473 },
  "20001-30000": { 1: 2391, 2: 4503, 3: 6719.5 },
  "30001-35000": { 1: 2649, 2: 5031, 3: 7270 },
  "35001-50000": { 1: 2966, 2: 5401, 3: 8042 },
  "50001-75000": { 1: 4503, 2: 7414, 3: 9913.5 },
  "75001-100000": { 1: 5295, 2: 9109, 3: 12117 },
  "100001-125000": { 1: 6110, 2: 11618, 3: 17241.5 },
  "125001-150000": { 1: 6825, 2: 13219, 3: 19576 },
  "150001-200000": { 1: 9913.8, 2: 18092, 3: 28643 },
  "200001-250000": { 1: 12117, 2: 22032, 3: 34151 },
};

// Page Styles
const pageContainerStyle = {
  background: "#ffffff",
  width: "794px",
  height: "1123px",
  margin: "0 auto",
  position: "relative",
  boxSizing: "border-box",
  overflow: "hidden",
  padding: "38px 40px",
  border: "6px double #000",
};

const pageFontBase = {
  fontFamily: "'Times New Roman', Times, serif",
  color: "#111111",
  fontSize: "12px",
  lineHeight: 1.55,
};

const PageHeader = ({ small }) => (
  <div style={{ marginBottom: small ? 8 : 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <img src={assets.logo} alt="Arshyan Logo" style={{ height: 48 }} />
      <div style={{ textAlign: "right", fontSize: 10, maxWidth: "62%" }}>
        <div style={{ fontWeight: 700, color: "#0f3b82", fontSize: 12 }}>Arshyan Insurance Marketing & Services Pvt. Ltd</div>
        <div>Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New Delhi-110089</div>
        <div>Tel (+9111-43592951)</div>
        <div style={{ marginTop: 4 }}>CIN: U66290DL2025PTC441715</div>
        <div style={{ marginTop: 2 }}>E-mail: sales.support@arshyaninsurance.com | website: www.arshyaninsurance.com</div>
      </div>
    </div>
    <div style={{ borderBottom: "1px solid #000", marginTop: 8 }} />
  </div>
);

const PageFooter = () => (
  <div style={{ textAlign: "center", fontSize: 9, marginTop: 20, borderTop: "1px solid #000", paddingTop: 8 }}>
    Arshyan Insurance Marketing & Services Pvt. Ltd · Office No.212, 1st Floor, Block-G3, Sector-16 Rohini New Delhi-110089 · Tel (+9111-43592951)
    <br />
    CIN: U66290DL2025PTC441715 · E-mail: sales.support@arshyaninsurance.com · website: www.arshyaninsurance.com
  </div>
);

const PageTemplate = ({ children }) => {
  return (
    <div style={pageContainerStyle}>
      <img
        src={assets.logo}
        alt="Watermark"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 380,
          opacity: 0.06,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 2, ...pageFontBase }}>{children}</div>
    </div>
  );
};

// Page 1 - Customer Service Letter
const WelcomeLetterPage1 = ({ form }) => {
  return (
    <PageTemplate>
      <PageHeader />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, marginBottom: 10 }}>
          <strong>Certificate No.</strong> {form.refNo}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 20 }}>
          Customer Service Letter
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{form.customerName}</div>
        <div>Address: {form.customerAddress}</div>
        <div>Pin code: {form.pincode}</div>
        <div>Mobile No: {form.customerPhone}</div>
        <div>Email id: {form.customerEmail}</div>
      </div>

      <p style={{ marginBottom: 12 }}>
        Dear Mr/Mrs. {form.customerName},
      </p>

      <p style={{ marginBottom: 10 }}>
        Congratulations on purchasing the Arshyan Portable Equipment Insurance Services, and welcome to the Arshyan family!
      </p>

      <p style={{ marginBottom: 10 }}>
        We sincerely thank you for choosing Arshyan Insurance Services and hope you enjoy the valuable benefits and support offered under your membership.
      </p>

      <p style={{ marginBottom: 10 }}>
        This Welcome Pack contains the following documents explaining all aspects of your Arshyan Portable Equipment Services:
      </p>

      <div style={{ marginLeft: 18, marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>✓ Benefit Guide – Explains the key benefits of your portable equipment insurance-related services.</div>
        <div>✓ Terms & Conditions – Details the terms and conditions of your membership, including the terms of the Equipment All Risk Insurance provided by the insurer.</div>
      </div>

      <p style={{ marginBottom: 12 }}>
        Your membership details, along with the details of the covered asset purchased by you, are mentioned overleaf.
      </p>

      <p style={{ marginBottom: 12 }}>
        Should you require any assistance regarding your membership or services, please feel free to contact us using the details provided.
      </p>

      <p style={{ marginBottom: 28 }}>
        Thank you once again for becoming a valued member of Vidhant Associates Subsidiary of Arshyan Insurance Marketing & Services Pvt. Ltd.
      </p>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <p style={{ marginBottom: 6 }}>For & on behalf of</p>
        <p style={{ marginBottom: 14, fontWeight: 700 }}>Arshyan Insurance Marketing & Services Private Limited</p>
        <img src={assets.stamp} alt="Stamp" style={{ width: 100, display: "block", margin: "0 auto 8px auto" }} />
        <div style={{ fontWeight: 700 }}>Authorized Signatory</div>
      </div>

      <PageFooter />
    </PageTemplate>
  );
};

// Page 2 - Equipment Details & Membership Details
const WelcomeLetterPage2 = ({ form }) => {
  const periodText = form.selectedPeriod === "1" ? "1 Year" : form.selectedPeriod === "2" ? "2 Years" : "3 Years";
  
  const netAmount = parseFloat(form.membership.netAmount) || 0;
  const gstPercent = parseFloat(form.membership.gstPercentage) || 18;
  const gstAmount = (netAmount * gstPercent) / 100;
  const grossAmount = netAmount + gstAmount;

  return (
    <PageTemplate>
      <PageHeader />
      
      <h3 style={{ textAlign: "center", fontWeight: 700, marginTop: 8, marginBottom: 16, fontSize: 14 }}>Equipment Details</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, fontSize: 11 }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700, width: "35%" }}>Model Type - Brand/Model</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{form.asset.brandModel}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700 }}>Serial / IMEI #</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{form.asset.imei}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700 }}>Equipment Value (INR)</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>₹ {form.valueOfEquipment}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700 }}>Equipment Purchase Date</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{formatDisplayDate(form.purchaseDate)}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ textAlign: "center", fontWeight: 700, marginTop: 16, marginBottom: 16, fontSize: 13 }}>Membership Details CUM Sales Proforma</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700, width: "35%" }}>Name of Customer</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.customerName}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Address of Customer</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.customerAddress}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Mobile No</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.customerPhone}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Email Id</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.customerEmail}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Arshyan Service Start Date</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{formatDisplayDate(form.startDate)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Arshyan Service Expiry Date</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{formatDisplayDate(form.expiryDate)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Services Tenure (Years)</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{periodText}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Arshyan Service Charges (Net)</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>₹ {netAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>GST {gstPercent}%</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>₹ {gstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Gross Amount</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>₹ {grossAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Insurer Name</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.insurerName}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Insurer Product</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.productDetail}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Insurer Ref No</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.insuranceRefNo}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <p style={{ marginBottom: 6 }}>For & on behalf of</p>
        <p style={{ marginBottom: 14, fontWeight: 700 }}>Arshyan Insurance Marketing & Services Private Limited</p>
        <img src={assets.stamp} alt="Stamp" style={{ width: 80, display: "block", margin: "0 auto" }} />
        <div style={{ fontWeight: 700 }}>Authorized Signatory</div>
      </div>

      <PageFooter />
    </PageTemplate>
  );
};

// Page 3 - Standard Terms and Conditions (Part 1)
const WelcomeLetterPage3 = ({ form }) => {
  const isBajajSelected = form.membership.insurerName === "BAJAJ GENERAL INSURANCE LIMITED";

  return (
    <PageTemplate>
      <PageHeader small />
      <h3 style={{ textAlign: "center", fontWeight: 700, marginTop: 8, marginBottom: 16, fontSize: 14 }}>
        STANDARD TERMS AND CONDITIONS
      </h3>
      
      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>1. DEFINITION</h4>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        <strong>Equipment</strong> – Your Mobile Phone or Tablet (including pad) or Laptop purchased & other portable and non-Portable electronics by you.
      </p>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        <strong>Fee</strong> – Means the amount inclusive of applicable taxes (as shown in table above) that You pay towards: (a) the Incorporation Fee, as the case may be; and (b) the Service Fee, when You purchase Your Membership. Vidhant Associates, being a subsidiary of Arshyan Insurance Marketing & Services Private Limited the right to revise its Fee at any point of time.
      </p>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        <strong>Member</strong> – The person who has purchased and who has called Vidhant Associates subsidiary of Arshyan to register for the Membership.
      </p>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        <strong>Membership</strong> - Your right to use the Service for year for which You pay the Fee, subject to these Terms & Conditions or as agreed with You from time to time.
      </p>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        <strong>Service Fee</strong> – A part of the total Fee, other than Incorporation Fee, that You pay for availing the Services.
      </p>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12, marginTop: 16 }}>Cancelling Your Membership</h4>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        1) You have a right to cancel Your Membership at any time during the period of agreement. If You exercise this right to cancel then Your Membership will be cancelled immediately and any payment of Membership Fees made by You will be refunded to You.
      </p>
      <p style={{ fontSize: 10, marginBottom: 8, marginLeft: 18 }}>
        The refund of Membership Fee will be as per the following refund grid:
      </p>
      <div style={{ marginLeft: 36, fontSize: 10, marginBottom: 12 }}>
        <div>Within 7 days: Full Membership Amount will be refunded</div>
        <div>Within 8 to 30 days: Rs. 750 will be deducted and balance membership fees will be refunded</div>
        <div>After 30 days: NIL refund of membership fees</div>
      </div>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        No refund of Fee shall be due on cancellation under any circumstances if you have used any of the features of the Service or if the cancellation notice is provided after thirty (30) days from the Start Date.
      </p>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        2) We will cancel Your Membership on written notice to You if:
      </p>
      <div style={{ marginLeft: 36, fontSize: 10, marginBottom: 12 }}>
        <div>a) We do not receive advance payment of the Fee from You on or before the date it is due; and/or</div>
        <div>b) You have at any time:</div>
        <div style={{ marginLeft: 18 }}>i. given Us false or materially incomplete information in relation to Your Membership; or</div>
        <div style={{ marginLeft: 18 }}>ii. committed a material breach of the terms and conditions of Your Membership.</div>
      </div>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12, marginTop: 16 }}>Governing law and Jurisdiction</h4>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        These terms and conditions are governed by and must be interpreted in line with the laws of the Republic of India. You and We agree that all the disputes/differences arising out of or in relation to this Agreement shall be referred to the exclusive jurisdiction of and settled only by the courts in Delhi. You and We agree that terms and all other communications will be issued in English.
      </p>

      <PageFooter />
    </PageTemplate>
  );
};

// Page 4 - Terms and Conditions (Part 2) - Complaints, Customer Consent, Indemnity, Declaration
const WelcomeLetterPage4 = ({ form }) => {
  return (
    <PageTemplate>
      <PageHeader small />
      
      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Complaints</h4>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        If at any time You want to tell Us about a problem with Your Membership please call Us on 011-43592951 (between 11 am – 9pm, Monday – Saturday) or You can write to the Complaints Manager at:
      </p>
      <p style={{ fontSize: 10, marginBottom: 8, fontStyle: "italic" }}>
        Vidhant Associates being a subsidiary of Arshyan Insurance Marketing & Services Private Limited
        <br />
        212 1st Floor Block G-3, Sector 16 Rohini New Delhi-110089
      </p>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        We will do our best to answer Your query within five (5) working days. If We cannot reply to Your complaint by then, We will send You an acknowledgement letter to keep You informed of progress.
      </p>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        If any issue which remains unresolved or unanswered for more than five (5) working days, you may escalate the matter to sales.support@arshyaninsurance.com
      </p>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        We assure You to revert to Your query within forty eight (48) hours of receipt of Your query.
      </p>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Customer consent</h4>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        We hereby authorize Arshyan Insurance Marketing & Services Private Limited (Holding of Vidhant Associates), to act as my authorized representative for the purpose of purchasing the Equipment All Risk insurance policy on my behalf, submit required documents, make initial premium payments, and receive the policy copy on my behalf. I confirm that I have understood the terms and conditions of the insurance policy, and I shall be bound by the decisions made by my authorized representative regarding this proposal. Any acts done by my representative in this regard shall be considered validly done by me. Please find attached a self-attested copy of my aadhar card and PAN card.
      </p>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        The Customer also hereby consents to the Personal Information being disclosed by Vidhant Associates subsidiary of Arshyan Insurance to any third party including any insurer, Service Partner of Vidhant Associates subsidiary of Arshyan Insurance who will be either providing the complimentary insurance or other benefit and/or services on each of the Plan(s) for the purposes of fulfilment of the services or if required by law.
      </p>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>B: General conditions</h4>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        Please read this section carefully as it contains important information. Eligibility The Service is only available to residents of India who are over the age of eighteen (18) years.
      </p>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>INDEMNITY</h4>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        The Customer hereby agrees to defend, indemnify and hold Vidhant Associated Subsidiary of Arshyan Insurance and its officers, directors, employees and subcontractors harmless from any and all losses, damages, liabilities, verdicts, settlements, judgments, costs, and expenses (including reasonable attorneys' fees) incurred by Vidhant Associated Subsidiary of Arshyan Insurance or its officers or employees arising out of:
      </p>
      <div style={{ marginLeft: 36, fontSize: 10, marginBottom: 12 }}>
        <div>a) Any wrongful act or omission of the Customer in relation to the usage of the Plan(s);</div>
        <div>b) Any wilful misconduct, gross negligence or fraud by the Customer;</div>
        <div>c) Any failure of the Customer to comply with the applicable law;</div>
        <div>d) Any breach of the representations, warranties, obligations and covenants of the Customer or a default of the Customer's obligations; and</div>
        <div>e) Any third-party claims arising out of the Customer's use of the Plan(s).</div>
      </div>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Declaration</h4>
      <p style={{ fontSize: 10, marginBottom: 12 }}>
        This is to clarify that Vidhant Associates, a subsidiary of Arshyan Insurance Marketing & Services Private Limited, is not engaged in the business of selling insurance policies. We are only providing sales support services, customer assistance, and insurance-related query & support for customers regarding their equipment. Additionally, we assist customers during the claim process for their electronic devices by helping them with documentation requirements and claim-related queries. Furthermore, Vidhant Associates does not collect or receive any insurance premium amount from customers. We only charge professional service fees, inclusive of GST, for providing insurance-related support services. It is also clarified that Vidhant Associates, being a subsidiary of Arshyan Insurance Marketing & Services Private Limited, does not issue any insurance policies directly. We only facilitate complimentary insurance coverage/products for customers' equipment, where the coverage details are provided by the authorized insurer.
      </p>

      <PageFooter />
    </PageTemplate>
  );
};

// Page 5 - Insurance Coverage, Excess, Depreciation, Exclusions (Part 1)
const WelcomeLetterPage5 = ({ form }) => {
  const exclusionsPart1 = [
    "Mis-representation, Mis-description or Non-Disclosure of any material particulars/information/facts.",
    "Damages which are Pre-existing in nature.",
    "Loss or damage to Contents due defective workmanship, material or design, latent defect, wear and tear, depreciation, moth, vermin, insects or mildew, process of cleaning, dyeing or bleaching, restoring, repairing, retouching or renovation, inherent vice, warping or shrinkage, the action of light or atmospheric conditions, natural ageing or any other gradually operating cause.",
    "Manufacturing defects in Electrical, Mechanical and Electronic Items for which the manufacturer is responsible.",
    "Loss of or damage to the property insured under this policy falling under the terms of the maintenance agreement.",
    "Dismantling, fitting adjustment, repair alteration or modification not approved by the makers/manufacturers and/or the agents of makers/manufacturers or use of such property contrary to the directives of the makers/manufacturers and/or his agents.",
    "Breakage, Cracking or Scratching of Crockery, Glass, Cameras, Binoculars, Lenses, Musical Instruments, Sports Gear and similar articles of brittle or fragile nature, unless caused by fire or accidental external means.",
    "Loss or Damage liable to be repaired or made good by a third party under any contract of agreement.",
  ];

  const isBajajSelected = form.membership.insurerName === "BAJAJ GENERAL INSURANCE LIMITED";
  const isTataSelected = form.membership.insurerName === "Tata Aig General Insurance Co Ltd";

  return (
    <PageTemplate>
      <PageHeader small />
      
      <h3 style={{ textAlign: "center", fontWeight: 700, marginTop: 8, marginBottom: 16, fontSize: 13 }}>
        Insurance Coverage provided by Insurer
      </h3>

      <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 11 }}>Coverage Details:</p>
      <div style={{ marginLeft: 18, marginBottom: 12 }}>
        <div style={{ marginBottom: 4, fontSize: 10 }}>
          <strong>Accidental Damage</strong> – damage to the equipment due to unintentional drop or collision of the Insured Product or any object falling on the Insured Product or due to accidental external means.
        </div>
        <div style={{ marginBottom: 4, fontSize: 10 }}>
          <strong>Liquid Damage</strong> – sudden and accidental spillage/entry of any form of liquid in/on the insured device.
        </div>
        <div style={{ marginBottom: 4, fontSize: 10 }}>
          <strong>Theft/Stolen</strong> – the act of stealing equipment unlawfully and it has been taken away.
        </div>
      </div>

      <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 11 }}>Excess</p>
      {isTataSelected && (
        <p style={{ fontSize: 10, marginBottom: 12, marginLeft: 18 }}>
          TATA Aig General Insurance Co Ltd, Excess: NIL
        </p>
      )}
      {isBajajSelected && (
        <p style={{ fontSize: 10, marginBottom: 12, marginLeft: 18 }}>
          Bajaj General Insurance Ltd, Excess: First 5% of each and every claim minimum INR.2500
        </p>
      )}

      <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 11 }}>Depreciation:</p>
      <p style={{ fontSize: 10, marginBottom: 12, marginLeft: 18 }}>NIL for each and Every Claim</p>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 11 }}>INSURER EXCLUSIONS</h4>
      <ol style={{ fontSize: 9, marginLeft: 18, lineHeight: 1.45, marginBottom: 12 }}>
        {exclusionsPart1.map((ex, i) => (
          <li key={i} style={{ marginBottom: 4 }}>{ex}</li>
        ))}
      </ol>

      <PageFooter />
    </PageTemplate>
  );
};

// Page 6 - Exclusions (Part 2) and Claim Settlement Process
const WelcomeLetterPage6 = ({ form }) => {
  const exclusionsPart2 = [
    "Loss of insured property from safe inside insured \"Building\", following use of the key or any duplicate thereof or access code to the safe belonging to the Insured, unless this has been obtained by threat or by violence.",
    "Loss Destruction of or Damage to articles of Consumable Nature.",
    "Loss, damage or liability arising directly or indirectly from seepage, pollution or contamination, however such seepage, pollution or contamination may have been caused.",
    "Loss damage or consequential loss directly or indirectly caused by, consisting of, or arising from: (1) Any functioning or malfunctioning of the internet or similar facility or of any intranet or private network or similar facility, (2) Any corruption, destruction, distortion, erasure or other loss or damage to data, software or any kind of programming or instruction set. (3) Loss of use or functionality whether partial or entire of data, coding, program, software, any computer or computer system or other device dependent upon any microchip or embedded logic, and any ensuing liability. This shall not exclude subsequent damage not otherwise excluded which itself results from an insured peril.",
    "Loss or damage due to theft or attempted theft by any employee of the Insured or loss or damage occasioned through the willful act of the Insured or any employee or the willful act of any other person with a connivance of the Insured or any employee unless a FIR has been lodged against the employee.",
    "Loss or damage directly or indirectly, proximately or remotely occasioned by or contributed to or traceable to or happening through in consequence of war, invasion, act of foreign enemy hostilities or war like operations (whether war be declared or not) civil war, civil commotion, mutiny, rebellion, revolution, insurrection, conspiracy, military or usurped power.",
    "Loss or damage directly or indirectly caused by or contributed to by or arising from ionizing radiations contamination by radio activity from any nuclear fuel or from any nuclear waste from the combustion of nuclear from any nuclear waste from the combustion of nuclear fuel or from any nuclear weapons material.",
    "Mysterious disappearance and Unexplained Losses.",
    "Any loss or damage to the insured property or to the general public and/ or legal liability arising out of immoral or unethical use of insured property.",
    "Damage to property not belonging to or held in trust by or in the custody or control of the Insured.",
    "Loss or damage to Contents due to Burglary or Theft where the Insured or any of the Insured's Family member is alleged to be concerned or implicated.",
    "Loss or damage howsoever caused to Pedal Cycle, Electronic and Electrical Equipments, Domestic Appliances, Clothing older than 10 Years and Portable Equipments older than 5 Years (excluding mobile phones) and Mobile Phones older than 3 years.",
    "Expenses incurred for maintenance of Electronic and Electrical Equipment and Domestic Appliances.",
  ];

  return (
    <PageTemplate>
      <PageHeader small />
      
      <ol start={9} style={{ fontSize: 9, marginLeft: 18, lineHeight: 1.45, marginBottom: 16 }}>
        {exclusionsPart2.map((ex, i) => (
          <li key={i} style={{ marginBottom: 4 }}>{ex}</li>
        ))}
      </ol>

      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 11, marginTop: 8 }}>CLAIM SETTLEMENT PROCESS</h4>
      <p style={{ fontSize: 10, marginBottom: 8 }}>
        1) Upon the happening of any event giving rise to a claim, the insured shall within 24 hours contact the Company and intimate the claim.
      </p>
      
      <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 10 }}>Documents required for all claims process:</p>
      <div style={{ marginLeft: 18, fontSize: 9, marginBottom: 12 }}>
        <div>✓ 3 photographs of the device, one showing the front, one showing the back and one showing the serial/IMEI number</div>
        <div>✓ Copy of purchase invoice</div>
        <div>✓ Details of loss</div>
        <div>✓ Claim form filled and signed by the customer</div>
        <div>✓ Repair Estimate & Service Engineer report</div>
        <div>✓ Final Repair Bill along with Payment receipt</div>
        <div>✓ Police report (FIR) for Theft and Burglary Claims</div>
        <div>✓ Copy of PAN Card and Address proof issued by Govt. of India</div>
        <div>✓ NEFT details & cancelled cheque</div>
        <div>✓ Documents to be given within 7 days of intimating claims</div>
      </div>

      <p style={{ fontSize: 10, marginBottom: 12 }}>
        On receipt of all the required information along with the claim form, the company may/shall appoint a surveyor for assessing the loss/ claim within 72 hours of the receipt of intimation from the Insured. The Insured shall allow the surveyor to inspect the lost/ damaged properties/ goods. The Insured shall assist and not hinder or prevent the surveyor in pursuance of his/ her duties. The Insured shall not abandon the insured property/ items in the premises, nor take any step to rectify/ remedy the damage before the same has been approved by the Company or the Surveyor.
      </p>

      <PageFooter />
    </PageTemplate>
  );
};

// Page 7 - Fraud and Final Signatory
const WelcomeLetterPage7 = ({ form }) => {
  return (
    <PageTemplate>
      <PageHeader small />
      
      <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Fraud</h4>
      <p style={{ fontSize: 10, marginBottom: 16 }}>
        If you or any claimant under this Policy shall make or advance any claim knowing the same to be false or Fraudulent as regards amount or otherwise, this Policy shall be void and all claims or payments hereunder shall be forfeited. Respective Insurer can also start legal proceedings against you.
      </p>

      <div style={{ textAlign: "center", marginTop: 60 }}>
        <p style={{ marginBottom: 6 }}>For & on behalf of</p>
        <p style={{ marginBottom: 14, fontWeight: 700 }}>Arshyan Insurance Marketing & Services Private Limited</p>
        <img src={assets.stamp} alt="Stamp" style={{ width: 100, display: "block", margin: "0 auto 8px auto" }} />
        <div style={{ fontWeight: 700 }}>Authorized Signatory</div>
      </div>

      <PageFooter />
    </PageTemplate>
  );
};

/* -----------------------
   Main component (export)
   ----------------------- */

const WelcomeLetterGenerator = () => {
  const [showFormFields, setShowFormFields] = useState(true);

  const [form, setForm] = useState({
    refNo: "",
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    customerPhone: "",
    pincode: "",
    asset: {
      mobileNo: "",
      brandModel: "",
      imei: "",
    },
    valueOfEquipment: "",
    selectedPeriod: "",
    insurancePremium: "",
    membership: {
      productDetail: "",
      insuranceRefNo: "",
      insurerName: "",
      serviceCharges: "",
      netAmount: "",
      gstPercentage: 18,
      totalAmount: "",
    },
    purchaseDate: "",
    startDate: "",
    expiryDate: "",
    issueDate: todayISO(),
  });

  const [autoCalcExpiry, setAutoCalcExpiry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [success, setSuccess] = useState("");

  const [letters, setLetters] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterRef, setFilterRef] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const lettersPerPage = 10;

  const page1Ref = useRef();
  const page2Ref = useRef();
  const page3Ref = useRef();
  const page4Ref = useRef();
  const page5Ref = useRef();
  const page6Ref = useRef();
  const page7Ref = useRef();

  const { toast, show } = useToast();

  const updateForm = (path, value) => {
    const keys = path.split(".");
    if (keys.length === 1) {
      setForm((p) => ({ ...p, [keys[0]]: value }));
    } else if (keys.length === 2) {
      const [a, b] = keys;
      setForm((p) => ({ ...p, [a]: { ...p[a], [b]: value } }));
    } else if (keys.length === 3) {
      const [a, b, c] = keys;
      setForm((p) => ({ ...p, [a]: { ...p[a], [b]: { ...p[a][b], [c]: value } } }));
    }
  };

  const calculatePremium = (valueOfEquipment, selectedPeriod) => {
    const numValue = parseInt(valueOfEquipment) || 0;
    const period = parseInt(selectedPeriod) || 0;
    let selectedRange = null;

    const ranges = [
      { key: "0-20000", min: 0, max: 20000 },
      { key: "20001-30000", min: 20001, max: 30000 },
      { key: "30001-35000", min: 30001, max: 35000 },
      { key: "35001-50000", min: 35001, max: 50000 },
      { key: "50001-75000", min: 50001, max: 75000 },
      { key: "75001-100000", min: 75001, max: 100000 },
      { key: "100001-125000", min: 100001, max: 125000 },
      { key: "125001-150000", min: 125001, max: 150000 },
      { key: "150001-200000", min: 150001, max: 200000 },
      { key: "200001-250000", min: 200001, max: 250000 },
    ];

    for (const range of ranges) {
      if (numValue >= range.min && numValue <= range.max) {
        selectedRange = range.key;
        break;
      }
    }

    if (selectedRange && period >= 1 && period <= 3) {
      const totalWithGST = premiumWithGST[selectedRange][period];
      const net = netPremiumData[selectedRange][period];
      setForm((prev) => ({
        ...prev,
        insurancePremium: totalWithGST,
        membership: {
          ...prev.membership,
          netAmount: net.toFixed(2),
          totalAmount: totalWithGST.toFixed(2),
          serviceCharges: `₹ ${totalWithGST}`,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        insurancePremium: "",
        membership: {
          ...prev.membership,
          netAmount: "",
          totalAmount: "",
          serviceCharges: "",
        },
      }));
    }
  };

  const calculateExpiryDate = (startDate, selectedPeriod) => {
    if (!startDate || !selectedPeriod) return "";
    
    try {
      const [y, m, d] = startDate.split("-");
      if (!y || !m || !d) return "";
      
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      const expiryDate = new Date(dt);
      expiryDate.setFullYear(dt.getFullYear() + parseInt(selectedPeriod));
      expiryDate.setDate(expiryDate.getDate() - 1);
      
      const yyyy = expiryDate.getFullYear();
      const mm = String(expiryDate.getMonth() + 1).padStart(2, "0");
      const dd = String(expiryDate.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      console.error("Error calculating expiry date:", e);
      return "";
    }
  };

  useEffect(() => {
    if (!autoCalcExpiry) return;
    if (!form.startDate || !form.selectedPeriod) return;
    
    try {
      const startDateObj = new Date(form.startDate);
      if (isNaN(startDateObj.getTime())) return;
      
      const expiryDateObj = new Date(startDateObj);
      expiryDateObj.setFullYear(startDateObj.getFullYear() + parseInt(form.selectedPeriod));
      expiryDateObj.setDate(expiryDateObj.getDate() - 1);
      
      const yyyy = expiryDateObj.getFullYear();
      const mm = String(expiryDateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(expiryDateObj.getDate()).padStart(2, "0");
      const newExpiryDate = `${yyyy}-${mm}-${dd}`;
      
      if (newExpiryDate !== form.expiryDate) {
        setForm(prev => ({ ...prev, expiryDate: newExpiryDate }));
      }
    } catch (error) {
      console.error("Error calculating expiry date:", error);
    }
  }, [form.startDate, form.selectedPeriod, autoCalcExpiry]);

  useEffect(() => {
    const net = parseFloat(form.membership.netAmount || 0);
    const gst = parseFloat(form.membership.gstPercentage || 0);
    if (isNaN(net)) return;
    const total = net + (net * gst) / 100;
    const displayTotal = `₹ ${Number(total).toFixed(2)}`;
    setForm((p) => ({
      ...p,
      membership: {
        ...p.membership,
        totalAmount: total.toFixed(2),
        serviceCharges: displayTotal,
      },
    }));
  }, [form.membership.netAmount, form.membership.gstPercentage]);

  const fetchLetters = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/letter/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLetters(data.letters || []);
      else setLetters([]);
    } catch (err) {
      console.error("Error fetching letters:", err);
    }
  };

  const fetchNextRef = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/letter/next-ref`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.nextRef) {
        setForm((p) => ({ ...p, refNo: data.nextRef }));
      }
    } catch (err) {
      console.error("Error fetching next ref:", err);
    }
  };

  useEffect(() => {
    fetchNextRef();
    fetchLetters();
  }, []);

  const validateFormBeforeGenerate = () => {
    if (!form.customerName || !form.customerEmail || !form.customerPhone || !form.customerAddress) {
      alert("Please fill all required fields (Customer Name, Email, Phone, Address).");
      return false;
    }

    if (form.valueOfEquipment === "" || form.selectedPeriod === "") {
      alert("Please fill Value of Equipment and select Service Tenure.");
      return false;
    }

    if (form.membership.netAmount === "" || form.membership.netAmount === null) {
      const ok = window.confirm("Net amount is empty. Do you want to proceed?");
      if (!ok) return false;
    }

    if (form.startDate && form.expiryDate) {
      const sd = new Date(form.startDate);
      const ed = new Date(form.expiryDate);

      if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
        alert("Please provide valid start and expiry dates.");
        return false;
      }

      if (ed.getTime() <= sd.getTime()) {
        const ok = window.confirm("Expiry date is not after start date. Do you want to proceed?");
        if (!ok) return false;
      }
    }

    return true;
  };

  const generatePDF = async () => {
    if (!validateFormBeforeGenerate()) return;

    setLoading(true);
    setSuccess("");
    setPdfUrl("");

    try {
      const pageRefs = [page1Ref, page2Ref, page3Ref, page4Ref, page5Ref, page6Ref, page7Ref];
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      });

      for (let i = 0; i < pageRefs.length; i++) {
        const element = pageRefs[i].current;
        if (!element) throw new Error(`Page ${i + 1} ref not found`);

        const originalOverflow = element.style.overflow;
        const originalPosition = element.style.position;
        const originalLeft = element.style.left;
        const originalTop = element.style.top;

        element.style.overflow = 'visible';
        element.style.position = 'relative';
        element.style.left = '0';
        element.style.top = '0';

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 794,
          windowHeight: 1123,
        });

        element.style.overflow = originalOverflow;
        element.style.position = originalPosition;
        element.style.left = originalLeft;
        element.style.top = originalTop;

        const imgData = canvas.toDataURL("image/png", 1.0);
        
        if (i > 0) {
          pdf.addPage([794, 1123]);
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123, undefined, 'FAST');
      }

      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/letter/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdfBase64: pdfBase64,
          letterData: {
            refNo: form.refNo,
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerAddress: form.customerAddress,
            customerPhone: form.customerPhone,
            pincode: form.pincode,
            valueOfEquipment: form.valueOfEquipment,
            selectedPeriod: form.selectedPeriod,
            insurancePremium: form.insurancePremium,
            asset: {
              mobileNo: form.asset.mobileNo,
              brandModel: form.asset.brandModel,
              imei: form.asset.imei,
            },
            membership: {
              productDetail: form.membership.productDetail,
              insuranceRefNo: form.membership.insuranceRefNo,
              insurerName: form.membership.insurerName,
              serviceCharges: form.membership.serviceCharges,
              netAmount: form.membership.netAmount,
              gstPercentage: form.membership.gstPercentage,
              totalAmount: form.membership.totalAmount,
            },
            purchaseDate: form.purchaseDate,
            startDate: form.startDate,
            expiryDate: form.expiryDate,
            issueDate: form.issueDate,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to generate");

      setPdfUrl(data.pdfUrl);
      setSuccess("Welcome Letter Generated & Saved Successfully!");

      const generatedRef = data.refNo || form.refNo;
      show(`Letter ${generatedRef} generated successfully!`);

      await fetchLetters();
      await fetchNextRef();
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this welcome letter? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/letter/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        show("Deleted successfully");
        await fetchLetters();
      } else {
        throw new Error(data.msg || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + err.message);
    }
  };

  const handleFilterName = (e) => {
    setFilterName(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterRef = (e) => {
    setFilterRef(e.target.value);
    setCurrentPage(1);
  };

  const filteredLetters = letters.filter(
    (l) =>
      l.customerName.toLowerCase().includes(filterName.toLowerCase()) &&
      l.refNo.toLowerCase().includes(filterRef.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredLetters.length / lettersPerPage));
  const indexOfLast = currentPage * lettersPerPage;
  const indexOfFirst = indexOfLast - lettersPerPage;
  const currentLetters = filteredLetters.slice(indexOfFirst, indexOfLast);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      updateForm(name, value);
    } else {
      const updatedForm = { ...form, [name]: value };
      setForm(updatedForm);

      if (name === "valueOfEquipment" || name === "selectedPeriod") {
        calculatePremium(updatedForm.valueOfEquipment, updatedForm.selectedPeriod);
      }
    }
  };

  const onDateChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const friendlyDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const handleViewPDF = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-900 mb-8">Arshyan Portable Equipments Insurance</h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowFormFields((prev) => !prev)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
            >
              {showFormFields ? "Hide" : "Generate"}
            </button>
          </div>

          {showFormFields && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="refNo" value={form.refNo} readOnly disabled className="px-4 py-3 border-2 rounded-xl bg-gray-100" />
                <input name="customerName" value={form.customerName} onChange={onInputChange} placeholder="Customer Name" className="px-4 py-3 border-2 rounded-xl" />
                <input name="customerEmail" value={form.customerEmail} onChange={onInputChange} placeholder="Customer Email" type="email" className="px-4 py-3 border-2 rounded-xl" />
                <input name="customerPhone" value={form.customerPhone} onChange={onInputChange} placeholder="Phone" className="px-4 py-3 border-2 rounded-xl" />
                <textarea name="customerAddress" value={form.customerAddress} onChange={onInputChange} rows={3} placeholder="Address" className="px-4 py-3 border-2 rounded-xl" />
                <input name="pincode" value={form.pincode} onChange={onInputChange} placeholder="Pincode" className="px-4 py-3 border-2 rounded-xl" />
                <input name="asset.mobileNo" value={form.asset.mobileNo} onChange={onInputChange} placeholder="Mobile No" className="px-4 py-3 border-2 rounded-xl" />
                <input name="asset.brandModel" value={form.asset.brandModel} onChange={onInputChange} placeholder="Brand & Model" className="px-4 py-3 border-2 rounded-xl" />
                <input name="asset.imei" value={form.asset.imei} onChange={onInputChange} placeholder="IMEI" className="px-4 py-3 border-2 rounded-xl" />
                <input name="valueOfEquipment" value={form.valueOfEquipment} onChange={onInputChange} placeholder="Value of Equipment (e.g. 15000)" type="number" className="px-4 py-3 border-2 rounded-xl" />
                <select name="selectedPeriod" value={form.selectedPeriod} onChange={onInputChange} className="px-4 py-3 border-2 rounded-xl">
                  <option value="">Select Service Tenure</option>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                </select>
                <input name="insurancePremium" value={form.insurancePremium ? `₹ ${form.insurancePremium}` : "Please select value and period"} readOnly className="px-4 py-3 border-2 rounded-xl bg-gray-100" />
                <input name="membership.productDetail" value={form.membership.productDetail} onChange={onInputChange} placeholder="Product Detail" className="px-4 py-3 border-2 rounded-xl" />
                <input name="membership.insuranceRefNo" value={form.membership.insuranceRefNo} onChange={onInputChange} placeholder="Insurance Ref No" className="px-4 py-3 border-2 rounded-xl" />
                <select
                  name="membership.insurerName"
                  value={form.membership.insurerName}
                  onChange={onInputChange}
                  className="px-4 py-3 border-2 rounded-xl"
                >
                  <option value="">Select Insurer</option>
                  {insurerOptions.map((ins, idx) => (
                    <option key={idx} value={ins}>{ins}</option>
                  ))}
                </select>
                <input
                  name="membership.netAmount"
                  value={form.membership.netAmount}
                  onChange={onInputChange}
                  placeholder="Net Amount (e.g. 1000)"
                  type="number"
                  className="px-4 py-3 border-2 rounded-xl"
                />
                <select
                  name="membership.gstPercentage"
                  value={form.membership.gstPercentage}
                  onChange={onInputChange}
                  className="px-4 py-3 border-2 rounded-xl"
                >
                  {gstOptions.map((g) => (
                    <option key={g} value={g}>{g}%</option>
                  ))}
                </select>
                <input
                  name="membership.totalAmount"
                  value={form.membership.totalAmount ? `₹ ${Number(form.membership.totalAmount).toFixed(2)}` : ""}
                  readOnly
                  placeholder="Total (calculated)"
                  className="px-4 py-3 border-2 rounded-xl bg-gray-100"
                />
                <input
                  name="membership.serviceCharges"
                  value={form.membership.serviceCharges}
                  onChange={onInputChange}
                  placeholder="Service Charges (displayed)"
                  className="px-4 py-3 border-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Issue Date</label>
                  <input type="date" name="issueDate" value={form.issueDate} onChange={(e) => onDateChange("issueDate", e.target.value)} className="px-3 py-2 border rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Date of Purchase</label>
                  <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={(e) => onDateChange("purchaseDate", e.target.value)} className="px-3 py-2 border rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Coverage Start Date</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={(e) => onDateChange("startDate", e.target.value)} className="px-3 py-2 border rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Coverage Expiry Date</label>
                  <input type="date" name="expiryDate" value={form.expiryDate} onChange={(e) => onDateChange("expiryDate", e.target.value)} className="px-3 py-2 border rounded w-full" />
                </div>
              </div>
              <button
                onClick={generatePDF}
                disabled={loading}
                className={`mt-6 w-full py-4 text-xl font-bold text-white rounded-2xl transition-all ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:scale-105"}`}
              >
                {loading ? "Generating PDF..." : "Generate & Save Welcome Letter"}
              </button>
            </>
          )}
        </div>

        {success && (
          <div className="text-center bg-green-100 p-6 rounded-2xl mb-6 border-2 border-green-300">
            <h2 className="text-2xl font-bold text-green-800 mb-3">{success}</h2>
            <button 
              onClick={() => handleViewPDF(pdfUrl)}
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl mr-4"
            >
              View PDF
            </button>
            <a href={pdfUrl} download className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl">
              Download PDF
            </a>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Saved Arshyan Portable Equipments Insurance Letters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input value={filterName} onChange={handleFilterName} placeholder="Filter by Customer Name" className="px-4 py-3 border-2 rounded-xl" />
            <input value={filterRef} onChange={handleFilterRef} placeholder="Filter by Ref No" className="px-4 py-3 border-2 rounded-xl" />
          </div>

          {currentLetters.length > 0 ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="w-full border-collapse mb-6 text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border p-3 text-left font-bold">Ref No</th>
                      <th className="border p-3 text-left font-bold">Customer Name</th>
                      <th className="border p-3 text-left font-bold">Created At</th>
                      <th className="border p-3 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLetters.map((letter) => (
                      <tr key={letter._id}>
                        <td className="border p-3">{letter.refNo}</td>
                        <td className="border p-3">{letter.customerName}</td>
                        <td className="border p-3">{friendlyDate(letter.createdAt)}</td>
                        <td className="border p-3">
                          <button onClick={() => handleViewPDF(letter.pdfUrl)} className="text-blue-600 hover:underline mr-4">View</button>
                          <a href={letter.pdfUrl} download className="text-green-600 hover:underline mr-4">Download</a>
                          <button onClick={() => handleDelete(letter._id)} className="text-red-600 hover:underline">Delete</button>
                                          </td>
                          </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                  Previous
                </button>
                <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                  Next
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">No letters found</p>
          )}
        </div>
      </div>

      {/* Hidden render area for html2canvas captures */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={page1Ref} data-page="0" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage1 form={form} />
        </div>
        <div ref={page2Ref} data-page="1" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage2 form={form} />
        </div>
        <div ref={page3Ref} data-page="2" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage3 form={form} />
        </div>
        <div ref={page4Ref} data-page="3" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage4 form={form} />
        </div>
        <div ref={page5Ref} data-page="4" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage5 form={form} />
        </div>
        <div ref={page6Ref} data-page="5" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage6 form={form} />
        </div>
        <div ref={page7Ref} data-page="6" style={{ background: "#fff", width: 794, height: 1123, overflow: 'hidden' }}>
          <WelcomeLetterPage7 form={form} />
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 9999,
            background: "linear-gradient(90deg,#0f3b82,#4f46e5)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(15,59,130,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 260,
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            Check
          </div>
          <div style={{ flex: 1, fontSize: 14, lineHeight: 1.25 }}>
            {toast}
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>Saved to cloud & database</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeLetterGenerator;