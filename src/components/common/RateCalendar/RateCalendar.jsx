"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dynamic from "next/dynamic";
import Loading from "../Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, TrendingUp } from "lucide-react";

const RateGraph = dynamic(() =>
  import("@/components/common/RateGraph/RateGraph")
);

export default function RateCalendar() {
  const [date, setDate] = useState(new Date());
  const [rateData, setRateData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("/api/rate")
      .then((response) => setRateData(response.data))
      .catch((error) => console.error("Error fetching rate data:", error));
  }, []);

  const filteredCompanies = useMemo(() => {
    return [
      ...new Set(
        rateData
          .filter(({ company }) =>
            company.toLowerCase().includes(search.toLowerCase())
          )
          .map(({ company }) => company)
      ),
    ];
  }, [search, rateData]);

  const getRatesForDate = useCallback(
    (date, company, location) => {
      const formattedDate = date.toLocaleDateString("en-GB");
      const data = rateData.find(
        (item) => item.company === company && item.location === location
      );

      if (!data) return null;

      const oldRateEntry = data.oldRates.find((rate) =>
        rate.includes(formattedDate)
      );
      const newRateEntry = data.newRate.includes(formattedDate)
        ? data.newRate
        : "";

      let rate = "No Rate";
      let rateType = "none";

      if (oldRateEntry) {
        rate = oldRateEntry.split(" ")[0];
        rateType = "old";
      } else if (newRateEntry) {
        rate = newRateEntry.split(" ")[0];
        rateType = "new";
      }

      return { rate, rateType };
    },
    [rateData]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rate Calendar
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track and visualize rate changes across different companies and locations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Company Name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {company} Rate Calendar
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  {rateData
                    .filter((item) => item.company === company)
                    .map(({ location }) => (
                      <motion.div
                        key={location}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-8 last:mb-0 bg-gray-50 rounded-xl p-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {location}
                        </h3>

                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="w-full lg:w-[60%]">
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                              <Calendar
                                onChange={setDate}
                                value={date}
                                tileContent={({ date }) => {
                                  const rateData = getRatesForDate(
                                    date,
                                    company,
                                    location
                                  );
                                  return rateData ? (
                                    <div
                                      className={`absolute inset-0 flex items-center justify-center p-1 text-center rounded-lg font-medium text-[11px] sm:text-sm shadow-sm transition-all duration-200 hover:shadow-md ${
                                        rateData.rateType === "new"
                                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                                          : rateData.rateType === "old"
                                          ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
                                          : "bg-gradient-to-br from-red-500 to-red-600 text-white"
                                      }`}
                                    >
                                      {rateData.rate}
                                    </div>
                                  ) : null;
                                }}
                                tileClassName={({ date }) => {
                                  const rateData = getRatesForDate(
                                    date,
                                    company,
                                    location
                                  );
                                  return `relative ${
                                    rateData && rateData.rateType !== "none"
                                      ? "border-2 border-green-400 hover:border-green-500 transition-colors duration-200"
                                      : "border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                                  }`;
                                }}
                                className="w-full border-none rounded-xl shadow-sm"
                                minDetail="month"
                                maxDetail="month"
                                showNeighboringMonth={false}
                                showFixedNumberOfWeeks={false}
                                calendarType="gregory"
                                formatDay={(locale, date) => date.getDate()}
                                tileDisabled={({ date }) => {
                                  const rateData = getRatesForDate(
                                    date,
                                    company,
                                    location
                                  );
                                  return !rateData || rateData.rateType === "none";
                                }}
                                styles={{
                                  calendar: {
                                    width: "100%",
                                    minWidth: "100%",
                                    maxWidth: "100%",
                                    margin: "0 auto",
                                    background: "transparent",
                                  },
                                  monthView: {
                                    backgroundColor: "white",
                                    borderRadius: "1rem",
                                    padding: "1rem",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                  },
                                  navigation: {
                                    marginBottom: "1rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0 0.5rem",
                                  },
                                  navigationButton: {
                                    backgroundColor: "#f3f4f6",
                                    border: "none",
                                    borderRadius: "0.75rem",
                                    padding: "0.75rem",
                                    color: "#374151",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    width: "2.5rem",
                                    height: "2.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                  },
                                  navigationButtonHover: {
                                    backgroundColor: "#e5e7eb",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                  },
                                  navigationLabel: {
                                    fontSize: "1.125rem",
                                    fontWeight: "600",
                                    color: "#111827",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    backgroundColor: "#f9fafb",
                                  },
                                  weekdays: {
                                    marginBottom: "0.75rem",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    gap: "0.5rem",
                                    padding: "0 0.5rem",
                                  },
                                  weekday: {
                                    textAlign: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    color: "#6b7280",
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    backgroundColor: "#f9fafb",
                                  },
                                  days: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    gap: "0.5rem",
                                    padding: "0 0.5rem",
                                  },
                                  day: {
                                    aspectRatio: "1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    color: "#374151",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    position: "relative",
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                  },
                                  dayHover: {
                                    backgroundColor: "#f3f4f6",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                  },
                                  daySelected: {
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)",
                                  },
                                  dayDisabled: {
                                    color: "#d1d5db",
                                    cursor: "not-allowed",
                                    backgroundColor: "#f9fafb",
                                    boxShadow: "none",
                                  },
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-full lg:w-[40%]">
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                              <RateGraph
                                rateData={rateData}
                                company={company}
                                location={location}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Suspense>
  );
}
