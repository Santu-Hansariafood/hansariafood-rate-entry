"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useRegisterActions({ companies, fetchUsers }) {
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenPopup = async (user) => {
    if (!user?.mobile) {
      toast.error("Invalid user data");
      return;
    }

    setSelectedUser(user);
    try {
      const res = await axiosInstance.get(
        `/user-companies?mobile=${user.mobile}`
      );

      if (Array.isArray(res.data?.companies) && res.data.companies.length > 0) {
        const preselectedCompanies = res.data.companies
          .filter((c) => c?.companyId?._id)
          .map((c) => c.companyId._id);

        const preselectedLocations = res.data.companies
          .filter((c) => Array.isArray(c?.locations))
          .flatMap((c) => c.locations);

        setSelectedCompanies(preselectedCompanies);
        setSelectedLocations(preselectedLocations);
      } else {
        setSelectedCompanies([]);
        setSelectedLocations([]);
      }
    } catch (err) {
      console.error("Error loading preselected companies:", err);
      setSelectedCompanies([]);
      setSelectedLocations([]);
    }
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
    setSelectedCompanies([]);
    setSelectedLocations([]);
    setSelectedUser(null);
  };

  const handleCompanyChange = (companyId) => {
    if (!selectedCompanies.includes(companyId)) {
      setSelectedCompanies((prev) => [...prev, companyId]);
    }
  };

  const handleRemoveCompany = (companyId) => {
    setSelectedCompanies((prev) => prev.filter((id) => id !== companyId));
    setSelectedLocations((prev) =>
      prev.filter((loc) => {
        const company = companies.find((c) => c._id === companyId);
        return !company?.location.includes(loc);
      })
    );
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  const handleSelectAllLocations = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    if (company) {
      const allLocations = company.location;
      const currentSelected = selectedLocations.filter(
        (loc) => !allLocations.includes(loc)
      );
      setSelectedLocations([...currentSelected, ...allLocations]);
    }
  };

  const handleDeselectAllLocations = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    if (company) {
      setSelectedLocations((prev) =>
        prev.filter((loc) => !company.location.includes(loc))
      );
    }
  };

  const isAllLocationsSelected = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    if (!company) return false;
    return company.location.every((loc) => selectedLocations.includes(loc));
  };

  const handleSave = async () => {
    if (!selectedCompanies.length || !selectedLocations.length) {
      toast.error("Please select at least one company and location");
      return;
    }

    try {
      setSaving(true);
      const companiesData = selectedCompanies.map((companyId) => {
        const company = companies.find((c) => c._id === companyId);
        return {
          companyId,
          locations: selectedLocations.filter((loc) =>
            company?.location.includes(loc)
          ),
        };
      });

      if (!companiesData.every((company) => company.locations.length > 0)) {
        toast.error("Each selected company must have at least one location");
        return;
      }

      await axiosInstance.post("/user-companies", {
        mobile: selectedUser.mobile,
        companies: companiesData,
      });

      toast.success("Companies and locations assigned successfully");
      handleClosePopup();
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          "Failed to assign companies and locations"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;

    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.delete("/auth/register", {
        data: { id: userId },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  return {
    open,
    selectedUser,
    saving,
    selectedCompanies,
    selectedLocations,
    handleOpenPopup,
    handleClosePopup,
    handleSave,
    handleDeleteUser,
    handleCompanyChange,
    handleRemoveCompany,
    handleLocationToggle,
    handleSelectAllLocations,
    handleDeselectAllLocations,
    isAllLocationsSelected,
  };
}
