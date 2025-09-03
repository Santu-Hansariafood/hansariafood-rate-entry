"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const SaudaDetails = ({ company, type }) => {
  const [saudas, setSaudas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSauda = async () => {
      try {
        const res = await axiosInstance.get(`/save-sauda?company=${company}`);
        setSaudas(res.data?.entry?.saudaEntries || []);
      } catch (error) {
        console.error("Error fetching sauda:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSauda();
  }, [company]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        {type === "purchase" ? "Purchase" : "Sale"} Sauda Details
      </h3>

      {loading ? (
        <Loading />
      ) : saudas.length === 0 ? (
        <p className="text-gray-500">No sauda entries found.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(saudas).map(([commodity, entries]) =>
            entries.map((entry, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg bg-gray-50 shadow-sm"
              >
                <p className="font-semibold text-indigo-600">
                  Sauda No: {entry.saudaNo}
                </p>
                <p className="text-sm text-gray-600">Buyer: {entry.sellerName}</p>
                <p className="text-sm text-gray-600">Qty: {entry.tons} {entry.unit}</p>
                <p className="text-sm text-gray-600">Rate: {entry.finalRate}</p>
                <p className="text-sm text-gray-800 font-medium">
                  Amount: {entry.tons * entry.finalRate}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SaudaDetails;
