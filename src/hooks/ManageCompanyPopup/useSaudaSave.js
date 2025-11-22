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
    const entryList = entries[key];
    if (!entryList || !entryList.length) return;

    const entryId = `${key}-${idx}`;
    setSaveStatus((prev) => ({ ...prev, [entryId]: "saving" }));

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const rowsToPersist = entryList.filter((row) => {
      const hasTons = Number(row.tons) > 0;
      const hasRate = Number(row.finalRate) > 0;
      const hasSellerName = (row.sellerName || "").trim() !== "";
      const hasSellerCompany = (row.sellerCompany || "").trim() !== "";
      return hasTons && hasRate && hasSellerName && hasSellerCompany;
    });

    if (rowsToPersist.length === 0) {
      toast.warn(
        "Please fill in tons, rate, seller name, and seller company before saving."
      );
      setSaveStatus((prev) => ({ ...prev, [entryId]: "error" }));
      return;
    }

    const payload = {
      company: company.name,
      date: today,
      time: currentTime,
      saudaEntries: {
        [key]: rowsToPersist.map((entry) => ({
          ...entry,
          tons: +entry.tons || 0,
          unit,
          commodity,
          sellerName: entry.sellerName || "",
          sellerCompany: entry.sellerCompany || "",
          deliveryDate: entry.deliveryDate || "",
        })),
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
        setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [entryId]: "" }));
        }, 3000);
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
