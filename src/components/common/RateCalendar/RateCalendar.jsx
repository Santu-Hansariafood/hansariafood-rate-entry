"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dynamic from "next/dynamic";
import Loading from "../Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp } from "lucide-react";

const RateGraph = dynamic(() =>
  import("@/components/common/RateGraph/RateGraph")
);

export default function RateCalendar() {
  const [date, setDate] = useState(new Date());
  const [rateData, setRateData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    axios
      .get("/api/rate")
      .then((response) => setRateData(response.data))
      .catch((error) => console.error("Error fetching rate data:", error));
  }, []);

  // useEffect(() => {
  //   axios
  //     .get("/api/companies?limit=1000")
  //     .then((response) => {
  //       const data = response.data;
  //       setCompanies(Array.isArray(data) ? data : data.companies || []);
  //     })
  //     .catch((error) => console.error("Error fetching companies:", error));
  // }, []);

  useEffect(() => {
    const fetchAllCompanies = async () => {
      let allCompanies = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axios.get(`/api/companies?page=${page}`);
          const data = Array.isArray(response.data)
            ? response.data
            : response.data.companies || [];

          if (data.length > 0) {
            allCompanies = [...allCompanies, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }

        setCompanies(allCompanies);
      } catch (error) {
        console.error("Error fetching paginated companies:", error);
      }
    };

    fetchAllCompanies();
  }, []);

  const getRatesForDate = useCallback(
    (date, company, location) => {
      const formattedDate = date.toLocaleDateString("en-GB");
      const data = rateData.find(
        (item) => item.company === company && item.location === location
      );

      if (!data) return null;

      let rate = "No Rate";
      let rateType = "none";

      const oldRateEntry = data.oldRates.find((rateString) => {
        const match = rateString.match(/(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/);
        return match && match[2] === formattedDate;
      });

      if (oldRateEntry) {
        const match = oldRateEntry.match(/(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/);
        if (match) {
          rate = match[1].trim();
          rateType = "old";
        }
      }

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
            <select
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select a Company</option>
              {companies.map((company) => (
                <option key={company._id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </motion.div>

          <AnimatePresence>
            {rateData
              .filter((item) => item.company === selectedCompany)
              .map(({ company, location }) => (
                <motion.div
                  key={location}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {company} - {location}
                    </h2>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-[50%]">
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
                            ) : null;
                          }}
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
          </AnimatePresence>
        </div>
      </div>
    </Suspense>
  );
}
