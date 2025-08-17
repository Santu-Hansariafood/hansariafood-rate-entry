import { useState } from "react";
import { toast } from "react-toastify";
import { generateSaudaPDF } from "@/utils/generateSaudaPDF/generateSaudaPDF";
import { generateRatePDF } from "@/utils/generateSaudaPDF/generateRatePDF";

export const useSaudaExport = ({ company, today, rates, entries }) => {
  const [showCommodityPicker, setShowCommodityPicker] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showRatePicker, setShowRatePicker] = useState(false);

  const handleShare = (loading) => {
    if (loading) return toast.warn("Data still loading.");
    setShowCommodityPicker(true);
  };

  const handleCommodityDone = (selected) => {
    generateSaudaPDF({
      company: company.name,
      date: today,
      rateData: rates,
      saudaEntries: entries,
      allowedCommodities: selected,
    });
    setShowCommodityPicker(false);
    setShowSharePopup(true);
  };

  const handleExportRate = (loading) => {
    if (loading) return toast.warn("Data still loading.");
    setShowRatePicker(true);
  };

  const handleRateDone = (selected) => {
    generateRatePDF({
      company: company.name,
      date: today,
      rateData: rates,
      allowedCommodities: selected,
    });
    setShowRatePicker(false);
  };

  return {
    showCommodityPicker,
    setShowCommodityPicker,
    showSharePopup,
    setShowSharePopup,
    showRatePicker,
    setShowRatePicker,
    handleShare,
    handleCommodityDone,
    handleExportRate,
    handleRateDone,
  };
};
