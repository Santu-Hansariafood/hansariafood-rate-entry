"use client";

import React, { useState, Suspense, useRef } from "react";
import { X, CalendarDays, Download } from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";

import useWeeklyDates from "@/hooks/CompanyViewPopup/useWeeklyDates";
import useGroupedCompanies from "@/hooks/CompanyViewPopup/useGroupedCompanies";

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

  const weekDates = useWeeklyDates(selectedDate);
  const groupedCompanies = useGroupedCompanies(assignedCompanies);

  const handleDownload = async () => {
    if (!downloadRef.current) return;
    setDownloading(true);

    try {
      const container = downloadRef.current;

      container.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        if (/oklch|lab/.test(style.backgroundColor))
          el.style.backgroundColor = "#ffffff";
        if (/oklch|lab/.test(style.color)) el.style.color = "#000000";
        el.style.fontFamily = "Arial, sans-serif";
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const pdf = new jsPDF("landscape", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const topMargin = 20;
      const bottomMargin = 15;
      const usableHeight = pageHeight - topMargin - bottomMargin;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pageWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      const pageHeightPx = (usableHeight * imgHeight) / scaledHeight;

      let renderedHeight = 0;
      let pageNum = 1;

      const drawHeader = () => {
        pdf.setFillColor(216, 255, 216);
        pdf.rect(0, 0, pageWidth, topMargin, "F");
        pdf.setTextColor(200, 0, 0);
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(13);
        pdf.text(`Weekly Rate Sheet - ${userName || "User"}`, 10, 10);
        pdf.setTextColor(20, 20, 20);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(
          `Week: ${format(weekDates[0], "dd MMM yyyy")} - ${format(
            weekDates[6],
            "dd MMM yyyy"
          )}`,
          10,
          16
        );
      };

      const drawFooter = () => {
        pdf.setFontSize(9);
        pdf.setTextColor(120);
        pdf.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 8);
      };

      while (renderedHeight < imgHeight) {
        const partCanvas = document.createElement("canvas");
        const rowHeightPx = 45;
        const rowsPerPage = Math.floor(pageHeightPx / rowHeightPx);
        const adjustedHeight = rowsPerPage * rowHeightPx;

        const sliceHeight = Math.min(
          adjustedHeight,
          imgHeight - renderedHeight
        );

        partCanvas.width = imgWidth;
        partCanvas.height = sliceHeight;

        const ctx = partCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          imgWidth,
          sliceHeight,
          0,
          0,
          imgWidth,
          sliceHeight
        );

        const partImg = partCanvas.toDataURL("image/png");
        if (pageNum > 1) pdf.addPage();

        drawHeader();
        pdf.addImage(
          partImg,
          "PNG",
          0,
          topMargin,
          pageWidth,
          sliceHeight * ratio
        );
        drawFooter();

        renderedHeight += sliceHeight;
        pageNum++;
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
            className="overflow-x-auto border rounded-md p-4 bg-white text-black text-xs"
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Weekly Rate Sheet for {userName || "User"}
            </h2>
            <p className="mb-4 text-sm text-center text-gray-600">
              Week: {format(weekDates[0], "dd MMM yyyy")} -{" "}
              {format(weekDates[6], "dd MMM yyyy")}
            </p>

            {groupedCompanies.map((company, idx) => (
              <div key={idx} className="mb-6 break-inside-avoid">
                <div className="text-right text-sm font-medium text-blue-700 mb-1">
                  {company.locations.length === 0 ? company.name : null}
                </div>

                {company.locations.length > 0 && (
                  <>
                    <div className="text-right text-sm font-semibold text-green-700 mb-2">
                      {company.name}
                    </div>
                    <table className="min-w-full table-auto border-collapse text-[10px]">
                      <thead className="bg-green-100 text-green-800">
                        <tr>
                          <th className="border px-2 py-1 text-left">
                            Location
                          </th>
                          {weekDates.map((date, i) => (
                            <th
                              key={i}
                              className="border px-2 py-1 text-center"
                            >
                              {format(date, "EEE dd")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {company.locations.map((location, locIdx) => (
                          <tr key={`${idx}-${locIdx}`}>
                            <td className="border px-2 py-1 text-yellow-800 font-medium bg-yellow-50">
                              {location}
                            </td>
                            {weekDates.map((_, i) => (
                              <td
                                key={i}
                                className="border px-2 py-1 text-center"
                              >
                                <div className="w-5 h-5 border border-dashed rounded mx-auto" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
