"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

export default function Welcome() {
  const { mobile } = useUser();
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || "Guest";
    }
    return "Guest";
  });

  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatName = useCallback((str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const [userResponse, companyResponse] = await Promise.all([
        axiosInstance.get("/auth/register"),
        axiosInstance.get(`/user-companies?mobile=${mobile}`),
      ]);

      const userData = userResponse.data.find(
        (user) => user.mobile.toString() === mobile
      );
      if (userData) {
        const formatted = formatName(userData.name);
        setName(formatted);
        localStorage.setItem("username", formatted);
      }

      setAssignedCompanies(companyResponse.data.companies || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setName("Guest");
    } finally {
      setLoading(false);
    }
  }, [mobile, formatName]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const assignedCompaniesList = useMemo(
    () =>
      assignedCompanies.length > 0 ? (
        <div className="mt-4 text-left">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Assigned Companies:
          </h2>
          <div className="space-y-4">
            {assignedCompanies.map((company) => (
              <div
                key={company.companyId._id}
                className="bg-gray-50 p-4 rounded-lg shadow-md"
              >
                <h3 className="font-semibold text-lg text-blue-700">
                  {company.companyId.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                  {company.locations.map((loc, index) => (
                    <span
                      key={`${company.companyId._id}-${index}`}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full text-center"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No assigned companies found.</p>
      ),
    [assignedCompanies]
  );

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-xl p-6 max-w-4xl w-full text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome, {name}
          </h1>
          {assignedCompaniesList}
        </motion.div>
      </div>
    </Suspense>
  );
}
