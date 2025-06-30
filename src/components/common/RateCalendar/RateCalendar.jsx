"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dynamic from "next/dynamic";
import Loading from "../Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp } from "lucide-react";

const RateGraph = dynamic(() => import("@/components/common/RateGraph/RateGraph"));

export default function RateCalendar() {
  const [date, setDate] = useState(new Date());
  const [rateData, setRateData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");

  useEffect(() => {
    axiosInstance.get("/rate").then((response) => setRateData(response.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchAllCompanies = async () => {
      let all = [], page = 1, hasMore = true;
      try {
        while (hasMore) {
          const res = await axiosInstance.get(`/companies?page=${page}`);
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
        console.error("Fetching companies failed", err);
      }
    };
    fetchAllCompanies();
  }, []);

  const availableCommodities = useMemo(() => {
    return Array.from(new Set(rateData.filter(d => d.company === selectedCompany).map(d => d.commodity)));
  }, [rateData, selectedCompany]);

  const getRatesForDate = useCallback((calendarDate, company, location, commodity) => {
    const dateStr = calendarDate.toLocaleDateString("en-GB");
    const entry = rateData.find(d => d.company === company && d.location === location && d.commodity === commodity);
    if (!entry) return { rate: "-", type: "none" };

    const oldMatch = entry.oldRates?.find(str => str.includes(dateStr));
    if (oldMatch) {
      const rate = oldMatch.split(" ")[0];
      return { rate: `₹${rate}`, type: "old" };
    }

    const isNew = entry.lastUpdated && new Date(entry.lastUpdated).toLocaleDateString("en-GB") === dateStr;
    if (isNew && entry.newRate) {
      return { rate: `₹${entry.newRate}`, type: "new" };
    }
    return { rate: "-", type: "none" };
  }, [rateData]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Calendar</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Track and visualize rate changes across companies and commodities.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <select
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedCommodity("");
              }}>
              <option value="">Select Company</option>
              {companies.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>

            <select
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}>
              <option value="">Select Commodity</option>
              {availableCommodities.map((com, idx) => <option key={idx} value={com}>{com}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {rateData.filter(d => d.company === selectedCompany && d.commodity === selectedCommodity).map(({ company, location, commodity }) => (
              <motion.div key={`${location}-${commodity}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{company} - {location} ({commodity})</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/2">
                    <Calendar
                      className="rounded-xl shadow-sm"
                      onChange={setDate}
                      value={date}
                      tileContent={({ date }) => {
                        const info = getRatesForDate(date, company, location, commodity);
                        const bg = info.type === "new" ? "bg-green-500" : info.type === "old" ? "bg-yellow-500" : "bg-gray-300";
                        return (
                          <div className={`rounded text-white text-[10px] px-1 mt-1 ${bg}`}>{info.rate}</div>
                        );
                      }}
                    />
                  </div>

                  <div className="w-full lg:w-1/2">
                    <RateGraph rateData={rateData} company={company} location={location} />
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
