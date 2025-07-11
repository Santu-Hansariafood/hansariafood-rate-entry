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
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white p-6 rounded-xl w-[90%] max-w-3xl relative"
        >
          <button
            onClick={handleClosePopup}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
          >
            <X />
          </button>
          <h3 className="text-xl font-semibold mb-4">
            Assign Companies & Locations to{" "}
            <span className="text-blue-600">{selectedUser?.name || ""}</span>
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
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                saving
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
