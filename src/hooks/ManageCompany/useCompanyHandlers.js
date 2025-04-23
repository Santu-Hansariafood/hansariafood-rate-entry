"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export const useCompanyHandlers = (companies, setEditingCompany, fetchAllData) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleView = async (id) => {
    try {
      const { data } = await axiosInstance.get(`/managecompany/${id}`);
      const locations = (data.company.location || [])
        .map((l) => (typeof l === "string" ? l : `${l.name} (${l.state})`))
        .join(", ");
      alert(`Company: ${data.company.name}\nLocation(s): ${locations}`);
    } catch (err) {
      toast.error("Failed to fetch company details");
    }
  };

  const handleEdit = (id) => {
    if (!Array.isArray(companies)) {
      console.error("Expected companies to be an array, but got:", companies);
      toast.error("Internal error: company data is not available");
      return;
    }

    const company = companies.find((c) => c._id === id);
    if (!company) {
      toast.error("Company not found");
      return;
    }

    setEditingCompany({
      _id: company._id,
      name: company.name,
      location: company.location.map((loc) => ({
        ...loc,
        mobileNumbers: loc.mobileNumbers || [{ primary: "", secondary: "" }],
      })),
      category: company.category || "",
    });
  };

  const handleUpdate = async (e, editingCompany, setEditingCompany) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedData = {
        name: editingCompany.name,
        category: editingCompany.category,
        location: editingCompany.location.map((loc) => ({
          name: loc.name,
          state: loc.state,
        })),
        mobileNumbers: editingCompany.location.map((loc) => ({
          location: loc.name,
          primaryMobile: loc.mobileNumbers?.[0]?.primary || "",
          secondaryMobile: loc.mobileNumbers?.[0]?.secondary || "",
        })),
      };

      await axiosInstance.put(`/managecompany/${editingCompany._id}`, updatedData);
      toast.success("Company updated");
      setEditingCompany(null);
      fetchAllData();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/managecompany/${id}`);
      toast.success("Deleted successfully");
      fetchAllData();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleView,
    handleEdit,
    handleUpdate,
    handleDelete,
  };
};
