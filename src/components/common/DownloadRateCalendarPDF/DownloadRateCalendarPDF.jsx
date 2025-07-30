"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { CalendarDays } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DownloadRateCalendarPDF = ({ rateData, selectedCompany, selectedCommodity }) => {
  const pdfRefs = useRef({});

  const getRatesForDate = (calendarDate, company, location, commodity) => {
    const dateStr = calendarDate.toLocaleDateString("en-GB");
    const entry = rateData.find(
      (d) => d.company === company && d.location === location && d.commodity === commodity
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

  for (let i = 0; i < entries.length; i++) {
    const { location, commodity } = entries[i];
    const key = `${location}-${commodity}`;
    const input = pdfRefs.current[key];
    if (!input) continue;

    const canvas = await html2canvas(input, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (i !== 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(`RateCalendar-${selectedCompany}-${selectedCommodity}.pdf`);
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
          padding: "8px 16px",
          borderRadius: "6px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <CalendarDays size={18} /> Download Calendar PDF
      </button>

      {entries.map(({ company, location, commodity }) => {
        const key = `${location}-${commodity}`;
        return (
          <div
            key={key}
            ref={(el) => (pdfRefs.current[key] = el)}
            style={{
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              {company} - {location} ({commodity})
            </h3>
            <Calendar
              value={new Date()}
              tileContent={({ date }) => {
                const info = getRatesForDate(date, company, location, commodity);
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
