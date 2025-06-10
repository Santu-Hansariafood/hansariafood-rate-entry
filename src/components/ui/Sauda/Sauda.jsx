"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import ManageCompanyPopup from "@/components/ui/Sauda/ManageCompanyPopup/ManageCompanyPopup";
import Title from "@/components/common/Title/Title";

const Sauda = () => {
  const [companies, setCompanies] = useState([]);
  const [rateData, setRateData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCompanies = async (search = "") => {
    try {
      const res = await axiosInstance.get(
        `/companies?search=${search}&limit=1000` // Increase limit to load all
      );
      const fetchedCompanies = res.data.companies || [];
      setCompanies(fetchedCompanies);

      const companyNames = fetchedCompanies.map((c) => c.name);
      if (companyNames.length > 0) {
        const rateRes = await axiosInstance.get(
          `/rate?companies=${companyNames.join(",")}`
        );
        setRateData(rateRes.data || []);
      } else {
        setRateData([]);
      }
    } catch (error) {
      toast.error("Failed to load company or rate data");
    }
  };

  useEffect(() => {
    fetchCompanies(searchTerm);
  }, [searchTerm]);

  const hasRate = (companyName) => {
    return rateData.some(
      (rate) =>
        rate.company === companyName &&
        rate.hasNewRateToday === true &&
        rate.newRate !== null &&
        rate.newRate !== undefined &&
        rate.newRate !== "" &&
        !isNaN(rate.newRate)
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-4 space-y-4">
      <Title text="Check Sauda List" />

      <input
        type="text"
        placeholder="Search by company name..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies
          .filter((company) => hasRate(company.name))
          .map((company) => (
            <div
              key={company._id}
              onClick={() => setSelectedCompany(company.name)}
              className="p-4 rounded-xl shadow-lg cursor-pointer transition-transform transform hover:scale-105 bg-green-50 border border-green-400"
            >
              <h2
                title="Rate available"
                className="text-lg font-bold text-green-700"
              >
                {company.name}
              </h2>
              <p className="text-sm text-gray-600">{company.category}</p>
            </div>
          ))}
      </div>

      {selectedCompany && (
        <ManageCompanyPopup
          name={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};

export default Sauda;
