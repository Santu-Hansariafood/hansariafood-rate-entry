"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Loading from "../Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp } from "lucide-react";

// Lazy load graph
const RateGraph = dynamic(() => import("@/components/common/RateGraph/RateGraph"));

export default function RateCalendar() {
  const [date, setDate] = useState(new Date());
  const [rateData, setRateData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Fetch rate data
  useEffect(() => {
    axios.get("/api/rate")
      .then((res) => setRateData(res.data))
      .catch((err) => console.error("Error fetching rate data:", err));
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      let all = [], page = 1, hasMore = true;

      try {
        while (hasMore) {
          const res = await axios.get(`/api/companies?page=${page}`);
          const data = Array.isArray(res.data) ? res.data : res.data.companies || [];
          if (data.length > 0) {
            all = [...all, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }
        setCompanies(all);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    fetchCompanies();
  }, []);

  // Get rate for date and company
  const getRatesForDate = useCallback((date, company, location) => {
    const formatted = date.toLocaleDateString("en-GB");
    const todayFormatted = new Date().toLocaleDateString("en-GB");
    const data = rateData.find((d) => d.company === company && d.location === location);
    if (!data) return { rate: null, rateType: "none" };

    let rate = null;
    let rateType = "none";

    const old = data.oldRates?.find((r) => r.includes(`(${formatted})`));
    if (old) {
      const match = old.match(/(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/);
      if (match) {
        rate = match[1].trim();
        rateType = "old";
      }
    }

    if (data.newRate !== undefined && data.lastUpdated) {
      const updatedDate = new Date(data.lastUpdated).toLocaleDateString("en-GB");
      if (updatedDate === formatted) {
        rate = data.newRate;
        rateType = "new";
      }
    }

    if (formatted === todayFormatted && rate !== null) {
      rateType = "new"; // Highlight today’s rate in green
    }

    return { rate, rateType };
  }, [rateData]);

  const getTileStyle = (rateType) => {
    switch (rateType) {
      case "new":
        return "bg-green-500 text-white";
      case "old":
        return "bg-yellow-400 text-white";
      default:
        return "bg-red-500 text-white"; // No rate
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-tr from-pink-50 via-sky-100 to-violet-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-200 to-green-400 shadow-lg mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Rate Calendar</h1>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Explore and track rate changes visually by company and location.
            </p>
          </motion.div>

          {/* Company Dropdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <select
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select a Company</option>
              {companies.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </motion.div>

          {/* Calendar and Graph Sections */}
          <AnimatePresence>
            {rateData
              .filter((item) => item.company === selectedCompany)
              .map(({ company, location }) => (
                <motion.div
                  key={`${company}-${location}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-10 bg-white p-6 rounded-2xl shadow-xl"
                >
                  {/* Section Title */}
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {company} - {location}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-full"
                    >
                      <div className="rounded-xl border border-gray-200 shadow-inner p-3 sm:p-4 bg-white">
                        <Calendar
                          onChange={setDate}
                          value={date}
                          tileContent={({ date }) => {
                            const { rate, rateType } = getRatesForDate(date, company, location);
                            return (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="mt-1 px-1"
                              >
                                <div
                                  className={`text-[12px] sm:text-sm font-semibold text-center rounded-md py-1 ${getTileStyle(rateType)}`}
                                >
                                  {rate === null ? "No Rate" : `₹ ${rate}`}
                                </div>
                              </motion.div>
                            );
                          }}
                          className="!w-full calendar-custom"
                        />
                      </div>
                    </motion.div>

                    {/* Graph */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full"
                    >
                      <div className="border border-gray-200 shadow-inner rounded-xl p-4 sm:p-6 bg-white">
                        <RateGraph
                          rateData={rateData}
                          company={company}
                          location={location}
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </Suspense>
  );
}
