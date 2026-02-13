"use client";

import { Suspense, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Package, 
  Search,
  ChevronRight,
  Filter
} from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useRateNotifications from "@/hooks/useRateNotifications/useRateNotifications";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const CommodityCard = ({ type, notifications, loading }) => {
  const [search, setSearch] = useState("");

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => 
      n.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      n.location?.toLowerCase().includes(search.toLowerCase())
    );
  }, [notifications, search]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className={`px-5 py-4 bg-gradient-to-r ${
        type === 'Soya' ? 'from-green-600 to-green-700' :
        type === 'M DOC' ? 'from-emerald-600 to-emerald-700' :
        'from-teal-600 to-teal-700'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package size={20} />
            {type} Rates
          </h3>
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {notifications.length} Updates
          </span>
        </div>
      </div>

      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={`Search ${type} companies...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        {loading ? (
          <div className="p-10 flex justify-center"><Loading /></div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No rates found 🚀
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredNotifications.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600">
                      <Building2 size={16} />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-green-600 transition-colors">
                      {item.companyName}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 font-extrabold text-green-700 dark:text-green-400 text-lg">
                      <IndianRupee size={16} />
                      {item.rate}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Filter size={12} className="text-gray-400" />
                    <span>{item.commodity}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function LandingCost() {
  const { notifications: soyaRates, loading: soyaLoading } = useRateNotifications("Soya");
  const { notifications: mdocRates, loading: mdocLoading } = useRateNotifications("MDOC");
  const { notifications: ddgsRates, loading: ddgsLoading } = useRateNotifications("DDGS");

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Title text="Landing Cost Dashboard" />
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time commodity rates across different companies and locations
            </p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">Live Updates</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CommodityCard 
            type="Soya" 
            notifications={soyaRates} 
            loading={soyaLoading} 
          />
          <CommodityCard 
            type="M DOC" 
            notifications={mdocRates} 
            loading={mdocLoading} 
          />
          <CommodityCard 
            type="DDGS" 
            notifications={ddgsRates} 
            loading={ddgsLoading} 
          />
        </div>

        {/* Brand footer or extra info can go here */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl text-white shadow-xl overflow-hidden relative"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Hansaria Food Private Limited</h2>
              <p className="text-green-100/80 max-w-2xl">
                Providing high-quality poultry and animal feed raw materials across India. 
                Our landing cost dashboard helps you track real-time market fluctuations 
                to make informed procurement decisions.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-green-900 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center gap-2">
              Contact Sales <ChevronRight size={18} />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        </motion.div>
      </div>
    </Suspense>
  );
}
