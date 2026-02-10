
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Dropdown from "@/components/common/Dropdown/Dropdown";
import Table from "@/components/common/Tables/Tables";
import Modal from "@/components/common/Modal/Modal";
import { toast } from "react-toastify";
import {
  MapPin,
  Building2,
  Truck,
  DollarSign,
  Save,
  Loader2,
  ArrowRight,
  Trash2,
  Edit,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COMMODITIES = ["Maize DDGS", "M DOC", "Soya"];

export default function FreightManager() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITIES[0]);
  const [editingId, setEditingId] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Derived Company Lists
  const sellerCompanies = React.useMemo(() => {
    return companies.filter(c => 
      c.type?.includes('seller') && 
      c.commodities?.some(comm => typeof comm === 'string' && comm.toLowerCase() === selectedCommodity.toLowerCase())
    );
  }, [companies, selectedCommodity]);

  const buyerCompanies = React.useMemo(() => {
    return companies.filter(c => 
      c.type?.includes('buyer') && 
      c.commodities?.some(comm => typeof comm === 'string' && comm.toLowerCase() === selectedCommodity.toLowerCase())
    );
  }, [companies, selectedCommodity]);

  // Reset form when commodity changes - only if not editing
  useEffect(() => {
    if (!editingId) {
        setFormData({
        company: "",
        location: "",
        deliveryCompany: "",
        deliveryLocation: "",
        freightRate: "",
        });
        setSourceLocations([]);
        setDeliveryLocations([]);
    }
  }, [selectedCommodity, editingId]);

  // List State
  const [freights, setFreights] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingFreight, setViewingFreight] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company: "",
    location: "",
    deliveryCompany: "",
    deliveryLocation: "",
    freightRate: "",
  });

  // Derived State for Dropdowns
  const [sourceLocations, setSourceLocations] = useState([]);
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchFreights();
  }, [selectedCommodity, pagination.page, searchTerm]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/managecompany?limit=1000");
      if (response.data && response.data.companies) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  const fetchFreights = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/freight", {
        params: {
          commodity: selectedCommodity,
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
        },
      });
      if (response.data.success) {
        setFreights(response.data.freights);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching freights:", error);
      // toast.error("Failed to load freight list"); // Avoid spamming toast on typing
    }
  }, [selectedCommodity, pagination.page, pagination.limit, searchTerm]);

  // Handle Source Company Change
  const handleCompanyChange = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    setFormData((prev) => ({
      ...prev,
      company: companyId,
      location: "", // Reset location
    }));
    setSourceLocations(company ? company.location : []);
  };

  // Handle Delivery Company Change
  const handleDeliveryCompanyChange = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    setFormData((prev) => ({
      ...prev,
      deliveryCompany: companyId,
      deliveryLocation: "", // Reset location
    }));
    setDeliveryLocations(company ? company.location : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.location || !formData.deliveryCompany || !formData.deliveryLocation || !formData.freightRate || !selectedCommodity) {
      toast.error("Please fill in all fields including Commodity");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        commodity: selectedCommodity, // Ensure current selected commodity is used
        company: formData.company,
        location: formData.location,
        deliveryCompany: formData.deliveryCompany,
        deliveryLocation: formData.deliveryLocation,
        freightRate: Number(formData.freightRate),
      };

      let response;
      if (editingId) {
        response = await axiosInstance.put(`/freight/${editingId}`, payload);
      } else {
        response = await axiosInstance.post("/freight", payload);
      }

      if (response.data.success) {
        toast.success(
          editingId ? "Freight updated successfully!" : "Freight added successfully!"
        );
        resetForm();
        setIsEditModalOpen(false); // Close modal on success
        fetchFreights();
      }
    } catch (error) {
      console.error("Error saving freight:", error);
      toast.error(error.response?.data?.error || "Failed to save freight");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: "",
      location: "",
      deliveryCompany: "",
      deliveryLocation: "",
      freightRate: "",
    });
    setSourceLocations([]);
    setDeliveryLocations([]);
    setEditingId(null);
    setIsEditModalOpen(false);
  };

  const handleEdit = (freight) => {
    // Ensure we switch to the correct commodity context if needed, though usually list is filtered by commodity
    if (freight.commodity && freight.commodity !== selectedCommodity) {
        setSelectedCommodity(freight.commodity);
    }

    const company = companies.find((c) => c._id === freight.company._id);
    const deliveryCompany = companies.find(
      (c) => c._id === freight.deliveryCompany._id
    );

    setSourceLocations(company ? company.location : []);
    setDeliveryLocations(deliveryCompany ? deliveryCompany.location : []);

    setFormData({
      company: freight.company._id,
      location: freight.location,
      deliveryCompany: freight.deliveryCompany._id,
      deliveryLocation: freight.deliveryLocation,
      freightRate: freight.freightRate,
    });
    setEditingId(freight._id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this freight entry?")) return;
    try {
      const response = await axiosInstance.delete(`/freight/${id}`);
      if (response.data.success) {
        toast.success("Freight deleted successfully");
        fetchFreights();
      }
    } catch (error) {
      toast.error("Failed to delete freight");
    }
  };

  const getRateDifference = (current, previous) => {
    if (!previous) return { icon: <Minus size={14} />, color: "text-gray-500", diff: 0 };
    const diff = current - previous;
    if (diff > 0)
      return {
        icon: <ArrowUp size={14} />,
        color: "text-red-500",
        diff: `+${diff}`,
      };
    if (diff < 0)
      return {
        icon: <ArrowDown size={14} />,
        color: "text-green-500",
        diff: diff,
      };
    return { icon: <Minus size={14} />, color: "text-gray-500", diff: 0 };
  };

  const columns = [
    {
      header: "ID",
      accessor: "_id",
      cell: (item) => (
        <span className="font-mono text-gray-500">
          #{item._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Loading Station",
      accessor: "company",
      cell: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {item.company?.name}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin size={12} /> {item.location}
          </div>
        </div>
      ),
    },
    {
      header: "Unloading Station",
      accessor: "deliveryCompany",
      cell: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {item.deliveryCompany?.name}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin size={12} /> {item.deliveryLocation}
          </div>
        </div>
      ),
    },
    {
      header: "Rate (₹)",
      accessor: "freightRate",
      cell: (item) => {
        const { icon, color, diff } = getRateDifference(
          item.freightRate,
          item.previousRate
        );
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              ₹{item.freightRate}
            </span>
            {diff !== 0 && (
              <span
                className={`flex items-center text-xs font-bold ${color} bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded-md`}
              >
                {icon} {Math.abs(diff)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewingFreight(item)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Freight Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage freight rates for different commodities
          </p>
        </div>
      </div>

      {/* Commodity Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-xl">
        {COMMODITIES.map((comm) => (
          <button
            key={comm}
            onClick={() => {
                setSelectedCommodity(comm);
                setPagination(p => ({...p, page: 1}));
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              selectedCommodity === comm
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {comm}
          </button>
        ))}
      </div>

      {/* Add New Freight Form (Only shown when not editing) */}
      {!editingId && (
        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Source Section */}
            <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} /> Source Details
                </h3>

                <div className="space-y-2">
                <Dropdown
                    key={`source-company-${selectedCommodity}`}
                    label="Company Name"
                    options={sellerCompanies.map((c) => ({
                    label: c.name,
                    value: c._id,
                    }))}
                    value={formData.company}
                    onChange={handleCompanyChange}
                    placeholder="Select Seller Company"
                />
                </div>

                <div className="space-y-2">
                <Dropdown
                    key={`source-location-${selectedCommodity}-${formData.company}`}
                    label="Assign Location"
                    options={sourceLocations.map((loc) => {
                    const company = companies.find((c) => c._id === formData.company);
                    return {
                        label: company ? `${company.name} - ${loc}` : loc,
                        value: loc,
                    };
                    })}
                    value={formData.location}
                    onChange={(val) =>
                    setFormData({ ...formData, location: val })
                    }
                    placeholder="Select Location"
                    disabled={!formData.company}
                />
                </div>
            </div>

            {/* Delivery Section */}
            <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Truck size={16} /> Delivery Details
                </h3>

                <div className="space-y-2">
                <Dropdown
                    key={`delivery-company-${selectedCommodity}`}
                    label="Delivery Company"
                    options={buyerCompanies.map((c) => ({
                    label: c.name,
                    value: c._id,
                    }))}
                    value={formData.deliveryCompany}
                    onChange={handleDeliveryCompanyChange}
                    placeholder="Select Buyer Company"
                />
                </div>

                <div className="space-y-2">
                <Dropdown
                    key={`delivery-location-${selectedCommodity}-${formData.deliveryCompany}`}
                    label="Assign Location"
                    options={deliveryLocations.map((loc) => {
                    const company = companies.find(
                        (c) => c._id === formData.deliveryCompany
                    );
                    return {
                        label: company ? `${company.name} - ${loc}` : loc,
                        value: loc,
                    };
                    })}
                    value={formData.deliveryLocation}
                    onChange={(val) =>
                    setFormData({ ...formData, deliveryLocation: val })
                    }
                    placeholder="Select Location"
                    disabled={!formData.deliveryCompany}
                />
                </div>
            </div>

            {/* Arrow Indicator (Visual) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 items-center justify-center shadow-sm z-10">
                <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            </div>

            {/* Freight Rate */}
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <div className="max-w-md mx-auto space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                <DollarSign size={16} /> Freight Rate (₹/MT)
                </label>
                <input
                type="number"
                value={formData.freightRate}
                onChange={(e) =>
                    setFormData({ ...formData, freightRate: e.target.value })
                }
                placeholder="Enter freight rate..."
                className="w-full px-4 py-3 text-center text-lg font-bold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                />
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
                <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                Add Freight
                </button>
            </div>
        </form>
      )}

      {/* List Section */}
      <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Freight List
            </h3>
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search company or location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <Table data={freights} columns={columns} />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal onClose={resetForm} className="max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                    <Edit size={20} className="text-blue-600" />
                    Edit Freight for {selectedCommodity}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Source Section */}
                    <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Building2 size={16} /> Source Details
                        </h3>

                        <div className="space-y-2">
                        <Dropdown
                            key={`edit-source-company-${selectedCommodity}`}
                            label="Company Name"
                            options={sellerCompanies.map((c) => ({
                            label: c.name,
                            value: c._id,
                            }))}
                            value={formData.company}
                            onChange={handleCompanyChange}
                            placeholder="Select Seller Company"
                        />
                        </div>

                        <div className="space-y-2">
                        <Dropdown
                            key={`edit-source-location-${selectedCommodity}-${formData.company}`}
                            label="Assign Location"
                            options={sourceLocations.map((loc) => {
                            const company = companies.find((c) => c._id === formData.company);
                            return {
                                label: company ? `${company.name} - ${loc}` : loc,
                                value: loc,
                            };
                            })}
                            value={formData.location}
                            onChange={(val) =>
                            setFormData({ ...formData, location: val })
                            }
                            placeholder="Select Location"
                            disabled={!formData.company}
                        />
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Truck size={16} /> Delivery Details
                        </h3>

                        <div className="space-y-2">
                        <Dropdown
                            key={`edit-delivery-company-${selectedCommodity}`}
                            label="Delivery Company"
                            options={buyerCompanies.map((c) => ({
                            label: c.name,
                            value: c._id,
                            }))}
                            value={formData.deliveryCompany}
                            onChange={handleDeliveryCompanyChange}
                            placeholder="Select Buyer Company"
                        />
                        </div>

                        <div className="space-y-2">
                        <Dropdown
                            key={`edit-delivery-location-${selectedCommodity}-${formData.deliveryCompany}`}
                            label="Assign Location"
                            options={deliveryLocations.map((loc) => {
                            const company = companies.find(
                                (c) => c._id === formData.deliveryCompany
                            );
                            return {
                                label: company ? `${company.name} - ${loc}` : loc,
                                value: loc,
                            };
                            })}
                            value={formData.deliveryLocation}
                            onChange={(val) =>
                            setFormData({ ...formData, deliveryLocation: val })
                            }
                            placeholder="Select Location"
                            disabled={!formData.deliveryCompany}
                        />
                        </div>
                    </div>
                    </div>

                    {/* Freight Rate */}
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <div className="max-w-md mx-auto space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                        <DollarSign size={16} /> Freight Rate (₹/MT)
                        </label>
                        <input
                        type="number"
                        value={formData.freightRate}
                        onChange={(e) =>
                            setFormData({ ...formData, freightRate: e.target.value })
                        }
                        placeholder="Enter freight rate..."
                        className="w-full px-4 py-3 text-center text-lg font-bold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Update Freight
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
      )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewingFreight && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => setViewingFreight(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Truck className="text-blue-600" /> Freight Details
                        </h3>
                        <button onClick={() => setViewingFreight(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Loading Station</label>
                            <div className="font-bold text-gray-800 dark:text-gray-100 mt-1">{viewingFreight.company?.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{viewingFreight.location}</div>
                        </div>
                        
                        <div className="flex justify-center">
                            <ArrowDown className="text-gray-300" />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Unloading Station</label>
                            <div className="font-bold text-gray-800 dark:text-gray-100 mt-1">{viewingFreight.deliveryCompany?.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{viewingFreight.deliveryLocation}</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                            <div>
                                <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Current Rate</label>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{viewingFreight.freightRate}</div>
                            </div>
                            <div className="text-right">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Previous Rate</label>
                                <div className="text-lg font-medium text-gray-600 dark:text-gray-400">₹{viewingFreight.previousRate || viewingFreight.freightRate}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
