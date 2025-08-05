"use client";

import React, { useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import Loading from "@/components/common/Loading/Loading";

import useWeeklyDates from "@/hooks/CompanyViewPopup/useWeeklyDates";
import useGroupedCompanies from "@/hooks/CompanyViewPopup/useGroupedCompanies";
const PopupWrapper = dynamic(() => import("./PopupWrapper/PopupWrapper"));
const PopupHeader = dynamic(() => import("./PopupHeader/PopupHeader"));
const PopupActions = dynamic(() => import("./PopupActions/PopupActions"));
const DownloadableContent = dynamic(() =>
  import("./DownloadableContent/DownloadableContent")
);

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

      await new Promise((r) => setTimeout(r, 300));

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
      <PopupWrapper>
        <PopupHeader onClose={onClose} userName={userName} />
        <PopupActions
          weekDates={weekDates}
          downloading={downloading}
          onDownload={handleDownload}
        />
        <DownloadableContent
          refObj={downloadRef}
          weekDates={weekDates}
          groupedCompanies={groupedCompanies}
          userName={userName}
        />
      </PopupWrapper>
    </Suspense>
  );
}
