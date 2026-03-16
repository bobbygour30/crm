import React, { useState, useEffect } from "react";
import { FaCar, FaUser, FaEnvelope, FaMobileAlt, FaCity, FaSearch, FaEye, FaCheck, FaTimes, FaTrash, FaDownload } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export default function VehicleAdmin({ isAdmin }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch quotes on mount
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/vehicle-quote`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.quotes);
        setFilteredRequests(data.quotes);
      } else {
        console.error("Failed to fetch quotes:", data.message);
      }
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = requests;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.regNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.mobile?.includes(searchTerm) ||
          req.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, requests, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/vehicle-quote/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );
        alert(`Quote ${newStatus} successfully!`);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quote? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/vehicle-quote/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setRequests((prev) => prev.filter((req) => req._id !== id));
        alert("Quote deleted successfully!");
      } else {
        alert(data.message || "Failed to delete quote");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete quote");
    }
  };

  const viewDetails = (quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (url) => {
    if (!url) return null;
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={url} alt="preview" className="h-16 w-16 object-cover rounded" />;
    } else if (url.match(/\.pdf$/i)) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
          <FaDownload /> PDF
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
        View File
      </a>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🚗 Vehicle Quote Management
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Manage and review vehicle quotation requests submitted by users.
      </p>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Reg Number, Owner Name, Mobile, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border p-3 pl-10 shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border rounded-lg shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading quotes...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">S.No</th>
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
              {filteredRequests.map((req, index) => (
                <tr key={req._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">{req.regNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    {req.make} {req.model} ({req.variant || 'N/A'})
                  </td>
                  <td className="px-4 py-3 text-sm">{req.ownerName}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>{req.mobile}</div>
                    <div className="text-xs text-gray-500">{req.email}</div>
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
                  <td className="px-4 py-3 text-sm">{formatDate(req.submittedAt)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewDetails(req)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleStatusChange(req._id, "Approved")}
                        className={`p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 ${
                          req.status !== "Pending" ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title="Approve"
                        disabled={req.status !== "Pending"}
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleStatusChange(req._id, "Rejected")}
                        className={`p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 ${
                          req.status !== "Pending" ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title="Reject"
                        disabled={req.status !== "Pending"}
                      >
                        <FaTimes />
                      </button>
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No vehicle quotes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Vehicle Quote Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedQuote.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : selectedQuote.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {selectedQuote.status}
                </span>
                <span className="text-sm text-gray-500">
                  Submitted: {formatDate(selectedQuote.submittedAt)}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FaCar className="text-indigo-600" /> Vehicle Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Reg Number</p>
                    <p className="font-medium">{selectedQuote.regNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Make</p>
                    <p className="font-medium">{selectedQuote.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium">{selectedQuote.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variant</p>
                    <p className="font-medium">{selectedQuote.variant || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-medium">{selectedQuote.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reg Year</p>
                    <p className="font-medium">{selectedQuote.regYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RTO/State</p>
                    <p className="font-medium">{selectedQuote.rtoState}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ownership</p>
                    <p className="font-medium">{selectedQuote.ownershipType}</p>
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FaUser className="text-indigo-600" /> Owner Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedQuote.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{selectedQuote.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedQuote.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{selectedQuote.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pincode</p>
                    <p className="font-medium">{selectedQuote.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(selectedQuote.notes || selectedQuote.kmsDriven || selectedQuote.policyExpiry) && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-3">Additional Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedQuote.kmsDriven && (
                      <div>
                        <p className="text-sm text-gray-500">KMs Driven</p>
                        <p className="font-medium">{selectedQuote.kmsDriven}</p>
                      </div>
                    )}
                    {selectedQuote.policyExpiry && (
                      <div>
                        <p className="text-sm text-gray-500">Policy Expiry</p>
                        <p className="font-medium">{selectedQuote.policyExpiry}</p>
                      </div>
                    )}
                    {selectedQuote.prevInsurer && (
                      <div>
                        <p className="text-sm text-gray-500">Previous Insurer</p>
                        <p className="font-medium">{selectedQuote.prevInsurer}</p>
                      </div>
                    )}
                    {selectedQuote.prevNCB && (
                      <div>
                        <p className="text-sm text-gray-500">Previous NCB</p>
                        <p className="font-medium">{selectedQuote.prevNCB}</p>
                      </div>
                    )}
                    {selectedQuote.claimInLastYear && (
                      <div>
                        <p className="text-sm text-gray-500">Claim in Last Year</p>
                        <p className="font-medium">{selectedQuote.claimInLastYear}</p>
                      </div>
                    )}
                  </div>
                  {selectedQuote.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium bg-gray-50 p-3 rounded">{selectedQuote.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3">Uploaded Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedQuote.rcCopy && (
                    <div>
                      <p className="text-sm text-gray-500">RC Copy</p>
                      {getFileIcon(selectedQuote.rcCopy)}
                    </div>
                  )}
                  {selectedQuote.drivingLicense && (
                    <div>
                      <p className="text-sm text-gray-500">Driving License</p>
                      {getFileIcon(selectedQuote.drivingLicense)}
                    </div>
                  )}
                  {selectedQuote.oldPolicy && (
                    <div>
                      <p className="text-sm text-gray-500">Old Policy</p>
                      {getFileIcon(selectedQuote.oldPolicy)}
                    </div>
                  )}
                  {selectedQuote.idProof && (
                    <div>
                      <p className="text-sm text-gray-500">ID Proof</p>
                      {getFileIcon(selectedQuote.idProof)}
                    </div>
                  )}
                </div>
                {selectedQuote.vehiclePhotos && selectedQuote.vehiclePhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Vehicle Photos</p>
                    <div className="flex gap-3 flex-wrap">
                      {selectedQuote.vehiclePhotos.map((photo, idx) => (
                        <a key={idx} href={photo} target="_blank" rel="noreferrer">
                          <img src={photo} alt={`vehicle-${idx}`} className="h-20 w-20 object-cover rounded-lg border shadow-sm hover:opacity-80 transition" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              {selectedQuote.status === "Pending" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedQuote._id, "Approved");
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Quote
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedQuote._id, "Rejected");
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Quote
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}