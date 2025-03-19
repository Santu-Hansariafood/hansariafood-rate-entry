"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "@/components/common/Title/Title";

export default function RateManagement() {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rates, setRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [completedCompanies, setCompletedCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleCompanySelect = async (companyName) => {
    setSelectedCompany(companyName);

    try {
      const { data } = await axios.get("/api/managecompany");
      const companyData = data.companies.find((c) => c.name === companyName);

      if (companyData) {
        setLocations(companyData.location);

        const rateResponse = await axios.get(
          `/api/rate?company=${companyName}`
        );
        const existingRates = rateResponse.data;

        const updatedRates = companyData.location.map((location) => {
          const foundRate = existingRates.find(
            (rate) => rate.location === location
          );
          return {
            location,
            oldRates: foundRate?.oldRates || [],
            newRate: foundRate?.newRate || "",
          };
        });

        setRates(updatedRates);
      }
    } catch (error) {
      toast.error("Failed to fetch locations or rates");
    }
  };

  const handleEdit = (index) => setEditIndex(index);

  const handleSave = async (index) => {
    const rateToSave = rates[index];

    if (!rateToSave.newRate) {
      toast.error("New rate cannot be empty!");
      return;
    }

    try {
      const updatedOldRates = [
        ...rateToSave.oldRates,
        `${rateToSave.newRate} (${new Date().toLocaleDateString("en-GB")})`,
      ];

      const response = await axios.post("/api/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: rateToSave.newRate,
        oldRates: updatedOldRates, // Properly formatted old rates
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Rate updated successfully!");

        const updatedRatesResponse = await axios.get(
          `/api/rate?company=${selectedCompany}`
        );
        const existingRates = updatedRatesResponse.data;

        const updatedRates = locations.map((location) => {
          const foundRate = existingRates.find(
            (rate) => rate.location === location
          );
          return {
            location,
            oldRates: foundRate?.oldRates || [],
            newRate: foundRate?.newRate || "",
          };
        });

        setRates(updatedRates);
        checkAllCompanies([selectedCompany]);
      } else {
        toast.error("Failed to update rate.");
      }
    } catch (error) {
      toast.error("Error updating rate.");
    }

    setEditIndex(null);
  };

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen w-full">
      <ToastContainer />
      <Title text="Rate Management" />
      <input
        type="text"
        placeholder="Search by company name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-md w-64 text-center"
      />
      {loading ? (
        <p className="text-gray-500">Loading companies...</p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {filteredCompanies.map((company) => (
            <button
              key={company}
              onClick={() => handleCompanySelect(company)}
              className={`px-4 py-2 rounded-lg text-white transition-all ${
                completedCompanies[company]
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {company}
            </button>
          ))}
        </div>
      )}

      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedCompany(null)
          }
        >
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Rates for {selectedCompany}
            </h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Location</th>
                  <th className="border p-2">Old Rates</th>
                  <th className="border p-2">New Rate</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate, index) => (
                  <tr key={index} className="text-center">
                    <td className="border p-2">{rate.location}</td>
                    <td className="border p-2">
                      {rate.oldRates.map((old, i) => (
                        <div key={i} className="text-sm">
                          {old}
                        </div>
                      ))}
                    </td>

                    <td className="border p-2">
                      <input
                        type="text"
                        value={rate.newRate || ""}
                        onChange={(e) => {
                          const updatedRates = [...rates];
                          updatedRates[index].newRate = e.target.value;
                          setRates(updatedRates);
                        }}
                        className="border p-1 w-full"
                        disabled={editIndex !== index}
                      />
                    </td>
                    <td className="border p-2">
                      {editIndex === index ? (
                        <button
                          onClick={() => handleSave(index)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(index)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
