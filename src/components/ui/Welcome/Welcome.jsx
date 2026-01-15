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

      const users = Array.isArray(userResponse.data?.users)
        ? userResponse.data.users
        : [];

      const userData = users.find(
        (user) => user.mobile.toString() === mobile?.toString()
      );

      if (userData) {
        const formattedName = formatName(userData.name);
        setName(formattedName);
        localStorage.setItem("mobile", userData.mobile);
      } else {
        setName("Guest");
      }

      setAssignedCompanies(companyResponse.data?.companies ?? []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setName("Guest");
    } finally {
      setLoading(false);
    }
  }, [mobile, formatName]);

  useEffect(() => {
    if (mobile) fetchUserData();
  }, [mobile, fetchUserData]);

  const assignedCompaniesList = useMemo(() => {
    if (assignedCompanies.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 mt-6">
          No assigned companies found.
        </p>
      );
    }

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
                className="bg-gradient-to-br from-blue-50 to-blue-100
                           dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-700
                           rounded-lg shadow-md hover:shadow-lg p-5"
              >
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  {company.companyId.name}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                  {company.locations.map((loc, idx) => (
                    <span
                      key={`${company.companyId._id}-${idx}`}
                      className="bg-blue-100 dark:bg-blue-900/40
                                 text-blue-800 dark:text-blue-200
                                 text-xs px-3 py-1 rounded-full
                                 text-center font-medium shadow-sm"
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
  }, [assignedCompanies]);

  if (loading) return <Loading />;

return (
  <Suspense fallback={<Loading />}>
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-100 dark:bg-gray-950">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl rounded-3xl border border-white/20
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                   shadow-2xl p-8 md:p-12"
      >
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
            Welcome, {name} 👋
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Here are the companies assigned to your account
          </p>

          <Link
            href="/resetpassword"
            className="inline-flex mt-4 px-5 py-2 rounded-full text-sm font-semibold
                       bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                       shadow-lg hover:shadow-xl transition"
          >
            Reset Password
          </Link>
        </div>
        <div className="mt-12">
          <Title text="Assigned Companies" />

          {assignedCompanies.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No assigned companies found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {assignedCompanies.map((company, index) => {
                if (!company?.companyId) return null;

                return (
                  <motion.div
                    key={company.companyId._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group rounded-2xl border border-white/20
                               bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg
                               shadow-lg hover:shadow-2xl transition-all p-6"
                  >
                    <h3 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                      {company.companyId.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {company.locations.map((loc, idx) => (
                        <span
                          key={`${company.companyId._id}-${idx}`}
                          className="px-3 py-1 rounded-full text-xs font-semibold
                                     bg-gradient-to-r from-blue-100 to-teal-100
                                     dark:from-blue-900/40 dark:to-teal-900/40
                                     text-blue-800 dark:text-blue-200
                                     shadow-sm hover:scale-105 transition"
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  </Suspense>
);
}

