"use client";

import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useCallback } from "react";

const RateTableBody = dynamic(() => import("../RateTableBody/RateTableBody"), {
  loading: () => <Loading />,
});

const palette = [
  { bg: "bg-blue-100", text: "text-blue-800", ring: "ring-blue-300" },
  { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-300" },
  { bg: "bg-purple-100", text: "text-purple-800", ring: "ring-purple-300" },
  { bg: "bg-pink-100", text: "text-pink-800", ring: "ring-pink-300" },
  { bg: "bg-yellow-100", text: "text-yellow-800", ring: "ring-yellow-300" },
];

export default function RateTableModal({
  selectedCompany,
  onClose,
  rates,
  allRatesFilled,
  editIndex,
  handleEdit,
  handleSave,
  setRates,
  actualStartIndex,
  children,
  commodity,
  selectedCommodities,
  availableCommodities,
  onCommodityToggle,
}) {
  const renderFilter = useCallback(
    () =>
      availableCommodities?.length > 1 && (
        <div className="mt-2 text-sm text-gray-700">
          <p className="font-medium mb-1">Filter by Commodity:</p>
          <div className="flex flex-wrap gap-3">
            {availableCommodities.map((c, i) => {
              const { bg, text, ring } = palette[i % palette.length];
              const isChecked = selectedCommodities.includes(c);
              return (
                <label key={c} className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onCommodityToggle(c)}
                    className="sr-only peer"
                  />
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 transition
                      ${bg} ${text}
                      peer-checked:ring-2 peer-checked:${ring}
                      hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:${ring}
                    `}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                    {c}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ),
    [availableCommodities, selectedCommodities, onCommodityToggle]
  );

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden"
        >
          <div className="p-6 border-b">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Rates for {selectedCompany}
                </h3>
                {renderFilter()}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            <RateTableBody
              rates={rates}
              allRatesFilled={allRatesFilled}
              editIndex={editIndex}
              handleEdit={handleEdit}
              handleSave={handleSave}
              setRates={setRates}
              actualStartIndex={actualStartIndex}
              commodity={commodity}
            />
          </Suspense>

          <div className="p-4 border-t bg-white">{children}</div>
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
