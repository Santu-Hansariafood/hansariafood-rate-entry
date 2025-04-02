"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import axios from "axios";
import Title from "@/components/common/Title/Title";

export default function Welcome() {
  const { mobile } = useUser();
  const [name, setName] = useState("");
  const [assignedCompanies, setAssignedCompanies] = useState([]);

  const formatName = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get("/api/auth/register");
        const userData = userResponse.data.find(
          (user) => user.mobile.toString() === mobile
        );
        setName(userData ? formatName(userData.name) : "Guest");
        const companyResponse = await axios.get(
          `/api/user-companies?mobile=${mobile}`
        );
        if (companyResponse.data.companies) {
          setAssignedCompanies(companyResponse.data.companies);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setName("Guest");
      }
    };

    fetchUserData();
  }, [mobile]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-xl p-6 max-w-4xl w-full text-center"
      >
        <Title>Welcome, {name}</Title>
        {assignedCompanies.length > 0 ? (
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
        )}
      </motion.div>
    </div>
  );
}
