// src/components/WelcomeLetterGenerator.jsx
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
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
  "Bajaj Allianz General Insurance Co Ltd",
  "Tata Aig General Insurance Co Ltd",
  "HDFC Ergo General Insurance Co Ltd",
  "ICICI Lombard General Insurance Co Ltd",
  "Digit General Insurance Co Ltd",
  "Reliance General Insurance Co Ltd",
  "SBI General Insurance Co Ltd",
  "Future General General Insurance Co Ltd",
  "Magma HDI General Insurance Co Ltd",
  "Royal Sundram General Insurance Co Ltd",
  "Kotak Mahindra General Insurance Co Ltd",
  "Liberty General Insurance Co Ltd",
  "Shriram General Insurance Co Ltd",
  "United India General Insurance Co Ltd",
  "Oriental General Insurance Co Ltd",
  "National General Insurance Co Ltd",
  "New India General Insurance Co Ltd",
  "Chola MS General Insurance Co Ltd",
  "Universal Sompo General Insurance Co Ltd",
  "Iffco Tokio General Insurance Co Ltd",
  "ICICI Prudential Life Insurance",
  "TATA AIA Life Insurance",
  "HDFC Life Insurance",
  "Reliance Nippon Life Insurance",
  "Axis Max Life Insurance",
  "Niva Bupa Health Insurance",
  "Care Health Insurance",
  "Star Health Insurance",
  "Aditya Birla Health Insurance",
  "Bajaj Allianz Life Insurance",
];

/* -----------------------
   Page visual components (unchanged)
   ----------------------- */

const pageContainerStyle = {
  background: "#ffffff",
  width: "794px",
  minHeight: "1123px",
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

/* -----------------------
   Page content components (unchanged aside from reading new fields)
   ----------------------- */

const WelcomeLetterPage1 = ({ form }) => {
  const salut = (name) => {
    if (!name) return "Customer";
    const parts = name.trim().split(" ");
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <PageTemplate>
      <PageHeader />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, marginBottom: 6 }}>
        <div style={{ fontSize: 11 }}>
          <strong>Date: </strong>
          {formatDisplayDate(form.issueDate)}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 11 }}>ARSHYAN REF NO</div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f3b82" }}>{form.refNo}</div>
      </div>

      <div style={{ marginBottom: 18, fontSize: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{form.customerName}</div>
        <div style={{ whiteSpace: "pre-line", marginBottom: 6 }}>{form.customerAddress}</div>
        <div>{form.customerPhone}</div>
      </div>

      <p style={{ marginBottom: 8 }}>Dear {salut(form.customerName)},</p>

      <p style={{ textAlign: "justify", marginBottom: 8 }}>
        Congratulations on buying <strong>Arshyan Portable Equipment Insurance Services</strong> and welcome to the Arshyan family! We thank you
        for choosing Arshyan Insurance Services and hope you will enjoy the benefits of the services.
      </p>

      <p style={{ textAlign: "justify", marginBottom: 8 }}>
        This welcome pack contains the following that explain all aspects of your Arshyan Portable Equipment Services:
      </p>

      <div style={{ marginLeft: 18, marginBottom: 8 }}>
        <div style={{ marginBottom: 6 }}>• Benefit Guide: Explains the key benefits of your membership in detail.</div>
        <div>• Terms and Conditions: Details the terms and conditions of your membership (including terms of your Equipment all risk insurance provided by the insurer).</div>
      </div>

      <p style={{ textAlign: "justify", marginBottom: 12 }}>
        Your membership details along with the details of the asset purchased by you are mentioned overleaf. Don't hesitate to get in touch with us on the
        contact details mentioned for any assistance regarding your membership.
      </p>

      <p style={{ marginBottom: 28 }}>Thank you again for becoming an Arshyan Insurance Marketing & Services Pvt Ltd member!</p>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <p style={{ marginBottom: 6, fontSize: 11 }}>Yours Sincerely</p>
        <p style={{ marginBottom: 14, fontSize: 11 }}>For Arshyan Insurance Marketing & Services Pvt Ltd.</p>
        <img src={assets.stamp} alt="Stamp" style={{ width: 100, display: "block", margin: "0 auto 8px auto" }} />
        <div style={{ fontWeight: 700 }}>Authorised Signatory</div>
      </div>

      <PageFooter />
    </PageTemplate>
  );
};

const WelcomeLetterPage2 = ({ form }) => {
  return (
    <PageTemplate>
      <PageHeader />
      <h3 style={{ textAlign: "center", fontWeight: 700, marginTop: 8, marginBottom: 12, fontSize: 13 }}>Asset Details</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18, fontSize: 11 }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700, width: "40%" }}>Customer Mobile No.</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{form.asset.mobileNo}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700 }}>Model Type - Brand/Model</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{form.asset.brandModel}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: 700 }}>IMEI #</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{form.asset.imei}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ textAlign: "center", fontWeight: 700, marginBottom: 10, fontSize: 12 }}>Membership Details cum Sales Proforma</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Name of Customer</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.customerName}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Address of Customer</td>
            <td style={{ border: "1px solid #000", padding: 6, whiteSpace: "pre-line" }}>{form.customerAddress}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Arshyan Ref No</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.refNo}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Date of Purchase</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{formatDisplayDate(form.purchaseDate)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Date of Start</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{formatDisplayDate(form.startDate)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Date of Expiry</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{formatDisplayDate(form.expiryDate)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Product Detail</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.productDetail}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Insurance Ref No.</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.insuranceRefNo}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Insurer Name</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.insurerName}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>Services Charges (Inclusive GST)</td>
            <td style={{ border: "1px solid #000", padding: 6 }}>{form.membership.serviceCharges}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: "center", marginTop: 26 }}>
        <p style={{ marginBottom: 6, fontSize: 11 }}>Yours Sincerely</p>
        <p style={{ marginBottom: 14, fontSize: 11 }}>For Arshyan Insurance Marketing & Services Pvt Ltd.</p>
        <img src={assets.stamp} alt="Stamp" style={{ width: 80, display: "block", margin: "0 auto" }} />
        <div style={{ fontWeight: 700 }}>Authorised Signatory</div>
      </div>

      <PageFooter />
    </PageTemplate>
  );
};

const WelcomeLetterPage3 = ({ form }) => {
  const exclusions = [
    "Mis-representation, Mis-description or Non-Disclosure of any material particulars/information/facts.",
    "Damages which are Pre-existing in nature. (Applicable to Contents and Building)",
    "Loss or Damage or Collapse of Building due to structural defects, latent defects, poor maintenance, workmanship, material or design, latent defect, wear and tear, depreciation, moth, vermin, insects or mildew.",
    "Manufacturing defects in Electrical, Mechanical and Electronic Items for which the manufacturer is responsible.",
    "Loss of or damage to the property insured under this policy falling under the terms of the maintenance agreement.",
    "Improper handling, dismantling, fitting adjustment, repair alteration or modification not approved by the makers/manufacturers.",
    "Breakage, Cracking or Scratching of brittle or fragile articles unless caused by fire or accidental external means.",
    "Overloading or Strain, Overrunning Excessive Pressure, Short Circuiting and / Self Heating or test requiring imposition of abnormal conditions.",
    "Over Winding, Denting or Internal Damage of Watches and Clocks.",
    "Loss or Damage liable to be repaired or made good by a third party under any contract or agreement.",
    "Loss or damage to Money, Securities, Manuscript, Deeds, Bonds, Bills of Exchange, Promissory Notes, Stock or Share Certificate, Stamp and Travel Ticket or Traveler cheques.",
    "Loss of insured property from safe inside insured Building, following use of the key or any duplicate thereof or access code to the safe belonging to the Insured.",
    "Loss Destruction of or Damage to articles of Consumable Nature.",
    "Jewellery and Valuables, Works of Art, Paintings, Curios unless specifically insured.",
    "Loss, destruction or damage directly occasioned by pressure wave caused by aircraft and other aerial devices travelling at sonic or supersonic speeds.",
    "Loss, damage or liability arising directly or indirectly from seepage, pollution or contamination.",
    "Loss, damage or consequential loss directly or indirectly caused by any functioning or malfunctioning of the internet or similar facility.",
  ];

  return (
    <PageTemplate>
      <PageHeader small />
      <h3 style={{ textAlign: "center", fontWeight: 700, marginTop: 10, marginBottom: 10 }}>Coverage Details</h3>

      <p style={{ fontWeight: 700, marginBottom: 6 }}>Portable Electronics Equipment - All Risk</p>
      <div style={{ marginLeft: 18, marginBottom: 10 }}>
        <div>• Accidental/Impact Damage</div>
        <div>• Liquid Damage</div>
        <div>• Theft</div>
      </div>

      <p style={{ fontSize: 11, marginBottom: 6 }}><strong>Loss Depreciation:</strong> NIL</p>
      <p style={{ fontSize: 11, marginBottom: 12 }}><strong>Excess:</strong> First 5% of each and every claim minimum Rs.2500/-</p>

      <h4 style={{ marginBottom: 8, fontSize: 12 }}>General Exclusions:</h4>

      <ol style={{ fontSize: 10, marginLeft: 18, lineHeight: 1.45 }}>
        {exclusions.map((ex, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{ex}</li>
        ))}
      </ol>

      <PageFooter />
    </PageTemplate>
  );
};

const WelcomeLetterPage4 = ({ form }) => {
  const exclusions2 = [
    "Loss or damage due to theft or attempted theft by any employee of the Insured or loss or damage occasioned through the willful act of the Insured or any employee.",
    "Loss or damage directly or indirectly caused by war, invasion, act of foreign enemy hostilities or war like operations.",
    "Loss or damage directly or indirectly caused by ionizing radiations contamination by radio activity from any nuclear fuel or from any nuclear waste.",
    "Loss or damage to Fire arms by Rusting, Bursting or any other cause.",
    "Mysterious disappearance and Unexplained Losses.",
    "Loss of earnings, loss by delay, loss of market or other consequential or indirect loss.",
    "Loss or damage to Livestock, Motor Cycles and Vehicles of any description.",
    "Expenses incurred for maintenance of Electronic and Electrical Equipments and Domestic Appliances.",
    "Theft and Burglary Claims, if the premise is left unoccupied for more than continuous 45 days.",
    "Loss, destruction or damage to the contents or items in Refrigerator/Fridge caused by change of temperature.",
    "Loss or damage arising from detention, confiscation, nationalization, requisition, occupation or willful destruction by or under the order of the government or any public or local authority."
  ];

  return (
    <PageTemplate>
      <PageHeader small />
      <ol start={18} style={{ fontSize: 10, marginLeft: 18, lineHeight: 1.45 }}>
        {exclusions2.map((ex, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{ex}</li>
        ))}
      </ol>

      <p style={{ marginTop: 12, fontStyle: "italic", fontSize: 10 }}>
        Moreover, All terms & Condition will be applicable of issued insurance policy by Insurer, sale is attached you welcome email.
      </p>

      <PageFooter />
    </PageTemplate>
  );
};

/* -----------------------
   Main component (export)
   ----------------------- */

const WelcomeLetterGenerator = () => {
  // NEW STATE FOR TOGGLE
  const [showFormFields, setShowFormFields] = useState(true);

  const [form, setForm] = useState({
    // Basic details
    refNo: "",
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    // Asset details
    asset: {
      mobileNo: "",
      brandModel: "",
      imei: "",
    },
    // Membership / Plan details (now includes net/gst/total)
    membership: {
      productDetail: "",
      insuranceRefNo: "",
      insurerName: "",
      serviceCharges: "",
      netAmount: "",
      gstPercentage: 18,
      totalAmount: "",
    },

    // DATE FIELDS (manual)
    purchaseDate: "", // YYYY-MM-DD
    startDate: "", // YYYY-MM-DD
    expiryDate: "", // YYYY-MM-DD
    issueDate: todayISO(), // default to today but editable
  });

  const [autoCalcExpiry, setAutoCalcExpiry] = useState(true);
  const [dateFormatDisplay, setDateFormatDisplay] = useState("DD-MM-YYYY");

  const [previewUrl, setPreviewUrl] = useState("");
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

  // when startDate changes, auto-calc expiry
  useEffect(() => {
    if (!form.startDate) return;
    if (!autoCalcExpiry) return;
    try {
      const [y, m, d] = form.startDate.split("-");
      if (y && m && d) {
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        const nextYear = new Date(dt);
        nextYear.setFullYear(dt.getFullYear() + 1);
        const yyyy = nextYear.getFullYear();
        const mm = String(nextYear.getMonth() + 1).padStart(2, "0");
        const dd = String(nextYear.getDate()).padStart(2, "0");
        setForm((p) => ({ ...p, expiryDate: `${yyyy}-${mm}-${dd}` }));
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.startDate, autoCalcExpiry]);

  const generatePreview = async () => {
    if (!page1Ref.current) return;
    try {
      const canvas = await html2canvas(page1Ref.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowHeight: 1123,
      });
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => generatePreview(), 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Fetch saved letters
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

  // Fetch next ref from backend (server authoritative)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when net or gst changes -> recalc total
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.membership.netAmount, form.membership.gstPercentage]);

  const validateFormBeforeGenerate = () => {
    if (!form.customerName || !form.customerPhone || !form.customerAddress) {
      alert("Please fill all required fields (Customer Name, Phone, Address).");
      return false;
    }

    if (form.membership.netAmount === "" || form.membership.netAmount === null) {
      const ok = window.confirm("Net amount is empty. Do you want to proceed?");
      if (!ok) return false;
    }

    // Ensure dates are valid ISO format if present
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
      const pageRefs = [page1Ref, page2Ref, page3Ref, page4Ref];
      const pngImages = [];

      for (let i = 0; i < pageRefs.length; i++) {
        const element = pageRefs[i].current;
        if (!element) throw new Error(`Page ${i + 1} ref not found`);

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: 794,
          windowHeight: 1123,
        });

        const imgData = canvas.toDataURL("image/png");
        pngImages.push(imgData);
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/letter/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pngImages,
          letterData: {
            ...form,
            asset: form.asset,
            membership: form.membership,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to generate");

      setPdfUrl(data.pdfUrl);
      setSuccess("Welcome Letter Generated & Saved Successfully!");

      // Show toast with generated refNo (backend authoritative)
      const generatedRef = data.refNo || form.refNo;
      show(`Letter ${generatedRef} generated successfully!`);

      // refresh list and next ref
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
    if (name.includes(".")) updateForm(name, value);
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const onDateChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-900 mb-8">Arshyan Portable Equipments Insurance</h1>

        {/* FORM */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          {/* TOGGLE BUTTON */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowFormFields((prev) => !prev)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
            >
              {showFormFields ? "Hide" : "Generate"}
            </button>
          </div>

          {/* CONDITIONAL RENDERING OF ALL INPUT FIELDS */}
          {showFormFields && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* refNo: auto-generated (disabled) */}
                <input name="refNo" value={form.refNo} readOnly disabled className="px-4 py-3 border-2 rounded-xl bg-gray-100" />
                <input name="customerName" value={form.customerName} onChange={onInputChange} placeholder="Customer Name" className="px-4 py-3 border-2 rounded-xl" />
                <input name="customerPhone" value={form.customerPhone} onChange={onInputChange} placeholder="Phone" className="px-4 py-3 border-2 rounded-xl" />
                <textarea name="customerAddress" value={form.customerAddress} onChange={onInputChange} rows={3} placeholder="Address" className="px-4 py-3 border-2 rounded-xl" />

                <input name="asset.mobileNo" value={form.asset.mobileNo} onChange={onInputChange} placeholder="Mobile No" className="px-4 py-3 border-2 rounded-xl" />
                <input name="asset.brandModel" value={form.asset.brandModel} onChange={onInputChange} placeholder="Brand & Model" className="px-4 py-3 border-2 rounded-xl" />
                <input name="asset.imei" value={form.asset.imei} onChange={onInputChange} placeholder="IMEI" className="px-4 py-3 border-2 rounded-xl" />

                {/* Product detail */}
                <input name="membership.productDetail" value={form.membership.productDetail} onChange={onInputChange} placeholder="Product Detail" className="px-4 py-3 border-2 rounded-xl" />

                {/* Insurance ref and insurer select */}
                <input name="membership.insuranceRefNo" value={form.membership.insuranceRefNo} onChange={onInputChange} placeholder="Insurance Ref No" className="px-4 py-3 border-2 rounded-xl" />

                <select
                  name="membership.insurerName"
                  value={form.membership.insurerName}
                  onChange={onInputChange}
                  className="px-4 py-3 border-2 rounded-xl"
                >
                  <option value="">Select Insurer</option>
                  {insurerOptions.map((ins, idx) => (
                    <option key={idx} value={ins}>
                      {ins}
                    </option>
                  ))}
                </select>

                {/* Net / GST / Total inputs */}
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
                    <option key={g} value={g}>
                      {g}%
                    </option>
                  ))}
                </select>

                <input
                  name="membership.totalAmount"
                  value={form.membership.totalAmount ? `₹ ${Number(form.membership.totalAmount).toFixed(2)}` : ""}
                  readOnly
                  placeholder="Total (calculated)"
                  className="px-4 py-3 border-2 rounded-xl bg-gray-100"
                />

                {/* keep original serviceCharges field in sync (displayed on pdf) */}
                <input
                  name="membership.serviceCharges"
                  value={form.membership.serviceCharges}
                  onChange={onInputChange}
                  placeholder="Service Charges (displayed)"
                  className="px-4 py-3 border-2 rounded-xl"
                />
              </div>

              {/* Date inputs */}
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

        {/* Success & download */}
        {success && (
          <div className="text-center bg-green-100 p-6 rounded-2xl mb-6 border-2 border-green-300">
            <h2 className="text-2xl font-bold text-green-800 mb-3">{success}</h2>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl">
              Download PDF
            </a>
          </div>
        )}

        {/* Saved Letters */}
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
                          <a href={letter.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">View</a>
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

      {/* Hidden render area for html2canvas captures - visible for debug */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, background: "#f0f0f0" }}>
        <div ref={page1Ref} style={{ background: "#fff", width: 794, margin: "0 auto", position: "relative" }}>
          <WelcomeLetterPage1 form={form} />
        </div>

        <div ref={page2Ref} style={{ background: "#fff", width: 794, margin: "0 auto", position: "relative" }}>
          <WelcomeLetterPage2 form={form} />
        </div>

        <div ref={page3Ref} style={{ background: "#fff", width: 794, margin: "0 auto", position: "relative" }}>
          <WelcomeLetterPage3 form={form} />
        </div>

        <div ref={page4Ref} style={{ background: "#fff", width: 794, margin: "0 auto", position: "relative" }}>
          <WelcomeLetterPage4 form={form} />
        </div>
      </div>

      {/* Toast (designed) */}
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