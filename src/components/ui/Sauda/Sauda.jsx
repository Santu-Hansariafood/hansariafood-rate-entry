"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const ManageCompanyPopup = dynamic(() =>
  import("@/components/ui/Sauda/ManageCompanyPopup/ManageCompanyPopup")
);
const Title = dynamic(() => import("@/components/common/Title/Title"));

const Sauda = () => {
  const [companies, setCompanies] = useState([]);
  const [rateData, setRateData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saudaStatusMap, setSaudaStatusMap] = useState({});

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get(`/companies?limit=1000`);
        const fetchedCompanies = res.data.companies || [];
        setCompanies(fetchedCompanies);

        const companyNames = fetchedCompanies.map((c) => c.name);

        if (companyNames.length > 0) {
          const rateRes = await axiosInstance.get(
            `/rate?companies=${companyNames.join(",")}`
          );
          setRateData(rateRes.data || []);

          const saudaStatuses = {};

          const today = new Date()
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-");

          for (const company of companyNames) {
            try {
              const saudaRes = await axiosInstance.get(
                `/save-sauda?company=${company}&date=${today}`
              );

              const entry = saudaRes.data?.entry?.saudaEntries;

              let status = "green";

              if (entry) {
                const values = Object.values(entry);

                const hasSauda = values.some((entries) =>
                  entries.some((e) => {
                    const hasTons = e.tons && Number(e.tons) > 0;
                    const hasDescription =
                      e.description && e.description.trim() !== "";
                    return hasTons || hasDescription;
                  })
                );

                const allSaudaNosFilled = values.every((entries) =>
                  entries.every(
                    (e) =>
                      e.saudaNo !== null &&
                      e.saudaNo !== undefined &&
                      String(e.saudaNo).trim() !== ""
                  )
                );

                if (hasSauda && allSaudaNosFilled) {
                  status = "blue";
                } else if (hasSauda) {
                  status = "yellow";
                }
              }

              saudaStatuses[company] = status;
            } catch (_) {}
          }

          setSaudaStatusMap(saudaStatuses);
        } else {
          setRateData([]);
        }
      } catch (error) {
        toast.error("Failed to load company or rate data");
      }
    };

    fetchCompanies();
  }, []);

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

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => hasRate(company.name))
      .filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [companies, rateData, searchTerm]);

  const handlePopupClose = (companyName, status = null) => {
    setSelectedCompany(null);
    if (status) {
      setSaudaStatusMap((prev) => ({
        ...prev,
        [companyName]: status,
      }));
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-4">
        <Title text="Check Sauda List" />

        <input
          type="text"
          placeholder="Search by company name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map((company) => {
            const statusColor = saudaStatusMap[company.name] || "green";
            const bgColor =
              statusColor === "blue"
                ? "bg-blue-50 border-blue-400"
                : statusColor === "yellow"
                ? "bg-yellow-50 border-yellow-400"
                : "bg-green-50 border-green-400";

            const textColor =
              statusColor === "blue"
                ? "text-blue-700"
                : statusColor === "yellow"
                ? "text-yellow-700"
                : "text-green-700";

            return (
              <div
                key={company._id}
                onClick={() => setSelectedCompany(company.name)}
                className={`p-4 rounded-xl shadow-lg cursor-pointer transition-transform transform hover:scale-105 border ${bgColor}`}
              >
                <h2
                  title="Rate available"
                  className={`text-lg font-bold ${textColor}`}
                >
                  {company.name}
                </h2>
                <p className="text-sm text-gray-600">{company.category}</p>
              </div>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No companies found.
          </div>
        )}

        {selectedCompany && (
          <ManageCompanyPopup
            name={selectedCompany}
            onClose={(status) => handlePopupClose(selectedCompany, status)}
          />
        )}

        <div className="mt-6 flex items-center justify-center">
          <h3 className="text-md font-semibold mb-2">Legend:</h3>
          <div className="flex gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Green: No Sauda entered yet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Yellow: Partial Sauda filled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span>Blue: Sauda + Sauda No filled</span>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Sauda;
