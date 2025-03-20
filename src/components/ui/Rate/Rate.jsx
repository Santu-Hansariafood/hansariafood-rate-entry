"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompanyList = dynamic(() => import("./CompanyList/CompanyList"));
const RateTable = dynamic(() => import("./RateTable/RateTable"));
const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function Rate() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [completedCompanies, setCompletedCompanies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/managecompany");
        const companyNames = response.data.companies.map(
          (company) => company.name
        );
        setCompanies(companyNames);
        await checkAllCompanies(companyNames);
      } catch (error) {
        toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

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
    <Suspense fallback={<p>Loading...</p>}>
      <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen w-full">
        <ToastContainer />
        <Title text="Rate Management" />
        <CompanyList
          companies={companies}
          completedCompanies={completedCompanies}
          loading={loading}
          onCompanySelect={setSelectedCompany}
        />
        {selectedCompany && (
          <RateTable
            selectedCompany={selectedCompany}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </div>
    </Suspense>
  );
}
