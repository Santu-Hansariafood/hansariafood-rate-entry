"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { CalendarDays } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DownloadRateCalendarPDF = ({
  rateData,
  selectedCompany,
  selectedCommodity,
}) => {
  const pdfRefs = useRef({});

  const getRatesForDate = (calendarDate, company, location, commodity) => {
    const dateStr = calendarDate.toLocaleDateString("en-GB");
    const entry = rateData.find(
      (d) =>
        d.company === company &&
        d.location === location &&
        d.commodity === commodity
    );
    if (!entry) return { rate: "-", type: "none" };

    const oldMatch = entry.oldRates?.find((str) => str.includes(dateStr));
    if (oldMatch) {
      const rate = oldMatch.split(" ")[0];
      return { rate: `₹${rate}`, type: "old" };
    }

    const isNew =
      entry.lastUpdated &&
      new Date(entry.lastUpdated).toLocaleDateString("en-GB") === dateStr;
    if (isNew && entry.newRate) {
      return { rate: `₹${entry.newRate}`, type: "new" };
    }
    return { rate: "-", type: "none" };
  };

  const handleDownload = async () => {
    const entries = rateData.filter(
      (d) => d.company === selectedCompany && d.commodity === selectedCommodity
    );

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < entries.length; i++) {
      const { location, commodity } = entries[i];
      const key = `${location}-${commodity}`;
      const input = pdfRefs.current[key];
      if (!input) continue;

      if (i !== 0) pdf.addPage();

      const logo = await loadImage("/logo/logo1.png");
      if (logo) {
        pdf.addImage(logo, "PNG", 10, 10, 30, 20);
      }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor("#1f2937");
      pdf.text("Rate Calendar", pageWidth - 70, 22);
      pdf.setDrawColor("#e5e7eb");
      pdf.setLineWidth(0.5);
      pdf.line(10, 32, pageWidth - 10, 32);

      const canvas = await html2canvas(input, { useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pageWidth - 20;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 10, 35, contentWidth, contentHeight);

      const footerY = pageHeight - 20;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#2563eb");
      pdf.text("Thanks and Regards,", pageWidth - 70, footerY);
      pdf.text("Purchase Team", pageWidth - 70, footerY + 8);
      pdf.text("Hansaria Food Pvt. Ltd.", pageWidth - 70, footerY + 16);
    }

    pdf.save(`RateCalendar-${selectedCompany}-${selectedCommodity}.pdf`);
  };

  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const entries = rateData.filter(
    (d) => d.company === selectedCompany && d.commodity === selectedCommodity
  );

  return (
    <div className="my-4">
      <button
        onClick={handleDownload}
        style={{
          backgroundColor: "#16a34a",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <CalendarDays size={18} /> Download
      </button>

      {entries.map(({ company, location, commodity }) => {
        const key = `${location}-${commodity}`;
        return (
          <div
            key={key}
            ref={(el) => (pdfRefs.current[key] = el)}
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              boxShadow: "0 0 12px rgba(0,0,0,0.15)",
              fontFamily: "Segoe UI, sans-serif",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "#1f2937",
              }}
            >
              {company} - {location} ({commodity})
            </h3>
            <Calendar
              value={new Date()}
              tileContent={({ date }) => {
                const info = getRatesForDate(
                  date,
                  company,
                  location,
                  commodity
                );
                const bg =
                  info.type === "new"
                    ? "#16a34a"
                    : info.type === "old"
                    ? "#facc15"
                    : "transparent";
                const color = info.type === "new" ? "#fff" : "#000";

                return (
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "10px",
                      backgroundColor: bg,
                      color,
                      padding: "2px 4px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    {info.rate !== "-" ? info.rate : null}
                  </div>
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DownloadRateCalendarPDF;
