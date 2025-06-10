"use client";

import React, { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination/Pagination";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import ManageCompanyPopup from "@/components/ui/Sauda/ManageCompanyPopup/ManageCompanyPopup";
import Title from "@/components/common/Title/Title";

const Sauda = () => {
  const [companies, setCompanies] = useState([]);
  const [rateData, setRateData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const fetchCompanies = async (page = 1, search = "") => {
    try {
      const res = await axiosInstance.get(
        `/companies?page=${page}&limit=${itemsPerPage}&search=${search}`
      );
      const fetchedCompanies = res.data.companies;
      setCompanies(fetchedCompanies);
      setTotalItems(res.data.total);

      const companyNames = fetchedCompanies.map((c) => c.name);
      const rateRes = await axiosInstance.get(
        `/rate?companies=${companyNames.join(",")}`
      );
      setRateData(rateRes.data || []);
    } catch (error) {
      toast.error("Failed to load company or rate data", error);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

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
    setCurrentPage(1);
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
        {companies.map((company) => {
          const isAvailable = hasRate(company.name);
          return (
            <div
              key={company._id}
              onClick={() => setSelectedCompany(company.name)}
              className={`p-4 rounded-xl shadow-lg cursor-pointer transition-transform transform hover:scale-105
                ${isAvailable ? "bg-green-50 border border-green-400" : "bg-red-50 border border-red-400"}`}
            >
              <h2
                title={isAvailable ? "Rate available" : "Rate missing"}
                className={`text-lg font-bold ${
                  isAvailable ? "text-green-700" : "text-red-700"
                }`}
              >
                {company.name}
              </h2>
              <p className="text-sm text-gray-600">{company.category}</p>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

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
