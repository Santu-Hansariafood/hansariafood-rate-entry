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
      <div
        className="border rounded-xl p-4 
                      border-gray-300 dark:border-gray-700 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100 
                      transition-colors duration-300"
      >
        <div className="flex justify-between items-center">
          <div
            className="font-medium text-lg truncate max-w-[75%] 
                       text-gray-800 dark:text-gray-100"
            title={company.name}
          >
            {company.name || "Unnamed Company"}
          </div>
          {isSelected ? (
            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  isAllLocationsSelected(company._id)
                    ? handleDeselectAllLocations(company._id)
                    : handleSelectAllLocations(company._id)
                }
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isAllLocationsSelected(company._id)
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <Trash2
                onClick={() => handleRemoveCompany(company._id)}
                className="text-red-500 dark:text-red-400 cursor-pointer"
              />
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCompanyChange(company._id)}
              className="bg-blue-500 dark:bg-blue-600 
                         text-white px-3 py-1 rounded-md text-sm 
                         hover:bg-blue-600 dark:hover:bg-blue-700 
                         transition-colors"
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
                  className={`flex items-center gap-2 border px-3 py-1 rounded-md text-sm transition-colors
                    ${
                      isLocSelected
                        ? "bg-green-100 dark:bg-green-800 border-green-500 text-green-700 dark:text-green-200"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
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
