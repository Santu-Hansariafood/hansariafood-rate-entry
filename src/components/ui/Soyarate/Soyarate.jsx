"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import SoyaCompanyPopup from "../SoyaCompanyPopup/SoyaCompanyPopup";

export default function Soyarate() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/soyacompany");

      setCompanies(res.data?.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch single company data
  const openPopup = async (id) => {
    try {
      const res = await axiosInstance.get(`/soyacompany/${id}`)
      setSelectedCompany(res.data);
      setPopupOpen(true);
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-6">
        Soya Commodity Company List
      </h1>

      {loading ? (
        <p className="text-green-400">Loading...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="
            grid
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            gap-4
          "
        >
          {companies.map((company, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="
                bg-green-900 
                border border-green-700 
                rounded-xl 
                p-4 
                flex 
                items-center 
                gap-3 
                hover:bg-green-800 
                transition-all 
                duration-200
                shadow-sm
                cursor-pointer
              "
              onClick={() => openPopup(company._id)}
            >
              <div className="p-2 rounded-lg bg-green-100">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>

              <h3 className="text-white font-medium truncate">
                {company.name}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && companies.length === 0 && (
        <p className="text-green-400 mt-6">No companies found.</p>
      )}

      {/* Popup */}
      <SoyaCompanyPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        data={selectedCompany}
      />
    </div>
  );
}
