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

  // Create watermark layer
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

  // Wrap the container temporarily for rendering
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = container.offsetWidth + "px";
  wrapper.style.background = "white";
  wrapper.appendChild(watermarkDiv);
  wrapper.appendChild(container.cloneNode(true));

  document.body.appendChild(wrapper);

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
