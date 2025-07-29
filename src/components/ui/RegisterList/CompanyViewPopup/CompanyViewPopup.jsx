"use client";

import React, { useState, useMemo, Suspense, useRef } from "react";
import { X, CalendarDays, Download } from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { format, startOfWeek, addDays } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function CompanyViewPopup({
  open,
  onClose,
  assignedCompanies = [],
  userName,
}) {
  const [selectedDate] = useState(new Date());
  const [downloading, setDownloading] = useState(false);
  const downloadRef = useRef();

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const validCompanies = assignedCompanies.filter(
    (company) => company?.companyId?.name
  );

  const groupedCompanies = useMemo(() => {
    return validCompanies.map((company) => ({
      name: company.companyId.name,
      locations: company.locations || [],
    }));
  }, [validCompanies]);

  const handleDownload = async () => {
    if (!downloadRef.current) return;
    setDownloading(true);

    try {
      const container = downloadRef.current;

      container.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor.includes("oklch")) {
          el.style.backgroundColor = "#ffffff";
        }
        if (style.color.includes("oklch")) {
          el.style.color = "#000000";
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Weekly_Rate_Sheet_${userName || "User"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
        <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
          >
            <X />
          </button>

          <Title text={`Weekly Rate Sheet for ${userName || "User"}`} />

          <div className="flex justify-between items-center mt-4 mb-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Week: {format(weekDates[0], "dd MMM yyyy")} -{" "}
                {format(weekDates[6], "dd MMM yyyy")}
              </span>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? "Generating..." : "Download"}
            </button>
          </div>

          <div
            ref={downloadRef}
            className="overflow-x-auto border rounded-md p-4 bg-white text-black"
          >
            <h2 className="text-lg font-semibold mb-4">
              Weekly Rate Sheet for {userName || "User"}
            </h2>
            <p className="mb-2 text-sm text-gray-600">
              Week: {format(weekDates[0], "dd MMM yyyy")} -{" "}
              {format(weekDates[6], "dd MMM yyyy")}
            </p>

            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Company</th>
                  <th className="border px-3 py-2 text-left">Location</th>
                  {weekDates.map((date, idx) => (
                    <th key={idx} className="border px-3 py-2 text-center">
                      {format(date, "EEE dd")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedCompanies.map((company, idx) =>
                  company.locations.map((location, locIdx) => (
                    <tr key={`${idx}-${locIdx}`}>
                      {locIdx === 0 && (
                        <td
                          className="border px-3 py-2 font-semibold text-blue-700"
                          rowSpan={company.locations.length}
                        >
                          {company.name}
                        </td>
                      )}
                      <td className="border px-3 py-2">{location}</td>
                      {weekDates.map((_, i) => (
                        <td
                          key={i}
                          className="border px-3 py-4 text-center text-gray-400"
                        >
                          <div className="w-6 h-6 border border-dashed rounded-md mx-auto" />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
