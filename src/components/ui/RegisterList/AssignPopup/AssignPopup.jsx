"use client";

import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CompanyCard = dynamic(() =>
  import("@/components/ui/RegisterList/CompanyCard/CompanyCard")
);

export default function AssignPopup({
  open,
  companies,
  selectedUser,
  selectedCompanies,
  selectedLocations,
  handleClosePopup,
  handleSave,
  saving,
  handleCompanyChange,
  handleRemoveCompany,
  handleLocationToggle,
  handleSelectAllLocations,
  handleDeselectAllLocations,
  isAllLocationsSelected,
}) {
  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center 
                   bg-black/50 dark:bg-black/70"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="w-[90%] max-w-3xl relative p-6 rounded-xl 
                     bg-white dark:bg-gray-900 
                     text-gray-900 dark:text-gray-100 
                     shadow-lg transition-colors duration-300"
        >
          <button
            onClick={handleClosePopup}
            className="absolute top-4 right-4 
                       text-gray-500 dark:text-gray-400 
                       hover:text-red-600 dark:hover:text-red-400 
                       transition-colors"
          >
            <X />
          </button>
          <h3 className="text-xl font-semibold mb-4">
            Assign Companies & Locations to{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {selectedUser?.name || ""}
            </span>
          </h3>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-auto">
            {companies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                selectedCompanies={selectedCompanies}
                selectedLocations={selectedLocations}
                handleCompanyChange={handleCompanyChange}
                handleRemoveCompany={handleRemoveCompany}
                handleLocationToggle={handleLocationToggle}
                handleSelectAllLocations={handleSelectAllLocations}
                handleDeselectAllLocations={handleDeselectAllLocations}
                isAllLocationsSelected={isAllLocationsSelected}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClosePopup}
              className="px-4 py-2 rounded-lg 
                         bg-gray-200 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-300 dark:hover:bg-gray-600 
                         transition-colors"
            >
              Cancel
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${
                saving
                  ? "bg-blue-300 dark:bg-blue-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Save
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
