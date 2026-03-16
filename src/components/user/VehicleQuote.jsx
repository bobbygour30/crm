import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaMobileAlt, FaCity, FaTrash } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

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

export default function VehicleQuote() {
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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitSuccess(false);
  }

  function handleFileChange(e) {
    const { name, files: fileList } = e.target;
    if (!fileList) return;

    if (name === "vehiclePhotos") {
      const arr = Array.from(fileList).slice(0, 3);
      setFiles((prev) => ({ ...prev, vehiclePhotos: arr }));
      
      // Clean up old previews
      previews.vehiclePhotos.forEach(p => URL.revokeObjectURL(p));
      
      const p = arr.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => ({ ...prev, vehiclePhotos: p }));
    } else {
      const file = fileList[0];
      
      // Clean up old preview
      if (previews[name]) {
        URL.revokeObjectURL(previews[name]);
      }
      
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitSuccess(false);
  }

  function handleRemoveFile(fileKey) {
    if (fileKey === "vehiclePhotos") {
      files.vehiclePhotos.forEach(f => URL.revokeObjectURL(URL.createObjectURL(f)));
      setFiles((prev) => ({ ...prev, vehiclePhotos: [] }));
      setPreviews((prev) => ({ ...prev, vehiclePhotos: [] }));
    } else {
      if (previews[fileKey]) {
        URL.revokeObjectURL(previews[fileKey]);
      }
      setFiles((prev) => ({ ...prev, [fileKey]: null }));
      setPreviews((prev) => ({ ...prev, [fileKey]: null }));
    }
    setErrors((prev) => ({ ...prev, [fileKey]: "" }));
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
    setSubmitSuccess(false);
    
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(form).forEach((key) => {
        if (form[key] !== undefined && form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });
      
      // Append files
      Object.keys(files).forEach((key) => {
        if (key === "vehiclePhotos") {
          files[key].forEach((file) => {
            if (file) formData.append(key, file);
          });
        } else if (files[key]) {
          formData.append(key, files[key]);
        }
      });

      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/vehicle-quote`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit quote");
      }

      setSubmitSuccess(true);
      
      // Reset form
      setForm(initialState);
      
      // Clean up previews
      Object.values(previews).forEach(p => {
        if (Array.isArray(p)) {
          p.forEach(url => URL.revokeObjectURL(url));
        } else if (p) {
          URL.revokeObjectURL(p);
        }
      });
      
      setFiles({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
      setPreviews({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
      
      // Show success message
      alert("Vehicle quotation request submitted successfully!");
      
      // Redirect to dashboard if logged in, otherwise stay
      if (token) {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.message || "Failed to submit quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg mt-20">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">🚗 Vehicle Quotation Request</h2>
      <p className="text-center text-gray-600 mb-6">
        Fill vehicle details and upload the required documents. We will contact you with quotes.
      </p>

      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded shadow-sm">
          Your request has been submitted successfully! We'll contact you soon.
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded shadow-sm">
          Please correct the highlighted fields below.
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
        {/* Vehicle Details */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Registration Number *</label>
              <input
                name="regNumber"
                value={form.regNumber}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.regNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="MH12AB1234"
              />
              {errors.regNumber && <p className="text-red-600 text-sm mt-1">{errors.regNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Make *</label>
              <input
                name="make"
                value={form.make}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.make ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Maruti, Hyundai..."
              />
              {errors.make && <p className="text-red-600 text-sm mt-1">{errors.make}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Model *</label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Swift / i20"
              />
              {errors.model && <p className="text-red-600 text-sm mt-1">{errors.model}</p>}
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
              <label className="block text-sm font-medium">Registration Year *</label>
              <input
                name="regYear"
                value={form.regYear}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.regYear ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="2018"
              />
              {errors.regYear && <p className="text-red-600 text-sm mt-1">{errors.regYear}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">RTO / State *</label>
              <input
                name="rtoState"
                value={form.rtoState}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.rtoState ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mumbai (MH-01) / MH"
              />
              {errors.rtoState && <p className="text-red-600 text-sm mt-1">{errors.rtoState}</p>}
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

        {/* Owner Details */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Owner Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Owner Name *</label>
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
              {errors.ownerName && <p className="text-red-600 text-sm mt-1">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Mobile *</label>
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
              {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Email *</label>
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
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">City *</label>
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
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Pincode *</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.pincode ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="400001"
              />
              {errors.pincode && <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Upload Documents</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please upload the required documents below. Accepted formats: JPG, PNG, or PDF (Max 10MB each).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["rcCopy", "drivingLicense", "oldPolicy", "idProof"].map((fileKey) => (
              <div key={fileKey} className="space-y-2">
                <label className="block text-sm font-medium capitalize">
                  {fileKey.replace(/([A-Z])/g, " $1")} {fileKey === "rcCopy" || fileKey === "drivingLicense" ? "*" : "(Optional)"}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors relative">
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-gray-600">
                      {files[fileKey] ? files[fileKey].name : "Drop your file here or click to upload"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload 1 file (JPG, PNG, or PDF)
                    </p>
                  </div>
                  <input
                    type="file"
                    name={fileKey}
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  {previews[fileKey] && (
                    <div className="flex items-center space-x-2">
                      <a
                        href={previews[fileKey]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 text-sm hover:underline"
                      >
                        Preview
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(fileKey)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {errors[fileKey] && <p className="text-red-600 text-sm">{errors[fileKey]}</p>}
              </div>
            ))}

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium">
                Vehicle Photos (Optional - up to 3)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors relative">
                <div className="space-y-1 text-center">
                  <p className="text-sm text-gray-600">
                    {files.vehiclePhotos.length > 0
                      ? `${files.vehiclePhotos.length} file(s) selected`
                      : "Drop your files here or click to upload"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload up to 3 images (JPG, PNG)
                  </p>
                </div>
                <input
                  type="file"
                  name="vehiclePhotos"
                  accept="image/*"
                  onChange={handleFileChange}
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                {previews.vehiclePhotos.map((p, i) => (
                  <div key={i} className="relative">
                    <img
                      src={p}
                      alt={`vehicle-${i}`}
                      className="w-24 h-16 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("vehiclePhotos")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Submit */}
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
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {submitting ? "Submitting..." : "Request Quote"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initialState);
                Object.values(previews).forEach(p => {
                  if (Array.isArray(p)) {
                    p.forEach(url => URL.revokeObjectURL(url));
                  } else if (p) {
                    URL.revokeObjectURL(p);
                  }
                });
                setFiles({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
                setPreviews({ rcCopy: null, drivingLicense: null, oldPolicy: null, idProof: null, vehiclePhotos: [] });
                setErrors({});
              }}
              className="px-6 py-3 border rounded-lg hover:bg-gray-100 shadow-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}