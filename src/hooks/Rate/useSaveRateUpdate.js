"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useSaveRateUpdate(router) {
  const [saving, setSaving] = useState(false);

  const saveRateUpdate = async (selectedCompanies, onSuccess) => {
    try {
      setSaving(true);

      const res = await axiosInstance.post("/rateupdate", {
        companies: selectedCompanies,
      });

      if (res.data.success) {
        toast.success(`Saved ${selectedCompanies.length} companies for today`);

        if (onSuccess) onSuccess();

        try {
          router.refresh();
        } catch {}
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save companies");
    } finally {
      setSaving(false);
    }
  };

  return { saveRateUpdate, saving };
}
