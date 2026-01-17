"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import Title from "@/components/common/Title/Title";
import { toast } from "react-toastify";

export default function ManageMDOCVisibility({ onUpdated }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/mdoccompany/manage");
      setCompanies(res.data?.companies || []);
    } catch (err) {
      toast.error("Failed to load companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const toggleVisibility = async (company) => {
    try {
      setUpdatingId(company._id);

      await axiosInstance.put(`/mdoccompany/${company._id}/visibility`, {
        isMDOCVisible: !company.isMDOCVisible,
      });

      setCompanies((prev) =>
        prev.map((c) =>
          c._id === company._id ? { ...c, isMDOCVisible: !c.isMDOCVisible } : c
        )
      );

      toast.success(
        `Company ${company.isMDOCVisible ? "hidden" : "visible"} successfully`
      );
      onUpdated?.();
    } catch (err) {
      toast.error("Failed to update visibility");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title text="Manage M DOC Company Visibility" />

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {companies.map((company, index) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl p-4 border flex items-center justify-between
                ${
                  company.isMDOCVisible
                    ? "bg-green-900 border-green-700"
                    : "bg-red-900 border-red-700"
                }`}
            >
              <div className="min-w-0">
                <h3 className="text-white font-medium truncate">
                  {company.name}
                </h3>
                <p
                  className={`text-sm ${
                    company.isMDOCVisible ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {company.isMDOCVisible
                    ? "Visible in M DOC Rate"
                    : "Hidden from M DOC Rate"}
                </p>
              </div>

              <button
                disabled={updatingId === company._id}
                onClick={() => toggleVisibility(company)}
                className={`p-2 rounded-lg transition disabled:opacity-50
                  ${
                    company.isMDOCVisible
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
              >
                {company.isMDOCVisible ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && companies.length === 0 && (
        <p className="text-gray-400 mt-6">No companies found.</p>
      )}
    </div>
  );
}
