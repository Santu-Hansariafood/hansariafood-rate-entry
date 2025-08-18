"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { RefreshCw } from "lucide-react";

const RateUpdatePopup = () => {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch companies when modal opens
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/managecompany?limit=1000");
        setCompanies(res.data?.companies || []);
      } catch (error) {
        console.error(error);
        toast.error("⚠️ Failed to load companies");
      } finally {
        setLoading(false);
      }
    };
    if (open) fetchCompanies();
  }, [open]);

  const toggleCompany = (id) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    toast.success(`✅ Selected ${selectedCompanies.length} companies`);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium 
                   bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                   rounded-full shadow-md hover:shadow-lg hover:scale-105 
                   transition-all duration-300"
      >
        <RefreshCw size={18} />
        Update Rates
      </button>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 
                         rounded-2xl shadow-2xl w-[90vw] max-w-5xl max-h-[85vh] 
                         flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                <h2 className="text-xl font-bold text-white">Select Companies</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white text-2xl hover:scale-110 transition"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {loading ? (
                  <p className="text-center text-gray-500">Loading companies...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {companies.map((company) => (
                      <label
                        key={company._id}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer 
                                    border transition shadow-sm 
                                    ${
                                      selectedCompanies.includes(company._id)
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500"
                                        : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700"
                                    }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company._id)}
                          onChange={() => toggleCompany(company._id)}
                          className="accent-green-600"
                        />
                        <span className="truncate font-medium">{company.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 dark:bg-gray-900">
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                             text-gray-700 dark:text-gray-200 hover:bg-gray-300 
                             dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 
                             text-white font-medium shadow-md hover:scale-105 
                             hover:shadow-lg transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RateUpdatePopup;
