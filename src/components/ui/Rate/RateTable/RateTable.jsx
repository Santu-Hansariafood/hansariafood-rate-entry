"use client";

import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useTransition,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Save, X } from "lucide-react";
import dynamic from "next/dynamic";
const Pagination = dynamic(() =>
  import("@/components/common/Pagination/Pagination")
);

export default function RateTable({ selectedCompany, onClose }) {
  const [rates, setRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allRatesFilled = rates.every((rate) => rate.newRate.toString().trim());

  const fetchRates = useCallback(async () => {
    try {
      const [
        { data: companyData },
        { data: existingRates },
        { data: locationData },
      ] = await Promise.all([
        axios.get("/api/managecompany?limit=100"),
        axios.get(
          `/api/rate?company=${encodeURIComponent(selectedCompany.trim())}`
        ),
        axios.get("/api/location?limit=1000"),
      ]);

      const locationMap = {};
      locationData.locations.forEach((loc) => {
        locationMap[loc.name.trim().toUpperCase()] = loc.state;
      });

      const company = companyData.companies.find(
        (c) => c.name.trim() === selectedCompany.trim()
      );

      if (company) {
        const initialRates = company.location.map((location) => {
          const cleanLocation = location.trim();
          const foundRate = existingRates.find(
            (rate) => rate.location.trim() === cleanLocation
          );

          return {
            location: cleanLocation,
            state: locationMap[cleanLocation.toUpperCase()] || "Unknown",
            oldRate: foundRate?.oldRates?.at(-1) || "—",
            newRate: foundRate?.newRate ?? "",
            isUpdated: !!foundRate?.newRate,
            lastUpdated: foundRate?.oldRates?.at(-1)
              ? new Date(
                  foundRate.oldRates[foundRate.oldRates.length - 1]
                    .split("(")[1]
                    .split(")")[0]
                )
              : null,
          };
        });

        const sortedRates = initialRates.sort((a, b) => {
          if (!a.isUpdated && b.isUpdated) return -1;
          if (a.isUpdated && !b.isUpdated) return 1;
          return b.lastUpdated - a.lastUpdated;
        });

        startTransition(() => {
          setRates(sortedRates);
        });
      } else {
        toast.error("Company not found in the database.");
      }
    } catch (error) {
      toast.error("Failed to fetch locations or rates");
      console.error("Error fetching rates:", error);
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleEdit = (index) => setEditIndex(index);

  const handleSave = async (index) => {
    const rateToSave = rates[index];
    const parsedRate = parseFloat(rateToSave.newRate);

    if (!rateToSave.newRate || isNaN(parsedRate)) {
      toast.error("Please enter a valid numeric rate.");
      return;
    }

    try {
      const newOldRate = `${parsedRate} (${new Date().toLocaleDateString(
        "en-GB"
      )})`;

      await axios.post("/api/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: parsedRate,
        oldRates: [newOldRate],
      });

      toast.success("Rate updated successfully!");
      setEditIndex(null);

      setRates((prevRates) =>
        prevRates
          .map((rate, idx) =>
            idx === index
              ? {
                  ...rate,
                  oldRate: newOldRate,
                  newRate: parsedRate,
                  isUpdated: true,
                  lastUpdated: new Date(),
                }
              : rate
          )
          .sort((a, b) => {
            if (!a.isUpdated && b.isUpdated) return -1;
            if (a.isUpdated && !b.isUpdated) return 1;
            return b.lastUpdated - a.lastUpdated;
          })
      );
    } catch (error) {
      toast.error("Error updating rate.");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rates.slice(indexOfFirstItem, indexOfLastItem);

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
                    {currentItems.map((rate, index) => {
                      const actualIndex = indexOfFirstItem + index;
                      return (
                        <motion.tr
                          key={`${rate.location}-${rate.isUpdated}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`transition-colors duration-300 ${
                            rate.newRate.toString().trim()
                              ? "bg-green-50"
                              : "bg-red-50"
                          }`}
                        >
                          <td className="px-6 py-4 border-b text-gray-800 whitespace-nowrap">
                            {rate.location}
                          </td>
                          <td className="px-6 py-4 border-b text-gray-800 whitespace-nowrap">
                            {rate.state}
                          </td>
                          <td className="px-6 py-4 border-b text-gray-600 text-sm whitespace-nowrap">
                            {rate.oldRate}
                          </td>
                          <td className="px-6 py-4 border-b whitespace-nowrap">
                            <input
                              type="number"
                              value={rate.newRate}
                              onChange={(e) =>
                                setRates((prev) =>
                                  prev.map((r, idx) =>
                                    idx === actualIndex
                                      ? { ...r, newRate: e.target.value }
                                      : r
                                  )
                                )
                              }
                              className={`w-full min-w-[120px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                editIndex === actualIndex
                                  ? "border-green-500"
                                  : "border-gray-300"
                              }`}
                              disabled={editIndex !== actualIndex}
                              placeholder="Enter new rate"
                            />
                          </td>
                          <td className="px-6 py-4 border-b text-center whitespace-nowrap">
                            {editIndex === actualIndex ? (
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSave(actualIndex)}
                                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                                >
                                  <Save className="w-4 h-4" /> Save
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setEditIndex(null)}
                                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                                >
                                  <X className="w-4 h-4" /> Cancel
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(actualIndex)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={rates.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
