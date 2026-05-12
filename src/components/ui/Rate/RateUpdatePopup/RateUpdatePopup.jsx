"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import useCompaniesWithRateUpdate from "@/hooks/Rate/useCompaniesWithRateUpdate";
import useSaveRateUpdate from "@/hooks/Rate/useSaveRateUpdate";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
const RateUpdateHeader = dynamic(() =>
  import("./RateUpdateHeader/RateUpdateHeader")
);
const RateUpdateCompanyList = dynamic(() =>
  import("./RateUpdateCompanyList/RateUpdateCompanyList")
);
const RateUpdateFooter = dynamic(() =>
  import("./RateUpdateFooter/RateUpdateFooter")
);

const RateUpdatePopup = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dialogRef = useRef(null);

  const { companies, selectedCompanies, setSelectedCompanies, loading } =
    useCompaniesWithRateUpdate(open);

  const { saveRateUpdate, saving } = useSaveRateUpdate(router);
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e) => e.key === "Escape" && setOpen(false);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => dialogRef.current?.focus(), 0);

      return () => {
        document.body.style.overflow = prev || "auto";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open]);

  const toggleCompany = (name) => {
    setSelectedCompanies((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    saveRateUpdate(selectedCompanies, () => setOpen(false));
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
                   w-full max-w-7xl 
                   max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="rate-update-title"
              tabIndex={-1}
              ref={dialogRef}
            >
              <RateUpdateHeader onClose={() => setOpen(false)} />
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <RateUpdateCompanyList
                  companies={companies}
                  selectedCompanies={selectedCompanies}
                  toggleCompany={toggleCompany}
                  loading={loading}
                />
              </div>

              <RateUpdateFooter
                onCancel={() => setOpen(false)}
                onSave={handleSave}
                saving={saving}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Suspense>
  );
};

export default RateUpdatePopup;
