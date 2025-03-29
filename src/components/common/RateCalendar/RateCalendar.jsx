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
      const formattedDate = date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
      const data = rateData.find(
        (item) => item.company === company && item.location === location
      );

      if (!data) return null;

      let rate = "No Rate";
      let rateType = "none";

      // Extract old rates properly
      const oldRateEntry = data.oldRates.find((rateString) => {
        const match = rateString.match(/(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/);
        return match && match[2] === formattedDate;
      });

      if (oldRateEntry) {
        const match = oldRateEntry.match(/(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/);
        if (match) {
          rate = match[1].trim(); // Extract rate value
          rateType = "old";
        }
      }

      // Check for new rate
      const newRateMatch = data.newRate.match(
        /(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/
      );
      const isNewRate = newRateMatch && newRateMatch[2] === formattedDate;

      if (isNewRate) {
        rate = newRateMatch[1].trim();
        rateType = "new";
      }

      return { rate, rateType };
    },
    [rateData]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
              Track and visualize rate changes across different companies and
              locations.
            </p>
          </motion.div>

          <motion.div className="relative mb-8">
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
                className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {company} Rate Calendar
                  </h2>
                </div>

                {rateData
                  .filter((item) => item.company === company)
                  .map(({ location }) => (
                    <motion.div
                      key={location}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-8 bg-gray-50 rounded-xl p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {location}
                      </h3>

                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-[50%]">
                          {" "}
                          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 overflow-x-auto">
                            <Calendar
                              className="w-full h-full border-none rounded-xl shadow-sm"
                              onChange={setDate}
                              value={date}
                              tileContent={({ date }) => {
                                const rateData = getRatesForDate(
                                  date,
                                  company,
                                  location
                                );
                                return rateData ? (
                                  <div className="flex flex-col items-center">
                                    {/* <span className="text-xs font-bold">{date.getDate()}</span> */}
                                    <div
                                      className={`p-1 text-center rounded-lg font-medium text-[11px] sm:text-sm shadow-sm transition-all duration-200 hover:shadow-md ${
                                        rateData.rateType === "new"
                                          ? "bg-green-500 text-white"
                                          : rateData.rateType === "old"
                                          ? "bg-yellow-500 text-white"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {rateData.rate}
                                    </div>
                                  </div>
                                ) : null;
                              }}
                              tileClassName={({ date }) => {
                                const rateData = getRatesForDate(
                                  date,
                                  company,
                                  location
                                );
                                return rateData && rateData.rateType !== "none"
                                  ? "border-2 border-green-400 hover:border-green-500 transition-colors duration-200"
                                  : "border border-gray-200 hover:border-gray-300 transition-colors duration-200";
                              }}
                              // className="w-full border-none rounded-xl shadow-sm"
                              minDetail="month"
                              maxDetail="month"
                              showNeighboringMonth={false}
                              calendarType="gregory"
                              formatDay={(locale, date) => date.getDate()}
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-[50%]">
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Suspense>
  );
}
