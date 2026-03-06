"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useRateNotifications from "@/hooks/useRateNotifications/useRateNotifications";

const ManageMDOCVisibility = dynamic(() =>
  import("../MDOC/ManageMDOCVisibility/ManageMDOCVisibility")
);
const Title = dynamic(() => import("@/components/common/Title/Title"));
const MDOCCompanyPopup = dynamic(() =>
  import("../MDOCCompanyPopup/MDOCCompanyPopup")
);
const SearchBox = dynamic(() =>
  import("@/components/common/SearchBox/SearchBox")
);
const MDOCNotificationsPanel = dynamic(() =>
  import("./MDOCNotificationsPanel/MDOCNotificationsPanel")
);

export default function MDOCRate() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { notifications, refreshNotifications } = useRateNotifications("MDOC");

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [showRateList, setShowRateList] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleRateUpdate = () => {
    refreshNotifications();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/mdoccompany", {
        params: {
          search: debouncedSearch || undefined,
        },
      });

      setCompanies(res.data?.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const openPopup = async (id) => {
    try {
      const res = await axiosInstance.get(`/mdoccompany/${id}`);
      setSelectedCompany(res.data);
      setPopupOpen(true);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  useEffect(() => {
    if (showRateList) fetchCompanies();
  }, [fetchCompanies, showRateList]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Title text="M DOC & Maize Ddgs Doc Company List" />

        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowRateList(true)}
            className={`px-5 py-2 rounded-xl font-medium transition ${
              showRateList
                ? "bg-green-600 text-white shadow-md shadow-green-500/30"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Rate Companies
          </button>

          <button
            onClick={() => setShowRateList(false)}
            className={`px-5 py-2 rounded-xl font-medium transition ${
              !showRateList
                ? "bg-green-600 text-white shadow-md shadow-green-500/30"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Manage Visibility
          </button>
        </div>

        {showRateList && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-3/4">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search company name..."
              />
              {loading ? (
                <Loading />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4"
                >
                  {companies.map((company, index) => (
                    <motion.div
                      key={company._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-green-900 border border-green-700 rounded-xl p-4 flex items-center gap-3 hover:bg-green-800 transition cursor-pointer"
                      onClick={() => openPopup(company._id)}
                    >
                      <div className="p-3 rounded-xl bg-green-100 shadow-inner">
                        <Building2 className="w-5 h-5 text-green-700" />
                      </div>

                      <h3 className="text-white font-semibold truncate">
                        {company.name}
                      </h3>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!loading && companies.length === 0 && (
                <p className="text-center text-green-500 mt-10 text-lg">
                  No companies found.
                </p>
              )}
            </div>
            
            <div className="w-full lg:w-1/4 h-[80vh] sticky top-4">
              <MDOCNotificationsPanel notifications={notifications} />
            </div>
          </div>
        )}

        {!showRateList && <ManageMDOCVisibility onUpdated={fetchCompanies} />}

        <MDOCCompanyPopup
          isOpen={popupOpen}
          onClose={() => setPopupOpen(false)}
          data={selectedCompany}
          onRateUpdate={handleRateUpdate}
        />
      </div>
    </Suspense>
  );
}
