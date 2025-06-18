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
  const watermarkUrl = "/logo/logo.png";

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
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 p-1 rounded-full"
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
              className="flex items-center gap-2 px-4 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div id={containerId} className="px-2 pb-4 bg-white relative">
            <p className="mb-1 font-semibold">Company: {company}</p>
            <p className="mb-4 text-sm text-gray-700">Date: {date}</p>

            {entriesWithValidRate.length === 0 ? (
              <p className="text-gray-500">
                No units with rate available to display.
              </p>
            ) : (
              <div className="space-y-4">
                {entriesWithValidRate.map(([unit, entries], idx) => {
                  const rate = getRateForUnit(unit);
                  return (
                    <div
                      key={unit}
                      className="border p-3 rounded-lg bg-gray-50 shadow-sm"
                    >
                      <h3 className="font-semibold text-md mb-2 text-gray-700">
                        {idx + 1}. Unit: {unit} — Rate: ₹{rate}
                      </h3>
                      {entries.map((entry, i) => (
                        <div key={i} className="text-sm pl-4 text-gray-600">
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
