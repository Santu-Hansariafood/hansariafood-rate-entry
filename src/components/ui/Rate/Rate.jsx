"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { Building2, ArrowLeft } from "lucide-react";

const CompanyList = dynamic(() => import("./CompanyList/CompanyList"));
const RateTable = dynamic(() => import("./RateTable/RateTable"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const CategoryCard = dynamic(() =>
  import("@/components/ui/Rate/CategoryCard/CategoryCard")
);
const Pagination = dynamic(() =>
  import("@/components/common/Pagination/Pagination")
);

export default function Rate() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
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
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/managecompany?page=${currentPage}&limit=${itemsPerPage}`
        );
        const { companies: companyList, total } = response.data;

        setAllCompanies(companyList);
        setTotalItems(total);

        const filteredNames = companyList
          .filter(
            (c) =>
              Object.values(filters).length === 0 ||
              Object.values(filters).includes(c.category)
          )
          .map((c) => c.name);

        setCompanies(filteredNames);
        await checkAllCompanies(filteredNames);
      } catch (error) {
        toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [filters, currentPage]);

  const checkAllCompanies = useCallback(async (companyNames) => {
    try {
      const statusMap = await Promise.all(
        companyNames.map(async (company) => {
          try {
            const rateResponse = await axios.get(
              `/api/rate?company=${company}`
            );
            return {
              [company]:
                rateResponse.data.length > 0 &&
                rateResponse.data.every((rate) => rate.hasNewRateToday),
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
              <RateTable
                selectedCompany={selectedCompany}
                onClose={() => setSelectedCompany(null)}
                onRateUpdate={async () => await checkAllCompanies(companies)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                <CompanyList
                  companies={companies}
                  completedCompanies={completedCompanies}
                  loading={loading}
                  onCompanySelect={setSelectedCompany}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </motion.div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </Suspense>
  );
}
