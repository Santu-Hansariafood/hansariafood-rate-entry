import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const RateTableRow = dynamic(() => import("../RateTableRow/RateTableRow"));

export default function RateTableBody({
  rates,
  allRatesFilled,
  editIndex,
  handleEdit,
  handleSave,
  setRates,
  actualStartIndex,
}) {
  return (
    <div
      className={`max-h-[70vh] overflow-auto ${
        allRatesFilled ? "bg-green-50" : "bg-red-50"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                State
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                Last Rate
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                New Rate
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rates.map((rate, index) => (
                <RateTableRow
                  key={`${rate.location}-${rate.isUpdated}`}
                  rate={rate}
                  index={actualStartIndex + index}
                  editIndex={editIndex}
                  handleEdit={handleEdit}
                  handleSave={handleSave}
                  setRates={setRates}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
