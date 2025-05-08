"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { Building2, ArrowLeft } from "lucide-react";
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
  {
    loading: () => <Loading />,
  }
);
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  {
    loading: () => <Loading />,
  }
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

  const filteredCompanies = useMemo(() => {
    const selectedCategories = Object.values(filters);
    if (selectedCategories.length === 0) return allCompanies;
    return allCompanies.filter((company) =>
      selectedCategories.includes(company.category)
    );
  }, [allCompanies, filters]);

  useEffect(() => {
    setSelectedCommodity(null);
  }, [selectedCompany]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const categoryParams = Object.values(filters)
          .map((cat) => `category=${encodeURIComponent(cat)}`)
          .join("&");

        const response = await axiosInstance.get(
          `/managecompany?page=${currentPage}&limit=${itemsPerPage}&${categoryParams}`
        );

        const { companies: companyList, total } = response.data;

        setAllCompanies(companyList);
        setTotalItems(total);

        const filteredNames = companyList.map((c) => c.name);
        setCompanies(filteredNames);

        if (companyList.length > 0) {
          const allCommodities = companyList.flatMap(
            (c) => c.commodities || []
          );
          const uniqueCommodities = [...new Set(allCommodities)];
          await checkAllCompanies(filteredNames, uniqueCommodities[0]);
        }
      } catch (error) {
        toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [filters, currentPage]);

  const checkAllCompanies = useCallback(async (companyNames, commodity) => {
    if (!commodity) return;
    try {
      const statusMap = await Promise.all(
        companyNames.map(async (company) => {
          try {
            const rateResponse = await axiosInstance.get(
              `/rate?company=${company}&commodity=${encodeURIComponent(
                commodity
              )}`
            );
            return {
              [company]:
                rateResponse.data.length > 0 &&
                rateResponse.data.every(
                  (rate) => rate.hasNewRateToday && rate.commodity === commodity
                ),
            };
          } catch {
            return { [company]: false };
          }
        })
      );
      setCompletedCompanies(Object.assign({}, ...statusMap));
    } catch (error) {
      console.error("Error checking company completion status:", error);
    }
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showRateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showRateModal]);

  const selectedCompanyObj = allCompanies.find(
    (c) => c.name === selectedCompany
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <Title text="Rate Management" />
            <div className="mb-8">
              <CategoryCard onFilterChange={handleFilterChange} />
            </div>
          </motion.div>

          {selectedCompany ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative"
            >
              <button
                onClick={() => setSelectedCompany(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Companies</span>
              </button>

              <div className="mb-4">
  <button
    onClick={() => setShowRateModal(true)}
    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
  >
    Select Commodity
  </button>
</div>

{showRateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
      <button
        onClick={() => {
          setShowRateModal(false);
          setSelectedCommodity(null);
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold mb-4">Select a Commodity</h2>
      <select
        value={selectedCommodity || ""}
        onChange={(e) => setSelectedCommodity(e.target.value)}
        className="border w-full px-3 py-2 rounded-lg mb-4"
      >
        <option value="" disabled>
          -- Choose Commodity --
        </option>
        {(selectedCompanyObj?.commodities || []).map((cmd) => (
          <option key={cmd} value={cmd}>
            {cmd}
          </option>
        ))}
      </select>

      <button
        disabled={!selectedCommodity}
        onClick={() => {
          if (selectedCommodity) {
            setShowRateModal(false);
          }
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        Confirm & View Rate
      </button>
    </div>
  </div>
)}

{selectedCommodity && !showRateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
      <button
        onClick={() => {
          setSelectedCommodity(null);
          setSelectedCompany(null);
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-black"
      >
        ✕
      </button>
      <RateTable
        selectedCompany={selectedCompany}
        onClose={() => {
          setSelectedCommodity(null);
          setSelectedCompany(null);
        }}
        commodity={selectedCommodity}
      />
    </div>
  </div>
)}

              {/* Modal popup for RateTable */}
              {showRateModal && selectedCommodity && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
                    <button
                      onClick={() => setShowRateModal(false)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-black"
                    >
                      ✕
                    </button>
                    <RateTable
                      selectedCompany={selectedCompany}
                      onClose={() => {
                        setShowRateModal(false);
                        setSelectedCompany(null);
                      }}
                      commodity={selectedCommodity}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
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
          )}
        </div>
      </div>
    </Suspense>
  );
}
