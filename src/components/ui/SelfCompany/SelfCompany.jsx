"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Title from "@/components/common/Title/Title";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import SaudaDetails from "@/components/ui/SelfCompany/SaudaDetails/SaudaDetails";

const SelfCompany = () => {
  const [selfCompanies, setSelfCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showSaudaType, setShowSaudaType] = useState(null);

  useEffect(() => {
    const fetchSelfCompanies = async () => {
      try {
        const res = await axiosInstance.get(
          "/managecompany?self=true&limit=10000"
        );
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selfCompanies.map((sc) => (
            <motion.div
              key={sc._id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border rounded-lg bg-gray-50 shadow cursor-pointer"
              onClick={() => {
                setSelectedCompany(sc);
                setShowSaudaType(null); // reset on open
              }}
            >
              <p className="font-semibold text-indigo-600">{sc.name}</p>
              <p className="text-sm text-gray-500">
                {sc.category || "No category"}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setSelectedCompany(null)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg w-[90%] max-w-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {selectedCompany.name}
              </h2>

              {!showSaudaType ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowSaudaType("purchase")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    Purchase
                  </button>
                  <button
                    onClick={() => setShowSaudaType("sale")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Sale
                  </button>
                </div>
              ) : (
                <SaudaDetails
                  company={selectedCompany.name}
                  type={showSaudaType}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelfCompany;
