"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { Building2, ArrowLeft } from "lucide-react";
import CategoryCard from "./CategoryCard/CategoryCard";

const CompanyList = dynamic(() => import("./CompanyList/CompanyList"));
const RateTable = dynamic(() => import("./RateTable/RateTable"));
const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function Rate() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [completedCompanies, setCompletedCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/managecompany");
        const allCompanies = response.data.companies; // include category in this object

        const selectedCategoryNames = Object.values(filters); // ['Feed Mills', 'STARCH', ...]
        const filtered = selectedCategoryNames.length
          ? allCompanies.filter((company) =>
              selectedCategoryNames.includes(company.category)
            )
          : allCompanies;

        const companyNames = filtered.map((c) => c.name);
        setCompanies(companyNames);

        await checkAllCompanies(companyNames);
      } catch (error) {
        toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [filters]);

  const checkAllCompanies = async (companyNames) => {
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
                rateResponse.data.every((rate) => rate.newRate),
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
  };

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
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
