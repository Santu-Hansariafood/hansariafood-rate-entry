import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { X, Download } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const SaudaSharePopup = ({
  company,
  date,
  saudaEntries,
  rateData,
  onClose,
}) => {
  const containerId = "sauda-summary-container";
  const watermarkUrl = "/logo/logo1.png";

  const getRateForUnit = (unit) => {
    const match = rateData.find(
      (r) => r.location === unit && r.company === company
    );
    return match?.newRate ?? null;
  };

  const entriesWithValidRate = Object.entries(saudaEntries || {}).filter(
    ([unit]) => getRateForUnit(unit) !== null
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto transition-colors">
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-500 dark:text-gray-300 hover:text-red-500 p-1 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-between items-center mb-4">
            <Title text="Share Sauda Summary" />
            <button
              onClick={() =>
                exportWithWatermarkToPDF(containerId, watermarkUrl)
              }
              className="flex items-center gap-2 px-4 py-1 border border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div
            id={containerId}
            className="px-2 pb-4 bg-white dark:bg-gray-900 relative transition-colors"
          >
            <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
              Company: {company}
            </p>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-400">
              Date: {date}
            </p>

            {entriesWithValidRate.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No units with rate available to display.
              </p>
            ) : (
              <div className="space-y-4">
                {entriesWithValidRate.map(([unit, entries], idx) => {
                  const rate = getRateForUnit(unit);
                  return (
                    <div
                      key={unit}
                      className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm transition-colors"
                    >
                      <h3 className="font-semibold text-md mb-2 text-gray-700 dark:text-gray-200">
                        {idx + 1}. Unit: {unit} — Rate: ₹{rate}
                      </h3>
                      {entries.map((entry, i) => (
                        <div
                          key={i}
                          className="text-sm pl-4 text-gray-600 dark:text-gray-400"
                        >
                          {String.fromCharCode(97 + i)}. {entry.tons} Tons —{" "}
                          {entry.description}{" "}
                          {entry.saudaNo && `(Sauda No: ${entry.saudaNo})`}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default SaudaSharePopup;
