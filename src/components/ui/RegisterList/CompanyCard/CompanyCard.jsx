"use client";

import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { Trash2, CheckSquare, Square } from "lucide-react";
import { Suspense } from "react";

export default function CompanyCard({
  company,
  selectedCompanies,
  selectedLocations,
  handleCompanyChange,
  handleRemoveCompany,
  handleLocationToggle,
  handleSelectAllLocations,
  handleDeselectAllLocations,
  isAllLocationsSelected,
}) {
  const isSelected = selectedCompanies.includes(company._id);

  return (
    <Suspense fallback={<Loading />}>
      <div className="border rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div
            className="font-medium text-lg text-gray-800 truncate max-w-[75%]"
            title={company.name}
          >
            {company.name || "Unnamed Company"}
          </div>

          {isSelected ? (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  isAllLocationsSelected(company._id)
                    ? handleDeselectAllLocations(company._id)
                    : handleSelectAllLocations(company._id)
                }
                className="text-sm text-blue-600 hover:underline"
              >
                {isAllLocationsSelected(company._id)
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <Trash2
                onClick={() => handleRemoveCompany(company._id)}
                className="text-red-500 cursor-pointer"
              />
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCompanyChange(company._id)}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            >
              Select Company
            </motion.button>
          )}
        </div>

        {isSelected && (
          <div className="mt-3 flex flex-wrap gap-2">
            {company.location.map((loc) => {
              const isLocSelected = selectedLocations.includes(loc);
              return (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={loc}
                  onClick={() => handleLocationToggle(loc)}
                  className={`flex items-center gap-2 border px-3 py-1 rounded-md text-sm ${
                    isLocSelected
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "bg-white border-gray-300 text-gray-600"
                  }`}
                >
                  {isLocSelected ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                  {loc}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </Suspense>
  );
}
