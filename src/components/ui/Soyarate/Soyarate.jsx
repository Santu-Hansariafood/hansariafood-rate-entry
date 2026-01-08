"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const ManageSoyaVisibility = dynamic(() =>
  import("../Soya/ManageSoyaVisibility/ManageSoyaVisibility")
);
const Title = dynamic(() => import("@/components/common/Title/Title"));
const SoyaCompanyPopup = dynamic(() =>
  import("../SoyaCompanyPopup/SoyaCompanyPopup")
);
const SearchBox = dynamic(() =>
  import("@/components/common/SearchBox/SearchBox")
);

export default function Soyarate() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [showRateList, setShowRateList] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/soyacompany", {
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

  /* ---------------- Open Popup ---------------- */
  const openPopup = async (id) => {
    try {
      const res = await axiosInstance.get(`/soyacompany/${id}`);
      setSelectedCompany(res.data);
      setPopupOpen(true);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    if (showRateList) fetchCompanies();
  }, [fetchCompanies, showRateList]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Title text="Soya Commodity Company List" />

        {/* ---------------- Tabs ---------------- */}
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

        {/* ---------------- Search ---------------- */}
        {showRateList && (
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search company name..."
          />
        )}

        {/* ---------------- Visibility Manager ---------------- */}
        {!showRateList && <ManageSoyaVisibility onUpdated={fetchCompanies} />}

        {/* ---------------- Company Cards ---------------- */}
        {showRateList && (
          <>
            {loading ? (
              <Loading />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
          </>
        )}

        {/* ---------------- Popup ---------------- */}
        <SoyaCompanyPopup
          isOpen={popupOpen}
          onClose={() => setPopupOpen(false)}
          data={selectedCompany}
        />
      </div>
    </Suspense>
  );
}
