import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportWithWatermarkToPDF = async (containerId, watermarkUrl) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Sanitize unsupported colors
  const sanitizeOKLCH = (el) => {
    const elements = el.querySelectorAll("*");
    elements.forEach((node) => {
      const style = getComputedStyle(node);
      ["color", "backgroundColor", "borderColor"].forEach((prop) => {
        const val = style[prop];
        if (val.includes("oklch")) {
          node.style[prop] = "transparent";
        }
      });
    });
  };

  sanitizeOKLCH(container);

  // Clone container and force layout preservation
  const clone = container.cloneNode(true);
  clone.style.padding = "20px"; // optional to match original
  clone.style.backgroundColor = "white";

  // Watermark
  const watermarkDiv = document.createElement("div");
  watermarkDiv.style.position = "absolute";
  watermarkDiv.style.top = "50%";
  watermarkDiv.style.left = "50%";
  watermarkDiv.style.transform = "translate(-50%, -50%) rotate(-30deg)";
  watermarkDiv.style.backgroundImage = `url('${watermarkUrl}')`;
  watermarkDiv.style.backgroundRepeat = "no-repeat";
  watermarkDiv.style.backgroundSize = "300px 300px";
  watermarkDiv.style.opacity = "0.1";
  watermarkDiv.style.width = "100%";
  watermarkDiv.style.height = "100%";
  watermarkDiv.style.pointerEvents = "none";
  watermarkDiv.style.zIndex = "0";

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "-9999px"; // hide offscreen
  wrapper.style.left = "-9999px";
  wrapper.style.width = container.offsetWidth + "px";
  wrapper.style.backgroundColor = "white";
  wrapper.appendChild(watermarkDiv);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Wait for layout/render
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Render to canvas
  const canvas = await html2canvas(wrapper, {
    scale: 2,
    useCORS: true,
    imageTimeout: 15000,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("sauda-summary.pdf");

  wrapper.remove();
};
