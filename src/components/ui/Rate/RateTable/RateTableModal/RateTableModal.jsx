import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const RateTableBody = dynamic(() => import("../RateTableBody/RateTableBody"));

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
}) {
  return (
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
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">
            Rates for {selectedCompany}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
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
          />
        </Suspense>
        <div className="p-4 border-t bg-white">{children}</div>
      </motion.div>
    </motion.div>
  );
}
