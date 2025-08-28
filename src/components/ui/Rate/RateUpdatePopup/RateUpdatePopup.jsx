"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { RefreshCw } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";

const RateUpdatePopup = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/managecompany?limit=5000");
        const companyList = res.data?.companies || [];
        setCompanies(companyList);

        const todayRes = await axiosInstance.get("/rateupdate");
        const today = new Date().toISOString().split("T")[0];
        const todayUpdate = todayRes.data?.data?.find((u) => u.date === today);

        if (todayUpdate) {
          setSelectedCompanies(todayUpdate.companies);
        } else {
          setSelectedCompanies([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load companies or updates");
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => dialogRef.current?.focus(), 0);
      return () => {
        document.body.style.overflow = previousOverflow || "auto";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open]);

  const toggleCompany = (name) => {
    setSelectedCompanies((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.post("/rateupdate", {
        companies: selectedCompanies,
      });

      if (res.data.success) {
        toast.success(`Saved ${selectedCompanies.length} companies for today`);
        setOpen(false);
        try {
          router.refresh();
        } catch {}
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save companies");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col items-start">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          Already updated
        </div>
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
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 
                         rounded-2xl shadow-2xl w-[92vw] sm:w-[90vw] max-w-6xl max-h-[88vh] 
                         flex flex-col overflow-hidden border border-white/20"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="rate-update-title"
              tabIndex={-1}
              ref={dialogRef}
            >
              <div className="sticky top-0 flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 shadow">
                <h2
                  id="rate-update-title"
                  className="text-xl font-bold text-white"
                >
                  No Buying Advisory — Selected Companies for Today
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white text-2xl hover:scale-110 transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {loading ? (
                  <Loading />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {companies.map((company) => (
                      <label
                        key={company._id}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer 
                                    border transition shadow-sm 
                                    ${
                                      selectedCompanies.includes(company.name)
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500"
                                        : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700"
                                    }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.name)}
                          onChange={() => toggleCompany(company.name)}
                          className="accent-green-600"
                        />
                        <span className="truncate font-medium">
                          {company.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50/95 backdrop-blur dark:bg-gray-900/80">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                             text-gray-700 dark:text-gray-200 hover:bg-gray-300 
                             dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 
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
    </Suspense>
  );
};

export default RateUpdatePopup;
