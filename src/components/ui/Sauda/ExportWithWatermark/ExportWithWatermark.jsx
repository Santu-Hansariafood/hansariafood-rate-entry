"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const ExportWithWatermark = {
  async toImage(containerId, watermarkUrl) {
    const node = document.getElementById(containerId);
    const canvas = await html2canvas(node, {
      backgroundColor: null,
    });
    const context = canvas.getContext("2d");
    const watermark = await loadImage(watermarkUrl);

    const scale = 0.25;
    const x = canvas.width - watermark.width * scale - 20;
    const y = canvas.height - watermark.height * scale - 20;
    context.globalAlpha = 0.15;
    context.drawImage(watermark, x, y, watermark.width * scale, watermark.height * scale);
    const link = document.createElement("a");
    link.download = "sauda-summary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  },

  async toPDF(containerId, watermarkUrl) {
    const node = document.getElementById(containerId);
    const canvas = await html2canvas(node, {
      backgroundColor: "#fff",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const watermark = await loadImage(watermarkUrl);
    const wmWidth = 40;
    const wmHeight = (watermark.height / watermark.width) * wmWidth;

    pdf.setGState(new pdf.GState({ opacity: 0.2 }));
    pdf.addImage(watermark, "PNG", pdfWidth - wmWidth - 10, pdfHeight - wmHeight - 10, wmWidth, wmHeight);
    pdf.save("sauda-summary.pdf");
  },
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
}
