"use client";

import React from "react";
import { X } from "lucide-react";
import Title from "@/components/common/Title/Title";

export default function CompanyViewPopup({
  open,
  onClose,
  assignedCompanies = [],
  userName,
}) {
  if (!open) return null;

  const validCompanies = assignedCompanies.filter(
    (company) => company?.companyId?.name
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
        >
          <X />
        </button>

        <Title text={`Assigned Companies for ${userName || "User"}`} />

        {validCompanies.length > 0 ? (
          <div className="space-y-4 mt-4">
            {validCompanies.map((company, idx) => (
              <div
                key={company.companyId._id || idx}
                className="bg-gray-100 p-4 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-semibold text-blue-700">
                  {company.companyId.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {Array.isArray(company.locations) &&
                  company.locations.length > 0 ? (
                    company.locations.map((loc, i) => (
                      <span
                        key={i}
                        className="bg-blue-200 text-sm text-blue-900 px-3 py-1 rounded-full"
                      >
                        {loc || "Unnamed Location"}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 col-span-full text-sm">
                      No locations assigned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No valid companies assigned.</p>
        )}
      </div>
    </div>
  );
}
