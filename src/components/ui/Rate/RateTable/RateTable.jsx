import { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Save, X } from "lucide-react";

export default function RateTable({ selectedCompany, onClose }) {
  const [rates, setRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const fetchRates = useCallback(async () => {
    try {
      const [{ data: companyData }, { data: existingRates }] =
        await Promise.all([
          axios.get("/api/managecompany"),
          axios.get(`/api/rate?company=${selectedCompany}`),
        ]);

      const company = companyData.companies.find(
        (c) => c.name === selectedCompany
      );

      if (company) {
        setRates(
          company.location.map((location) => {
            const foundRate = existingRates.find(
              (rate) => rate.location === location
            );
            return {
              location,
              oldRate: foundRate?.oldRates?.at(-1) || "—",
              newRate: foundRate?.newRate ?? "",
              isUpdated: false,
            };
          })
        );
      }
    } catch (error) {
      toast.error("Failed to fetch locations or rates");
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleEdit = (index) => setEditIndex(index);

  const handleSave = async (index) => {
    const rateToSave = rates[index];

    if (!rateToSave.newRate.trim()) {
      toast.error("New rate cannot be empty!");
      return;
    }

    try {
      const newOldRate = `${
        rateToSave.newRate
      } (${new Date().toLocaleDateString("en-GB")})`;

      await axios.post("/api/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: rateToSave.newRate,
        oldRates: [newOldRate],
      });

      toast.success("Rate updated successfully!");
      setEditIndex(null);
      setRates((prevRates) =>
        prevRates.map((rate, idx) =>
          idx === index
            ? {
                ...rate,
                oldRate: newOldRate,
                newRate: rateToSave.newRate,
                isUpdated: true,
              }
            : rate
        )
      );
    } catch (error) {
      toast.error("Error updating rate.");
    }
  };

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
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                Rates for {selectedCompany}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                    Location
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
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`${
                        rate.isUpdated
                          ? "bg-green-50/50 transition-colors duration-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 border-b text-gray-800">
                        {rate.location}
                      </td>
                      <td className="px-6 py-4 border-b text-gray-600 text-sm">
                        {rate.oldRate}
                      </td>
                      <td className="px-6 py-4 border-b">
                        <input
                          type="text"
                          value={rate.newRate}
                          onChange={(e) =>
                            setRates((prev) =>
                              prev.map((r, idx) =>
                                idx === index
                                  ? { ...r, newRate: e.target.value }
                                  : r
                              )
                            )
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            editIndex === index
                              ? "border-green-500"
                              : "border-gray-300"
                          }`}
                          disabled={editIndex !== index}
                          placeholder="Enter new rate"
                        />
                      </td>
                      <td className="px-6 py-4 border-b text-center">
                        {editIndex === index ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSave(index)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditIndex(null)}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(index)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
