  import React, { useState, useEffect } from "react";
  import { FaCar, FaUser, FaEnvelope, FaMobileAlt, FaCity, FaSearch, FaEye, FaCheck, FaTimes } from "react-icons/fa";

  const initialState = {
    regNumber: "",
    make: "",
    model: "",
    variant: "",
    fuelType: "Petrol",
    regYear: "",
    rtoState: "",
    policyExpiry: "",
    prevInsurer: "",
    prevNCB: "",
    claimInLastYear: "No",
    ownerName: "",
    mobile: "",
    email: "",
    city: "",
    pincode: "",
    kmsDriven: "",
    ownershipType: "Individual",
    notes: "",
  };

  const mockRequests = [
    {
      id: 1,
      regNumber: "MH12AB1234",
      make: "Maruti",
      model: "Swift",
      variant: "VXi",
      fuelType: "Petrol",
      regYear: "2018",
      rtoState: "MH",
      policyExpiry: "2024-12-31",
      prevInsurer: "ICICI",
      prevNCB: "20%",
      claimInLastYear: "No",
      ownerName: "John Doe",
      mobile: "9876543210",
      email: "john@example.com",
      city: "Mumbai",
      pincode: "400001",
      kmsDriven: "50000",
      ownershipType: "Individual",
      notes: "Urgent request",
      status: "Pending",
      submittedAt: "2025-10-01",
    },
    {
      id: 2,
      regNumber: "DL01CD5678",
      make: "Hyundai",
      model: "i20",
      variant: "Asta",
      fuelType: "Diesel",
      regYear: "2020",
      rtoState: "DL",
      policyExpiry: "2025-01-15",
      prevInsurer: "HDFC",
      prevNCB: "0%",
      claimInLastYear: "Yes",
      ownerName: "Jane Smith",
      mobile: "8765432109",
      email: "jane@example.com",
      city: "Delhi",
      pincode: "110001",
      kmsDriven: "30000",
      ownershipType: "Individual",
      notes: "",
      status: "Approved",
      submittedAt: "2025-09-28",
    },
  ];

  export default function VehicleAdmin({ isAdmin }) {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [files, setFiles] = useState({
      rcCopy: null,
      drivingLicense: null,
      oldPolicy: null,
      idProof: null,
      vehiclePhotos: [],
    });
    const [previews, setPreviews] = useState({
      rcCopy: null,
      drivingLicense: null,
      oldPolicy: null,
      idProof: null,
      vehiclePhotos: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState(mockRequests);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequests, setFilteredRequests] = useState(mockRequests);

    function handleChange(e) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    function handleFileChange(e) {
      const { name, files: fileList } = e.target;
      if (!fileList) return;

      if (name === "vehiclePhotos") {
        const arr = Array.from(fileList).slice(0, 3);
        setFiles((prev) => ({ ...prev, vehiclePhotos: arr }));
        const p = arr.map((f) => URL.createObjectURL(f));
        setPreviews((prev) => ({ ...prev, vehiclePhotos: p }));
      } else {
        const file = fileList[0];
        setFiles((prev) => ({ ...prev, [name]: file }));
        setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
      }
    }

    function validate() {
      const err = {};
      if (!form.regNumber || form.regNumber.trim().length < 4)
        err.regNumber = "Enter valid registration number";
      if (!form.make) err.make = "Required";
      if (!form.model) err.model = "Required";
      if (!form.regYear || isNaN(Number(form.regYear)) || Number(form.regYear) < 1950)
        err.regYear = "Enter valid year";
      if (!form.rtoState) err.rtoState = "Required";
      if (!form.ownerName) err.ownerName = "Required";
      if (!form.mobile || !/^\d{10}$/.test(form.mobile)) err.mobile = "Enter 10 digit mobile";
      if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter valid email";
      if (!form.city) err.city = "Required";
      if (!form.pincode || !/^\d{6}$/.test(form.pincode)) err.pincode = "Enter 6 digit pincode";
      if (!files.rcCopy) err.rcCopy = "RC copy required";
      if (!files.drivingLicense) err.drivingLicense = "Driving license required";
      setErrors(err);
      return Object.keys(err).length === 0;
    }

    async function handleSubmit(e) {
      e.preventDefault();
      if (!validate()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSubmitting(true);
      try {
        const newRequest = {
          ...form,
          id: Date.now(),
          status: "Pending",
          submittedAt: new Date().toISOString().split('T')[0],
        };
        setRequests((prev) => [...prev, newRequest]);
        alert("Vehicle quotation request submitted successfully! (mock)");
        setForm(initialState);
        setFiles({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
        setPreviews({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
      } catch (err) {
        console.error(err);
        alert("Failed to submit quote.");
      } finally {
        setSubmitting(false);
      }
    }

    useEffect(() => {
      const filtered = requests.filter(
        (req) =>
          req.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.mobile.includes(searchTerm)
      );
      setFilteredRequests(filtered);
    }, [searchTerm, requests]);

    const handleStatusChange = (id, newStatus) => {
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    };

    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
        {isAdmin ? (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              🚗 Vehicle Quote Management
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Manage and review vehicle quotation requests submitted by users.
            </p>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Reg Number, Owner Name, or Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border p-3 pl-10 shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Reg Number</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Make/Model</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Submitted</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{req.id}</td>
                      <td className="px-4 py-3 text-sm">{req.regNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {req.make} {req.model} ({req.variant})
                      </td>
                      <td className="px-4 py-3 text-sm">{req.ownerName}</td>
                      <td className="px-4 py-3 text-sm">
                        {req.mobile} / {req.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : req.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{req.submittedAt}</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, "Approved")}
                          className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                          title="Approve"
                          disabled={req.status !== "Pending"}
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, "Rejected")}
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          title="Reject"
                          disabled={req.status !== "Pending"}
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">🚗 Vehicle Quotation Request</h2>
            <p className="text-center text-gray-600 mb-6">
              Fill vehicle details and upload the required documents. We will contact you with quotes.
            </p>

            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded shadow-sm">
                Please correct the highlighted fields.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium">Registration Number</label>
                    <input
                      name="regNumber"
                      value={form.regNumber}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 pr-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.regNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="MH12AB1234"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium">Make</label>
                    <input
                      name="make"
                      value={form.make}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.make ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Maruti, Hyundai..."
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium">Model</label>
                    <input
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.model ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Swift / i20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Variant</label>
                    <input
                      name="variant"
                      value={form.variant}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border p-3 shadow-sm border-gray-300"
                      placeholder="VXi, ZXI, etc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Fuel Type</label>
                    <select
                      name="fuelType"
                      value={form.fuelType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border p-3 shadow-sm border-gray-300"
                    >
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>CNG</option>
                      <option>Electric</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Registration Year</label>
                    <input
                      name="regYear"
                      value={form.regYear}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.regYear ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="2018"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">RTO / State</label>
                    <input
                      name="rtoState"
                      value={form.rtoState}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.rtoState ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Mumbai (MH-01) / MH"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Ownership Type</label>
                    <select
                      name="ownershipType"
                      value={form.ownershipType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border p-3 shadow-sm border-gray-300"
                    >
                      <option>Individual</option>
                      <option>Company</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Owner Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative flex items-center">
                    <FaUser className="absolute left-3 text-gray-400" />
                    <input
                      name="ownerName"
                      value={form.ownerName}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 pl-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.ownerName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Owner Name"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <FaMobileAlt className="absolute left-3 text-gray-400" />
                    <input
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 pl-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.mobile ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <FaEnvelope className="absolute left-3 text-gray-400" />
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 pl-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <FaCity className="absolute left-3 text-gray-400" />
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border p-3 pl-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="City"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Upload Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["rcCopy", "drivingLicense", "oldPolicy", "idProof"].map((fileKey) => (
                    <div key={fileKey}>
                      <label className="block text-sm font-medium capitalize">{fileKey.replace(/([A-Z])/g, " $1")}</label>
                      <input
                        type="file"
                        name={fileKey}
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="mt-1 block w-full"
                      />
                      {previews[fileKey] && (
                        <div className="mt-2">
                          <a href={previews[fileKey]} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline">
                            Preview
                          </a>
                        </div>
                      )}
                      {errors[fileKey] && <p className="text-red-600 text-sm mt-1">{errors[fileKey]}</p>}
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Vehicle Photos (up to 3)</label>
                    <input
                      type="file"
                      name="vehiclePhotos"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                      className="mt-1 block w-full"
                    />
                    <div className="flex gap-3 mt-3">
                      {previews.vehiclePhotos.map((p, i) => (
                        <img key={i} src={p} alt={`vehicle-${i}`} className="w-24 h-16 object-cover rounded-lg border shadow-sm" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3 shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-md"
                  >
                    {submitting ? "Submitting..." : "Request Quote"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(initialState);
                      setFiles({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
                      setPreviews({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
                    }}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-100 shadow-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    );
  }