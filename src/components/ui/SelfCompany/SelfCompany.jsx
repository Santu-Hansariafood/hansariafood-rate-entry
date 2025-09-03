"use client";

import React, { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Title from "@/components/common/Title/Title";
import Loading from "@/components/common/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const SelfCompany = () => {
  const [selfCompanies, setSelfCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

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
    <Suspense fallback={<Loading />}>
      <div className="p-6 bg-white shadow rounded-xl">
        <Title text="Self Company List" />

        {loading ? (
          <Loading />
        ) : selfCompanies.length === 0 ? (
          <p className="text-gray-500">No self companies assigned yet.</p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {selfCompanies.map((sc, index) => (
              <motion.div
                key={sc._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-50 to-white border hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedCompany(sc)}
              >
                <h3 className="text-lg font-semibold text-indigo-700">
                  {sc.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {sc.category || "No category"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
        <AnimatePresence>
          {selectedCompany && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h2 className="text-xl font-bold text-indigo-700 mb-4">
                  {selectedCompany.name}
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Category: {selectedCompany.category || "N.A"}
                </p>
                <div className="flex justify-between">
                  <Link
                    href={`/sale/${selectedCompany._id}`}
                    className="px-4 py-2 rounded-xl bg-green-500 text-white font-medium shadow hover:bg-green-600 transition"
                  >
                    Sale
                  </Link>
                  <Link
                    href={`/purchase/${selectedCompany._id}`}
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition"
                  >
                    Purchase
                  </Link>
                </div>
                <button
                  className="mt-6 text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedCompany(null)}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
};

export default SelfCompany;
