"use client";
import { toast } from "react-toastify";

export default function useCopyNotification() {
  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "N/A";

  const handleCopy = async (notification) => {
    const { company, quantity, location, newRate, newRateDate, updateTime } =
      notification;

    const todayDate = new Date().toLocaleDateString("en-IN");
    const datePart = new Date(newRateDate || Date.now()).toLocaleDateString(
      "en-IN"
    );
    const time = `${datePart}, ${updateTime || "N/A"}`;
    const commodity = capitalizeFirst(notification.commodity || "N/A");

    const copyText = `_*New Offer - ${todayDate}*_\nToday *${company}* is offering *${commodity}*\n*${quantity}mt @${newRate}/-* \nfor the *${location}* location \n(Updated on: ${time}).\n\n _Thanks,_ \n _Purchase Team_\n _Hansaria Food Pvt Ltd_`;

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Details copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy text.");
    }
  };

  return { handleCopy, capitalizeFirst };
}
