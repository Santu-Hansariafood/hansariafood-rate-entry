import { motion } from "framer-motion";
import { Edit2, Save, X, UserCircle, PhoneCall } from "lucide-react";
import { toTitleCase } from "@/utils/formatName/formatName";

export default function RateTableRow({
  rate,
  index,
  editIndex,
  handleEdit,
  handleSave,
  setRates,
  commodity,
  quantity,
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`transition-colors duration-300 ${
        rate.newRate && rate.newRate.toString().trim()
          ? "bg-green-50 dark:bg-green-950/40"
          : "bg-red-50 dark:bg-red-950/40"
      }`}
    >
      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 whitespace-nowrap align-top">
        <div className="font-semibold">{toTitleCase(rate.location)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
          {rate.primaryMobile && (
            <div className="flex items-center gap-2 flex-wrap">
              <PhoneCall className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <a
                href={`tel:${rate.primaryMobile}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {rate.primaryMobile}
              </a>
            </div>
          )}
          {rate.contactPerson && (
            <div className="flex items-center gap-2 flex-wrap">
              <UserCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {toTitleCase(rate.contactPerson)}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 whitespace-nowrap align-middle">
        {toTitleCase(rate.state) || "—"}
      </td>
      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 whitespace-nowrap align-middle">
        {commodity ? toTitleCase(commodity) : "—"}
      </td>

      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap align-middle">
        {rate.oldRate || "—"}
      </td>
      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap align-middle">
        {editIndex === index ? (
          <input
            type="number"
            min="0"
            value={rate.quantity || ""}
            onChange={(e) =>
              setRates((prev) =>
                prev.map((r, idx) =>
                  idx === index ? { ...r, quantity: Number(e.target.value) } : r
                )
              )
            }
            className={`w-full min-w-[120px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              editIndex === index
                ? "border-green-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Enter quantity"
          />
        ) : (
          <span className="text-gray-800 dark:text-gray-100">
            {rate.quantity || "-"}
          </span>
        )}
      </td>

      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap align-middle">
        {rate.newRate && editIndex !== index ? (
          <span className="font-semibold text-green-700 dark:text-green-400">
            {rate.newRate}
          </span>
        ) : (
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
            className={`w-full min-w-[120px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              editIndex === index
                ? "border-green-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            disabled={editIndex !== index}
            placeholder="Enter new rate"
          />
        )}
      </td>

      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap align-middle">
        {editIndex === index ? (
          <input
            type="text"
            value={rate.payment || ""}
            onChange={(e) =>
              setRates((prev) =>
                prev.map((r, idx) =>
                  idx === index ? { ...r, payment: e.target.value } : r
                )
              )
            }
            className="w-full min-w-[100px] px-3 py-2 border border-green-500 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="Payment Terms"
          />
        ) : (
          <span className="text-gray-800 dark:text-gray-100">
            {rate.payment ? toTitleCase(rate.payment) : "-"}
          </span>
        )}
      </td>

      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap align-middle">
        {editIndex === index ? (
          <input
            type="text"
            value={rate.others || ""}
            onChange={(e) =>
              setRates((prev) =>
                prev.map((r, idx) =>
                  idx === index ? { ...r, others: e.target.value } : r
                )
              )
            }
            className="w-full min-w-[120px] px-3 py-2 border border-green-500 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter details"
          />
        ) : (
          <span className="text-gray-800 dark:text-gray-100">
            {toTitleCase(rate.others) || "-"}
          </span>
        )}
      </td>

      <td className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-center whitespace-nowrap align-middle">
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
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
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
