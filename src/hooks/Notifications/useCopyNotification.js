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
    "mix ddgs",
    "ddgs",
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
      "en-IN",
    );

    const time = `${datePart}, ${updateTime || "N/A"}`;

    const rawCommodityLower = normalize(notification.commodity || "N/A");

    let label = "";

    if (OFFERING_SET.has(rawCommodityLower)) {
      label = "की पेशकश कर रही है";
    } else if (REQUIRED_SET.has(rawCommodityLower)) {
      label = "की आवश्यकता है";
    } else {
      label = "की पेशकश कर रही है";
    }

    const commodity = capitalizeWords(rawCommodityLower);

    const copyText = `🌅🙏 *छठ पूजा की हार्दिक शुभकामनाएँ!* 🙏🌅

*Hansaria Food Private Limited* की ओर से हमारे सभी सम्मानित Buyers, Sellers एवं Business Partners को छठ महापर्व की हार्दिक बधाई एवं शुभकामनाएँ!

छठी मैया और भगवान सूर्य देव की कृपा से आपके जीवन में सुख, शांति, समृद्धि, उत्तम स्वास्थ्य एवं सफलता बनी रहे।

आपका व्यापार निरंतर उन्नति करे और हमारे व्यावसायिक संबंध विश्वास एवं सहयोग के साथ और मजबूत हों।


*आज की तारीख:* ${todayDate}

*${company}* ${label}

*${commodity}* - *${
      quantity && quantity !== "" ? `${quantity} MT @` : ""
    }${newRate}/-*

*स्थान:* ${location}

${payment && payment !== "" ? `*Payment Terms: ${payment}*` : ""}${
      others && others !== "" ? `\n*Notes: ${others}*` : ""
    }

(Updated on: ${time}).

👉 *Rates एवं Orders की जानकारी प्राप्त करने और Bid में भाग लेने के लिए नीचे दिए गए लिंक पर क्लिक करें।*

📱 *Play Store:* _https://play.google.com/store/apps/details?id=com.hansariafood.bid_
🌐 *Web App:* _https://bid.hansariafood.in/manage-order/list-self-order_


🌞 *आइए, इस छठ पूजा के पावन अवसर पर नई उम्मीदों, मजबूत व्यावसायिक रिश्तों और सफलता की नई ऊँचाइयों का स्वागत करें।*

*सादर धन्यवाद एवं शुभकामनाओं सहित,*

*Purchase Team*
*Hansaria Food Pvt. Ltd.*

🌅🙏 *छठ पूजा की हार्दिक शुभकामनाएँ!* 🙏🌅
`;

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("🌅 छठ पूजा की शुभकामनाएँ और Bid Details कॉपी हो गईं!");
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
