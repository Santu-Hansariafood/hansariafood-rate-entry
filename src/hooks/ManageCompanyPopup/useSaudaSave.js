import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export const useSaudaSave = (
  company,
  entries,
  role,
  tradeMode,
  today,
  lastUpdated,
  setLastUpdated
) => {
  const [saveStatus, setSaveStatus] = useState({});

  const handleUnitSave = async (key, idx) => {
    if (!company) return;
    const [unit, commodity] = key.split("-");
    const entry = entries[key]?.[idx];
    if (!entry) return;

    const entryId = `${key}-${idx}`;
    setSaveStatus((prev) => ({ ...prev, [entryId]: "saving" }));

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const payload = {
      company: company.name,
      date: today,
      time: currentTime,
      saudaEntries: {
        [key]: [
          {
            ...entry,
            tons: +entry.tons || 0,
            unit,
            commodity,
          },
        ],
      },
      lastUpdated,
    };

    const effectiveRole =
      role && role !== "both"
        ? role
        : tradeMode === "selling"
        ? "seller"
        : tradeMode === "buying"
        ? "buyer"
        : null;

    if (!effectiveRole) {
      toast.error("Please select trade mode.");
      setSaveStatus((prev) => ({ ...prev, [entryId]: "error" }));
      return;
    }

    payload[effectiveRole] = company.name;

    try {
      const { status, data } = await axiosInstance.post("/save-sauda", payload);
      if (status === 201 && data.entry) {
        toast.success(`Saved successfully for ${unit} - ${commodity}`);
        setLastUpdated(data.entry.lastUpdated);
        setSaveStatus((prev) => ({ ...prev, [entryId]: "success" }));
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("Data has been updated by someone else. Please refresh.");
      } else {
        toast.error("Error saving data");
      }
      setSaveStatus((prev) => ({ ...prev, [entryId]: "error" }));
    }
  };

  return { handleUnitSave, saveStatus };
};
