"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useSaudaDetails = () => {
  const [saudaDetails, setSaudaDetails] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // Validate and normalize rate data
  const validateRateData = (data) => {
    if (!Array.isArray(data)) return [];
    
    return data.map((company) => {
      if (!company || !company.days || !Array.isArray(company.days)) return company;
      
      const validatedDays = company.days.map((day) => {
        if (!day || !day.units || !Array.isArray(day.units)) return day;
        
        const validatedUnits = day.units.map((unit) => {
          if (!unit || !unit.commodities || !Array.isArray(unit.commodities)) return unit;
          
          const validatedCommodities = unit.commodities.map((commodity) => {
            if (!commodity || !commodity.saudas || !Array.isArray(commodity.saudas)) return commodity;
            
            const validatedSaudas = commodity.saudas.map((sauda) => {
              const tons = Number(sauda.tons) || 0;
              const finalRate = Number(sauda.finalRate) || 0;
              
              return {
                ...sauda,
                tons: tons > 0 ? tons : 0,
                finalRate: finalRate > 0 ? finalRate : 0,
                // Flag invalid rates for display
                isValid: tons > 0 && finalRate > 0,
              };
            });
            
            return {
              ...commodity,
              saudas: validatedSaudas,
            };
          });
          
          return {
            ...unit,
            commodities: validatedCommodities,
          };
        });
        
        return {
          ...day,
          units: validatedUnits,
        };
      });
      
      return {
        ...company,
        days: validatedDays,
      };
    });
  };

  const fetchSaudaDetails = async (sellerName, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSeller(sellerName);
      setCurrentPage(page);

      if (!sellerName || sellerName.trim() === "") {
        throw new Error("Seller name is required");
      }

      const url = `/save-sauda/sauda-descriptions?sellerName=${encodeURIComponent(
        sellerName.trim()
      )}&page=${page}`;

      const res = await axiosInstance.get(url);
      
      if (res.data && res.data.data) {
        const validatedData = validateRateData(res.data.data);
        setSaudaDetails(validatedData);
      } else {
        setSaudaDetails([]);
      }
    } catch (err) {
      console.error("Error fetching sauda details:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch sauda details";
      setError(errorMessage);
      setSaudaDetails([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    saudaDetails,
    selectedSeller,
    currentPage,
    loading,
    error,
    fetchSaudaDetails,
    setSelectedSeller,
    setSaudaDetails,
  };
};

export default useSaudaDetails;
