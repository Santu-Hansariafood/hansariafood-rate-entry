import { motion } from "framer-motion";
import { Edit2, Save, X } from "lucide-react";

export default function RateTableRow({
  rate,
  index,
  editIndex,
  handleEdit,
  handleSave,
  setRates,
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`transition-colors duration-300 ${
        rate.newRate.toString().trim() ? "bg-green-50" : "bg-red-50"
      }`}
    >
      <td className="px-6 py-4 border-b text-gray-800 whitespace-nowrap align-top">
        <div className="font-semibold">{rate.location}</div>
        <div className="text-sm text-gray-600 mt-1 space-y-1">
          {rate.primaryMobile && (
            <div>
              📞{" "}
              <a
                href={`tel:${rate.primaryMobile}`}
                className="text-blue-600 hover:underline"
              >
                {rate.primaryMobile}
              </a>
            </div>
          )}
          {rate.secondaryMobile && (
            <div>
              ☎️{" "}
              <a
                href={`tel:${rate.secondaryMobile}`}
                className="text-blue-600 hover:underline"
              >
                {rate.secondaryMobile}
              </a>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 border-b text-gray-800 whitespace-nowrap align-middle">
        {rate.state}
      </td>
      <td className="px-6 py-4 border-b text-gray-600 text-sm whitespace-nowrap align-middle">
        {rate.oldRate}
      </td>
      <td className="px-6 py-4 border-b whitespace-nowrap align-middle">
        <input
          type="number"
          value={rate.newRate}
          onChange={(e) =>
            setRates((prev) =>
              prev.map((r, idx) =>
                idx === index ? { ...r, newRate: e.target.value } : r
              )
            )
          }
          className={`w-full min-w-[120px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
            editIndex === index ? "border-green-500" : "border-gray-300"
          }`}
          disabled={editIndex !== index}
          placeholder="Enter new rate"
        />
      </td>

      <td className="px-6 py-4 border-b text-center whitespace-nowrap align-middle">
        {editIndex === index ? (
          <div className="flex items-center justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSave(index)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEdit(null)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEdit(index)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </motion.button>
        )}
      </td>
    </motion.tr>
  );
}
