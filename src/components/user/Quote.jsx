import { useState, useEffect } from "react";
import {
  FaCar,
  FaHeartbeat,
  FaMobileAlt,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

function Quote() {
  const [insuranceType, setInsuranceType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [healthType, setHealthType] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [sumInsured, setSumInsured] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [company, setCompany] = useState("");
  const [adults, setAdults] = useState([{ name: "", age: "" }]);
  const [children, setChildren] = useState([{ name: "", age: "" }]);

  // Mobile Insurance Form State
  const [mobileFormData, setMobileFormData] = useState({
    nameOfInsured: "",
    dateOfPurchase: "",
    insuredMobileNumber: "",
    insuredEmailId: "",
    correspondenceAddress: "",
    nameOfStore: "",
    equipment: "",
    mobile: "",
    nameOfEquipment: "",
    equipmentBrandModel: "",
    equipmentSerialNumber: "",
    valueOfEquipment: "",
    selectedPeriod: "",
    insurancePremium: "",
    aadhaarCard: null,
    purchaseInvoice: null,
    insurancePaymentReceipt: null,
    imeiImage: null,
  });
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const premiumData = {
    "0-19999": { 1: 2000, 2: 3850, 3: 5875 },
    "20000-29999": { 1: 2350, 2: 4250, 3: 6099 },
    "30000-34999": { 1: 2500, 2: 4750, 3: 6599 },
    "35000-49999": { 1: 2800, 2: 5099, 3: 7299 },
    "50000-74999": { 1: 4250, 2: 6999, 3: 8999 },
    "75000-99999": { 1: 4998, 2: 8599, 3: 10999 },
    "100000-124999": { 1: 5546, 2: 10546, 3: 15650 },
    "125000-149999": { 1: 6195, 2: 11999, 3: 16999 },
    "150000-199999": { 1: 8999, 2: 16449, 3: 25999 },
    "200000-250000": { 1: 10999, 2: 19999, 3: 30999 },
  };

  const companies = [
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
    "Bajaj Allianz Life Insurance",
  ];

  // Mobile Insurance Handlers
  useEffect(() => {
    if (mobileFormData.dateOfPurchase) {
      const purchaseDate = new Date(mobileFormData.dateOfPurchase);
      const currentDate = new Date();
      purchaseDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      const differenceInTime = currentDate.getTime() - purchaseDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      setShowUploadSection(differenceInDays > 30);
    }
  }, [mobileFormData.dateOfPurchase]);

  const handleMobileChange = (e) => {
    const { name, value, files } = e.target;
    const updatedFormData = {
      ...mobileFormData,
      [name]: files ? files[0] : value,
    };
    setMobileFormData(updatedFormData);

    if (name === "valueOfEquipment" || name === "selectedPeriod") {
      calculatePremium(
        updatedFormData.valueOfEquipment,
        updatedFormData.selectedPeriod
      );
    }
  };

  const calculatePremium = (valueOfEquipment, selectedPeriod) => {
    const numValue = parseInt(valueOfEquipment) || 0;
    let selectedRange = null;

    for (const range in premiumData) {
      const [min, max] = range.split("-").map(Number);
      if (numValue >= min && (max === undefined || numValue <= max)) {
        selectedRange = range;
        break;
      }
    }

    if (selectedRange && selectedPeriod) {
      setMobileFormData((prev) => ({
        ...prev,
        insurancePremium: premiumData[selectedRange][selectedPeriod],
      }));
    } else {
      setMobileFormData((prev) => ({
        ...prev,
        insurancePremium: "",
      }));
    }
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    const templateParams = {
      nameOfInsured: mobileFormData.nameOfInsured,
      dateOfPurchase: mobileFormData.dateOfPurchase,
      insuredMobileNumber: mobileFormData.insuredMobileNumber,
      insuredEmailId: mobileFormData.insuredEmailId,
      correspondenceAddress: mobileFormData.correspondenceAddress,
      nameOfStore: mobileFormData.nameOfStore,
      equipment: mobileFormData.equipment,
      mobile: mobileFormData.mobile,
      nameOfEquipment: mobileFormData.nameOfEquipment,
      equipmentBrandModel: mobileFormData.equipmentBrandModel,
      equipmentSerialNumber: mobileFormData.equipmentSerialNumber,
      valueOfEquipment: mobileFormData.valueOfEquipment,
      selectedPeriod: mobileFormData.selectedPeriod,
      insurancePremium: mobileFormData.insurancePremium
        ? `₹ ${mobileFormData.insurancePremium}`
        : "Not calculated",
      aadhaarCard: mobileFormData.aadhaarCard
        ? mobileFormData.aadhaarCard.name
        : "Not uploaded",
      purchaseInvoice: mobileFormData.purchaseInvoice
        ? mobileFormData.purchaseInvoice.name
        : "Not uploaded",
      insurancePaymentReceipt: mobileFormData.insurancePaymentReceipt
        ? mobileFormData.insurancePaymentReceipt.name
        : "Not uploaded",
      imeiImage: mobileFormData.imeiImage
        ? mobileFormData.imeiImage.name
        : "Not uploaded",
    };

    emailjs
      .send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        templateParams,
        "YOUR_USER_ID"
      )
      .then(
        () => {
          setSendStatus("success");
          setMobileFormData({
            nameOfInsured: "",
            dateOfPurchase: "",
            insuredMobileNumber: "",
            insuredEmailId: "",
            correspondenceAddress: "",
            nameOfStore: "",
            equipment: "",
            mobile: "",
            nameOfEquipment: "",
            equipmentBrandModel: "",
            equipmentSerialNumber: "",
            valueOfEquipment: "",
            selectedPeriod: "",
            insurancePremium: "",
            aadhaarCard: null,
            purchaseInvoice: null,
            insurancePaymentReceipt: null,
            imeiImage: null,
          });
          setIsSending(false);
        },
        () => {
          setSendStatus("error");
          setIsSending(false);
        }
      );
  };

  const addAdult = () => {
    setAdults([...adults, { name: "", age: "" }]);
  };

  const removeAdult = (index) => {
    setAdults(adults.filter((_, i) => i !== index));
  };

  const updateAdult = (index, field, value) => {
    const newAdults = [...adults];
    newAdults[index][field] = value;
    setAdults(newAdults);
  };

  const addChild = () => {
    setChildren([...children, { name: "", age: "" }]);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index][field] = value;
    setChildren(newChildren);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission for motor and health insurance
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">
          Generate New Quote
        </h1>

        <form
          onSubmit={
            insuranceType === "mobile" ? handleMobileSubmit : handleSubmit
          }
        >
          {/* Insurance Type Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Quote For
            </label>
            <div className="relative">
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select Insurance Type</option>
                <option value="motor">Motor Insurance</option>
                <option value="health">Health Insurance</option>
                <option value="mobile">Mobile Insurance</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <FaCar className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Motor Insurance Form */}
          {insuranceType === "motor" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="two-wheeler">Two Wheeler</option>
                  <option value="private-car">Private Car</option>
                  <option value="commercial-vehicle">Commercial Vehicle</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RC Number (Mandatory)
                </label>
                <input
                  type="text"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter RC Number"
                  required
                />
              </div>
            </>
          )}

          {/* Health Insurance Form */}
          {insuranceType === "health" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Insurance Type
                </label>
                <select
                  value={healthType}
                  onChange={(e) => setHealthType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Type</option>
                  <option value="single">Single Person</option>
                  <option value="floater">Floater Insurance Policy</option>
                </select>
              </div>

              {healthType === "single" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Name"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Mobile Number"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Email"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sum Insured
                    </label>
                    <input
                      type="number"
                      value={sumInsured}
                      onChange={(e) => setSumInsured(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Sum Insured"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area Pin Code
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Pin Code"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Company
                    </label>
                    <select
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Company</option>
                      {companies.map((comp) => (
                        <option key={comp} value={comp}>
                          {comp}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {healthType === "floater" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                      Adults
                    </h2>
                    {adults.map((adult, index) => (
                      <div key={index} className="flex items-center mb-4">
                        <input
                          type="text"
                          value={adult.name}
                          onChange={(e) =>
                            updateAdult(index, "name", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Name"
                        />
                        <input
                          type="number"
                          value={adult.age}
                          onChange={(e) =>
                            updateAdult(index, "age", e.target.value)
                          }
                          className="w-24 px-4 py-3 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Age"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeAdult(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAdult}
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <FaPlus className="h-5 w-5 mr-2" /> Add Adult
                    </button>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                      Children
                    </h2>
                    {children.map((child, index) => (
                      <div key={index} className="flex items-center mb-4">
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) =>
                            updateChild(index, "name", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Name"
                        />
                        <input
                          type="number"
                          value={child.age}
                          onChange={(e) =>
                            updateChild(index, "age", e.target.value)
                          }
                          className="w-24 px-4 py-3 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Age"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeChild(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addChild}
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <FaPlus className="h-5 w-5 mr-2" /> Add Child
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Mobile Number"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Email"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sum Insured
                    </label>
                    <input
                      type="number"
                      value={sumInsured}
                      onChange={(e) => setSumInsured(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Sum Insured"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area Pin Code
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Pin Code"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Company
                    </label>
                    <select
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Company</option>
                      {companies.map((comp) => (
                        <option key={comp} value={comp}>
                          {comp}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {/* Mobile Insurance Form */}
          {insuranceType === "mobile" && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Insured *
                </label>
                <input
                  type="text"
                  name="nameOfInsured"
                  value={mobileFormData.nameOfInsured}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Rahul Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Purchase *
                </label>
                <input
                  type="date"
                  name="dateOfPurchase"
                  value={mobileFormData.dateOfPurchase}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insured Mobile Number *
                </label>
                <input
                  type="tel"
                  name="insuredMobileNumber"
                  value={mobileFormData.insuredMobileNumber}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., +919876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insured Email ID *
                </label>
                <input
                  type="email"
                  name="insuredEmailId"
                  value={mobileFormData.insuredEmailId}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correspondence Address *
                </label>
                <textarea
                  name="correspondenceAddress"
                  value={mobileFormData.correspondenceAddress}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Store / Outlet *
                </label>
                <input
                  type="text"
                  name="nameOfStore"
                  value={mobileFormData.nameOfStore}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Store Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment *
                </label>
                <select
                  name="equipment"
                  value={mobileFormData.equipment}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Equipment</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Camera">Camera</option>
                  <option value="Laptop">Laptop</option>
                  <option value="I-Pad">I-Pad</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {mobileFormData.equipment === "Mobile" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={mobileFormData.mobile}
                      onChange={handleMobileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Model Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name of Equipment if not in list
                    </label>
                    <input
                      type="text"
                      name="nameOfEquipment"
                      value={mobileFormData.nameOfEquipment}
                      onChange={handleMobileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Custom Equipment"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Brand and Model *
                </label>
                <input
                  type="text"
                  name="equipmentBrandModel"
                  value={mobileFormData.equipmentBrandModel}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Apple iPhone 14"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Serial Number / IMEI Number *
                </label>
                <input
                  type="text"
                  name="equipmentSerialNumber"
                  value={mobileFormData.equipmentSerialNumber}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 123456789012345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value of Equipment *
                </label>
                <input
                  type="number"
                  name="valueOfEquipment"
                  value={mobileFormData.valueOfEquipment}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 15000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period *
                </label>
                <select
                  name="selectedPeriod"
                  value={mobileFormData.selectedPeriod}
                  onChange={handleMobileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Period</option>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Premium Including GST
                </label>
                <input
                  type="text"
                  name="insurancePremium"
                  value={
                    mobileFormData.insurancePremium
                      ? `₹ ${mobileFormData.insurancePremium}`
                      : "Please select value and period"
                  }
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Aadhaar Card *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-gray-600">
                      Drop your file here or click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      You can upload up to 1 file (image or PDF)
                    </p>
                    <input
                      type="file"
                      name="aadhaarCard"
                      onChange={handleMobileChange}
                      className="mt-2 w-full"
                      accept="image/*,application/pdf"
                      required
                    />
                  </div>
                </div>
              </div>

              {showUploadSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload image of the device with IMEI number *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-gray-600">
                        Drop your file here or click to upload
                      </p>
                      <p className="text-xs text-gray-500">
                        You can upload up to 1 file (image or PDF)
                      </p>
                      <input
                        type="file"
                        name="imeiImage"
                        onChange={handleMobileChange}
                        className="mt-2 w-full"
                        accept="image/*,application/pdf"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Invoice *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-gray-600">
                      Drop your file here or click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      You can upload up to 1 file (image or PDF)
                    </p>
                    <input
                      type="file"
                      name="purchaseInvoice"
                      onChange={handleMobileChange}
                      className="mt-2 w-full"
                      accept="image/*,application/pdf"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Payment Receipt
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-gray-600">
                      Drop your file here or click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      You can upload up to 1 file (image or PDF)
                    </p>
                    <input
                      type="file"
                      name="insurancePaymentReceipt"
                      onChange={handleMobileChange}
                      className="mt-2 w-full"
                      accept="image/*,application/pdf"
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Submit Button */}
          {insuranceType && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                type="submit"
                disabled={isSending}
                className={`w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-all ${
                  isSending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSending ? "Submitting..." : "Submit Quote Request"}
              </button>
            </motion.div>
          )}

          {insuranceType === "mobile" && sendStatus === "success" && (
            <p className="text-green-600 mt-2 text-center">
              Form submitted successfully!
            </p>
          )}
          {insuranceType === "mobile" && sendStatus === "error" && (
            <p className="text-red-600 mt-2 text-center">
              Failed to submit form. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Quote;
