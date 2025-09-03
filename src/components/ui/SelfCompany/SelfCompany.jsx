"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Title from "@/components/common/Title/Title";
import Loading from "@/components/common/Loading/Loading";

const SelfCompany = () => {
  const [selfCompanies, setSelfCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelfCompanies = async () => {
      try {
        const res = await axiosInstance.get("/managecompany?self=true&limit=10000");
        setSelfCompanies(res.data?.companies || []);
      } catch (error) {
        console.error("Error fetching self companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelfCompanies();
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <Title text="Self Company List" />

      {loading ? (
        <Loading />
      ) : selfCompanies.length === 0 ? (
        <p className="text-gray-500">No self companies assigned yet.</p>
      ) : (
        <ul className="space-y-3">
          {selfCompanies.map((sc) => (
            <li
              key={sc._id}
              className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="font-semibold text-indigo-600">{sc.name}</p>
                <p className="text-sm text-gray-500">
                  {sc.category || "No category"}
                </p>
              </div>
              <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Self
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelfCompany;
