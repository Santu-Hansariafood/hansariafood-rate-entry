"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";

const CompanyList = dynamic(() => import("./CompanyList/CompanyList"), {
  loading: () => <Loading />,
});
const RateTable = dynamic(() => import("./RateTable/RateTable"), {
  loading: () => <Loading />,
});
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const CategoryCard = dynamic(
  () => import("@/components/ui/Rate/CategoryCard/CategoryCard"),
  { loading: () => <Loading /> }
);
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { loading: () => <Loading /> }
);

export default function Rate() {
  const { mobile } = useUser();

  const [allCompanies, setAllCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [completedCompanies, setCompletedCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const selectedCompanyObj = useMemo(() => {
    return allCompanies.find((c) => c.name === selectedCompany);
  }, [allCompanies, selectedCompany]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParams = Object.values(filters)
        .map((cat) => `category=${encodeURIComponent(cat)}`)
        .join("&");

      const { data } = await axiosInstance.get(
        `/managecompany?page=${currentPage}&limit=${itemsPerPage}&${categoryParams}`
      );
      setAllCompanies(data.companies);
      setTotalItems(data.total);

      const names = data.companies.map((c) => c.name);
      setCompanies(names);

      if (names.length > 0) {
        const allCmds = data.companies.flatMap((c) => c.commodities || []);
        const first = [...new Set(allCmds)][0];
        await checkAllCompanies(names, first);
      }
    } catch {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const checkAllCompanies = useCallback(async (companyNames, commodity) => {
    if (!commodity) return;
    try {
      const statusArr = await Promise.all(
        companyNames.map(async (name) => {
          try {
            const { data } = await axiosInstance.get(
              `/rate?company=${name}&commodity=${encodeURIComponent(commodity)}`
            );
            return {
              [name]:
                data.length > 0 &&
                data.every(
                  (r) => r.hasNewRateToday && r.commodity === commodity
                ),
            };
          } catch {
            return { [name]: false };
          }
        })
      );
      setCompletedCompanies(Object.assign({}, ...statusArr));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setSelectedCommodity(null);
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedCompany) {
      setShowRateModal(true);
    }
  }, [selectedCompany]);

  useEffect(() => {
    document.body.style.overflow = showRateModal ? "hidden" : "auto";
  }, [showRateModal]);

  const handleCloseRateModal = () => {
    setShowRateModal(false);
    setSelectedCommodity(null);
  };

  const handleConfirmCommodity = () => {
    if (selectedCommodity) {
      setShowRateModal(false);
    }
  };

  const renderCompanySelector = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CompanyList
        companies={companies}
        completedCompanies={completedCompanies}
        loading={loading}
        onCompanySelect={setSelectedCompany}
      />
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );

  const renderRateModal = (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
          <button
            onClick={handleCloseRateModal}
            className="absolute top-2 right-2"
          >
            ✕
          </button>
          <Title text="Select a Commodity" />
          <select
            value={selectedCommodity || ""}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option value="" disabled>
              -- Choose Commodity --
            </option>
            {selectedCompanyObj?.commodities.map((cmd) => (
              <option key={cmd} value={cmd}>
                {cmd}
              </option>
            ))}
          </select>
          <button
            disabled={!selectedCommodity}
            onClick={handleConfirmCommodity}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Confirm & View Rate
          </button>
        </div>
      </div>
    </Suspense>
  );

  const renderRateTable = (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl relative">
          <button
            onClick={() => {
              setSelectedCompany(null);
              setSelectedCommodity(null);
            }}
            className="absolute top-2 right-2"
          >
            ✕
          </button>
          <RateTable
            selectedCompany={selectedCompany}
            commodity={selectedCommodity}
            onClose={() => {
              setSelectedCompany(null);
              setSelectedCommodity(null);
            }}
          />
        </div>
      </div>
    </Suspense>
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <ToastContainer position="top-right" />
        <Title text="Rate Management" />
        <CategoryCard onFilterChange={handleFilterChange} />
        {!selectedCompany && renderCompanySelector}
        {showRateModal && selectedCompany && renderRateModal}
        {selectedCompany && selectedCommodity && renderRateTable}
      </div>
    </Suspense>
  );
}
