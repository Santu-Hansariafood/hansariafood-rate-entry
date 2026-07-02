export const generateSaudaEmailTemplate = ({
  company,
  date,
  time,
  saudaEntries,
  userEmail,
  userName,
}) => {
  let tableRows = "";
  let slNo = 1;
  let totalTons = 0;
  let totalValue = 0;

  const entriesList = [];
  const formatSaudaNo = (value) =>
    value ? value.toString().split("-").pop() : "-";

  if (saudaEntries instanceof Map) {
    for (const [key, list] of saudaEntries.entries()) {
      if (Array.isArray(list)) {
        entriesList.push(...list);
      }
    }
  } else if (typeof saudaEntries === "object") {
    for (const [key, list] of Object.entries(saudaEntries)) {
      if (Array.isArray(list)) {
        entriesList.push(...list);
      }
    }
  }

  entriesList.forEach((entry) => {
    const tons = Number(entry.tons) || 0;
    const rate = Number(entry.finalRate) || 0;

    if (tons <= 0 && rate <= 0) return;

    totalTons += tons;
    const itemValue = tons * rate;
    totalValue += itemValue;

    tableRows += `
      <tr>
        <td style="padding: 14px 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">${slNo++}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${entry.unit || "-"}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${entry.commodity || "-"}</td>
        <td style="padding: 14px 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${rate.toFixed(2)}</td>
        <td style="padding: 14px 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${tons.toFixed(3)}</td>
        <td style="padding: 14px 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${itemValue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${entry.sellerCompany || "-"}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${entry.deliveryDate || "-"}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${entry.others || "-"}</td>
        <td style="padding: 14px 10px; text-align: center; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${formatSaudaNo(entry.saudaNo)}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Sauda Report - ${date}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          color: #1a202c;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          line-height: 1.6;
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }
        .email-wrapper {
          background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
          color: white;
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .header h1 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header p {
          font-size: 18px;
          opacity: 0.95;
          font-weight: 500;
        }
        .content {
          padding: 45px 40px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .status-badge svg {
          width: 18px;
          height: 18px;
        }
        .info-bar {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 5px solid #0ea5e9;
          padding: 20px 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
        }
        .info-bar p {
          font-size: 15px;
          color: #0369a1;
          margin: 0;
        }
        .info-bar strong {
          color: #0c4a6e;
          font-weight: 700;
        }
        .meta-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }
        .meta-item {
          font-size: 15px;
          color: #92400e;
        }
        .meta-item strong {
          color: #78350f;
          font-weight: 700;
          font-size: 16px;
        }
        .table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }
        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        table {
          width: 100%;
          min-width: 1200px;
          border-collapse: collapse;
          font-size: 14px;
        }
        th {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 16px 12px;
          text-align: left;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }
        td {
          color: #374151;
          font-size: 14px;
          white-space: nowrap;
        }
        tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tbody tr:hover {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }
        .total-row {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
        }
        .total-row td {
          padding: 20px 12px;
          font-size: 16px;
          color: white;
          font-weight: 700;
          border-top: 3px solid #1e40af;
        }
        .footer {
          margin-top: 45px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
          text-align: right;
        }
        .footer p {
          font-size: 14px;
          color: #6b7280;
          line-height: 2;
        }
        .company-signature {
          margin-top: 20px;
          font-size: 16px;
          color: #1f2937;
          font-weight: 700;
        }
        .company-name {
          margin-top: 8px;
          font-size: 13px;
          color: #4b5563;
          font-weight: 600;
        }
        .scroll-hint {
          display: none;
          text-align: center;
          padding: 12px;
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          border-radius: 0 0 16px 16px;
        }
        @media (max-width: 1000px) {
          .scroll-hint {
            display: block;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="header-content">
              <h1>${company}</h1>
              <p>Daily Sauda Report</p>
            </div>
          </div>
          
          <div class="content">
            <div class="status-badge">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Sauda Confirmed
            </div>
            
            <div class="info-bar">
              <p><strong>Confirmed by:</strong> ${userName || userEmail || "Unknown"}</p>
            </div>

            <div class="meta-section">
              <div class="meta-item">
                <strong>Date:</strong> ${date}
              </div>
              <div class="meta-item">
                <strong>Time:</strong> ${time || new Date().toLocaleTimeString()}
              </div>
            </div>

            <div class="table-container">
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style="text-align: center;">Sl No</th>
                      <th>Unit</th>
                      <th>Commodity</th>
                      <th style="text-align: right;">Rate</th>
                      <th style="text-align: right;">Tons</th>
                      <th style="text-align: right;">Total Value</th>
                      <th>Seller Company</th>
                      <th>Delivery</th>
                      <th>Remarks</th>
                      <th style="text-align: center;">Sauda No</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows || '<tr><td colspan="11" style="text-align:center; padding: 60px 20px; color: #6b7280; font-size: 16px; font-weight: 500;">No entries found</td></tr>'}
                  </tbody>
                  <tfoot>
                    <tr class="total-row">
                      <td colspan="4" style="text-align: right;">Total:</td>
                      <td style="text-align: right;">${totalTons.toFixed(3)} Tons</td>
                      <td style="text-align: right;">${totalValue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
                      <td colspan="5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div class="scroll-hint">← Scroll horizontally to view all columns →</div>
            </div>

            <div class="footer">
              <p>Thanks and Regards,</p>
              <p class="company-signature">Purchase Team</p>
              <p class="company-name">Hansaria Food Private Limited</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
