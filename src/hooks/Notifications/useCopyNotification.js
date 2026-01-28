"use client";
import { toast } from "react-toastify";

export default function useCopyNotification() {
  const normalize = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();

  const capitalizeWords = (str) =>
    str
      ? str
          .toLowerCase()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "N/A";

  const capitalizeFirst = capitalizeWords;

  const offeringCommodities = [
    "m doc",
    "rice ddgs",
    "sbm 46%",
    "sbm 47%",
    "sbm 48%",
    "sbm 50%",
    "sbm 51%",
  ];

  const requiredCommodities = [
    "broken rice",
    "grader broken",
    "maize",
    "maize assam",
    "maize bengal",
    "maize bihar",
    "maize mp",
    "maize up",
    "rejection broken",
    "wheat",
  ];

  const OFFERING_SET = new Set(offeringCommodities.map(normalize));
  const REQUIRED_SET = new Set(requiredCommodities.map(normalize));

  const handleCopy = async (notification) => {
    const {
      company,
      quantity,
      location,
      newRate,
      newRateDate,
      updateTime,
      payment,
      others,
    } = notification;

    const todayDate = new Date().toLocaleDateString("en-IN");
    const datePart = new Date(newRateDate || Date.now()).toLocaleDateString(
      "en-IN"
    );
    const time = `${datePart}, ${updateTime || "N/A"}`;

    const rawCommodityLower = normalize(notification.commodity || "N/A");

    let label = "";
    if (OFFERING_SET.has(rawCommodityLower)) {
      label = "is offering";
    } else if (REQUIRED_SET.has(rawCommodityLower)) {
      label = "is required";
    } else {
      label = "is offering";
    }

    const commodity = capitalizeWords(rawCommodityLower);

    const copyText = `*Today* ${todayDate}
*${company}* ${label} 
*${commodity}* - *${
      quantity && quantity !== "" ? `${quantity}mt @` : ""
    }${newRate}/-* 
for the *${location}* location 
${payment && payment !== "" ? `*Payment Terms: ${payment} Days*` : ""}${
      others && others !== "" ? `\n*Notes: ${others}*` : ""
    }
(Updated on: ${time}).  

👉 *For rates and orders, please click the link below to participate in the bid.*

📱 *Play Store:* _https://play.google.com/store/apps/details?id=com.hansariafood.agriv2_  
🌐 *Web App:* _https://vupix.in/hfood/auth/index.php_  

*Thanks,*  
*Purchase Team*  
*Hansaria Food Pvt. Ltd.*
`;

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Details copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy text.");
    }
  };

  return {
    handleCopy,
    capitalizeWords,
    capitalizeFirst,
    offeringCommodities,
    requiredCommodities,
  };
}
