"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import Link from "next/link";
import dynamic from "next/dynamic";

const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function Welcome() {
  const { mobile } = useUser();
  const [name, setName] = useState("Guest");
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
      setLoading(true);

      const [userResponse, companyResponse] = await Promise.all([
        axiosInstance.get("/auth/register"),
        axiosInstance.get(`/user-companies?mobile=${mobile}`),
      ]);

      const userData = userResponse.data.find(
        (user) => user.mobile.toString() === mobile
      );

      if (userData) {
        const formattedName = formatName(userData.name);
        setName(formattedName);
        localStorage.setItem("mobile", userData.mobile);
      }

      let companies = companyResponse.data.companies || [];

      const uniqueCompanies = Array.from(
        new Map(companies.map((c) => [c.companyId?._id, c])).values()
      ).sort((a, b) => a.companyId?.name.localeCompare(b.companyId?.name));

      const cleanedCompanies = uniqueCompanies.map((c) => ({
        ...c,
        locations: Array.from(new Set(c.locations)).sort((a, b) =>
          a.localeCompare(b)
        ),
      }));

      setAssignedCompanies(cleanedCompanies);
    } catch (error) {
      console.error("Error fetching data:", error);
      setName("Guest");
    } finally {
      setLoading(false);
    }
  }, [mobile, formatName]);

  useEffect(() => {
    if (mobile) {
      fetchUserData();
    }
  }, [fetchUserData, mobile]);

  const assignedCompaniesList = useMemo(() => {
    if (assignedCompanies.length > 0) {
      return (
        <div className="mt-8 text-left">
          <Title text="Assigned Companies" />
          <div className="space-y-5 mt-4">
            {assignedCompanies.map((company) => {
              if (!company?.companyId) return null;

              return (
                <motion.div
                  key={company.companyId._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg p-5"
                >
                  <h3 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                    {company.companyId.name}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                    {company.locations.map((loc, index) => (
                      <span
                        key={`${company.companyId._id}-${index}`}
                        className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full text-center font-medium shadow-sm"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <p className="text-gray-500 dark:text-gray-400 mt-6">
          No assigned companies found.
        </p>
      );
    }
  }, [assignedCompanies]);

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 max-w-4xl w-full text-center"
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent mb-4">
            Welcome, {name}
          </h1>

          <Link
            href="/resetpassword"
            className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset Your Password
          </Link>

          {assignedCompaniesList}
        </motion.div>
      </div>
    </Suspense>
  );
}
