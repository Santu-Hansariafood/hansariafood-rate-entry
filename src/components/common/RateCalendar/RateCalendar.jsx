"use client";

import { useState, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Loading from "../Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  TrendingUp,
  BarChart3,
  X,
  MapPin,
  Package,
  Search,
  Clock,
} from "lucide-react";
import useRateAnalysisData from "@/hooks/RateCalendar/useRateAnalysisData";
import useRateAnalysis from "@/hooks/RateCalendar/useRateAnalysis";
import Title from "../Title/Title";

const RateGraph = dynamic(() =>
  import("@/components/common/RateGraph/RateGraph")
);

const BadgePill = dynamic(() => import("./components/BadgePill"));
const KPIItem = dynamic(() => import("./components/KPIItem"));
const CompanyCard = dynamic(() => import("./components/CompanyCard"));
const TopRateRow = dynamic(() => import("./components/TopRateRow"));

export default function RateCalendar() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showCommodityPopup, setShowCommodityPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { companies, allRates, loading: analysisLoading } =
    useRateAnalysisData();

  const scopedRates = useMemo(
    () =>
      allRates.filter(
        (rate) =>
          (!selectedCompany || rate.company === selectedCompany) &&
          (!selectedCommodity || rate.commodity === selectedCommodity)
      ),
    [allRates, selectedCompany, selectedCommodity]
  );
  const {
    companyStats,
    filteredCompanies,
    topRatesByCommodity,
    availableCommodities,
    availableLocations,
    selectedEntry,
    analysis,
    dateWiseRates,
  } = useRateAnalysis({
    allRates,
    scopedRates,
    companies,
    selectedCompany,
    selectedCommodity,
    selectedLocation,
    searchTerm,
    filterType,
  });

  const loading = analysisLoading;

  const handleCompanyClick = (company) => {
    setSelectedCompany(company.name);
    setSelectedCommodity("");
    setSelectedLocation("");
    setShowCommodityPopup(true);
  };

  const handleCommoditySelect = (commodity) => {
    setSelectedCommodity(commodity);
    setShowCommodityPopup(false);
    const companyData = companies.find((c) => c.name === selectedCompany);
    if (companyData && Array.isArray(companyData.location)) {
      if (companyData.location.length > 1) setShowLocationPopup(true);
      else if (companyData.location.length === 1)
        setSelectedLocation(companyData.location[0]);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowLocationPopup(false);
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="flex">
          <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/30 shadow-xl dark:bg-slate-900/60 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Companies
                </h2>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search company..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="all">All</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
              {loading ? (
                <Loading />
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                  {filteredCompanies.map((company) => (
                    <CompanyCard
                      key={company._id}
                      company={company}
                      selected={selectedCompany === company.name}
                      onClick={() => handleCompanyClick(company)}
                      freshnessDays={
                        (companyStats[company.name] || {}).freshnessDays
                      }
                      latestRate={(companyStats[company.name] || {}).latestRate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <Title text={"Rate Analysis"} />
              </motion.div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Top Rates
                  </h2>
                  <BadgePill intent="info">
                    auto refresh and auto sorted
                  </BadgePill>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(topRatesByCommodity).map(
                    ([commodity, items]) => (
                      <div
                        key={commodity}
                        className="rounded-2xl border border-slate-200 bg-white shadow dark:bg-slate-900 dark:border-slate-800"
                      >
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between dark:border-slate-800">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {commodity}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {items.length} shown
                          </div>
                        </div>
                        <div className="p-2 space-y-1">
                          {items.map((it, idx) => (
                            <TopRateRow
                              key={`${commodity}-${it.company}-${idx}`}
                              company={it.company}
                              commodity={commodity}
                              latestRate={it.latestRate}
                              freshnessDays={it.freshnessDays}
                              changeAbs={it.changeAbs}
                              changePct={it.changePct}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {selectedCompany && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/20 dark:bg-slate-900/60 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2 dark:text-slate-100">
                        {selectedCompany}
                      </h3>
                      <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                        {selectedCommodity && (
                          <span className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {selectedCommodity}
                          </span>
                        )}
                        {selectedLocation && (
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {selectedLocation}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCompany("");
                        setSelectedCommodity("");
                        setSelectedLocation("");
                      }}
                      className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Loading />
                </motion.div>
              )}

              {!loading && selectedEntry && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPIItem
                      label="Latest Rate"
                      value={analysis?.latestRate ?? "-"}
                      sub={
                        analysis?.hasNewToday ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Today
                          </span>
                        ) : null
                      }
                    />
                    <KPIItem
                      label="Previous Rate"
                      value={analysis?.previousRate ?? "-"}
                    />
                    <KPIItem
                      label="Change"
                      value={
                        typeof analysis?.changeAbs === "number"
                          ? `${analysis.changeAbs.toFixed(0)}${
                              typeof analysis.changePct === "number"
                                ? ` (${analysis.changePct.toFixed(1)}%)`
                                : ""
                            }`
                          : "-"
                      }
                    />
                    <KPIItem
                      label="Last Updated"
                      value={
                        analysis?.lastUpdated
                          ? analysis.lastUpdated.toLocaleDateString("en-GB")
                          : "-"
                      }
                      sub={`Entries: ${analysis?.updatesCount ?? 0}`}
                    />
                  </div>

                  <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-white shadow dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                          Rate Trends
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <BadgePill intent="success">New</BadgePill>
                        <BadgePill intent="warning">Old</BadgePill>
                      </div>
                    </div>
                    <div className="p-6">
                      <RateGraph
                        rateData={scopedRates}
                        company={selectedCompany}
                        location={selectedLocation}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow dark:bg-slate-900 dark:border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between dark:border-slate-800">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Date-wise Rates
                      </h3>
                      <div className="text-slate-500 text-sm dark:text-slate-400">
                        {dateWiseRates.length} records
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-800/60">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Mobile
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white dark:bg-slate-900 dark:divide-slate-800">
                          {dateWiseRates.map((row, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                              <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-200">
                                {row.date.toLocaleDateString("en-GB")}
                              </td>
                              <td className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                ₹{row.rate}
                              </td>
                              <td className="px-6 py-3 text-sm">
                                <BadgePill
                                  intent={
                                    row.type === "New" ? "success" : "warning"
                                  }
                                >
                                  {row.type}
                                </BadgePill>
                              </td>
                              <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-200">
                                {row.quantity || "-"}
                              </td>
                              <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-200">
                                {row.mobile || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {!loading &&
                selectedCompany &&
                (!selectedEntry || scopedRates.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-slate-600 dark:text-slate-300"
                  >
                    Select commodity and location to view analysis.
                  </motion.div>
                )}

              {!loading && !selectedCompany && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                    <Building2 className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                    Select a company
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Use the search and type filter to find a buyer or seller,
                    then choose commodity and location.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showCommodityPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl dark:bg-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Select Commodity
                  </h3>
                  <button
                    onClick={() => setShowCommodityPopup(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {availableCommodities.length > 0 ? (
                    availableCommodities.map((commodity, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCommoditySelect(commodity)}
                        className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {commodity}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                      No commodities found for this company.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLocationPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl dark:bg-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Select Location
                  </h3>
                  <button
                    onClick={() => setShowLocationPopup(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {availableLocations.map((location, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {location}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
