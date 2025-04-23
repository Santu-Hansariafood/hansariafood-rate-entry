"use client";

import { useState, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import stateCityData from "@/data/state-city.json";
import { toast } from "react-toastify";

export const useCreateLocationForm = () => {
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const filteredStates = useMemo(() => {
    if (!state.trim()) return stateCityData;
    return stateCityData.filter((item) =>
      item.state.toLowerCase().includes(state.toLowerCase())
    );
  }, [state]);

  const handleStateChange = (e) => {
    setState(e.target.value);
    setDropdownOpen(true);
  };

  const handleStateSelect = (selectedState) => {
    setState(selectedState);
    setDropdownOpen(false);
  };

  const handleSave = useCallback(async () => {
    if (!state.trim()) return toast.error("Please select a state");
    if (!location.trim()) return toast.error("Location name cannot be empty");

    try {
      setLoading(true);
      const { status } = await axiosInstance.post("/location", {
        state,
        name: location,
      });

      if (status === 201) {
        toast.success("Location saved successfully");
        setState("");
        setLocation("");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save location");
    } finally {
      setLoading(false);
    }
  }, [state, location]);

  return {
    state,
    location,
    loading,
    isDropdownOpen,
    filteredStates,
    handleStateChange,
    handleStateSelect,
    handleSave,
    setLocation,
    setDropdownOpen,
  };
};
