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
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; text-align: center; border-right: 1px solid #e5e7eb;">${slNo++}</td>
        <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${entry.unit || "-"}</td>
        <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${entry.commodity || "-"}</td>
        <td style="padding: 12px 8px; text-align: right; border-right: 1px solid #e5e7eb;">₹${rate.toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; border-right: 1px solid #e5e7eb;">${tons.toFixed(3)}</td>
        <td style="padding: 12px 8px; text-align: right; border-right: 1px solid #e5e7eb;">${itemValue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
        <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${entry.sellerCompany || "-"}</td>
        <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${entry.sellerName || "-"}</td>
        <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${entry.deliveryDate || "-"}</td>
        <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${entry.others || "-"}</td>
        <td style="padding: 12px 8px; text-align: center; font-weight: 600;">${formatSaudaNo(entry.saudaNo)}</td>
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1f2937;
          background-color: #f9fafb;
          line-height: 1.6;
        }
        .container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        .email-wrapper {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 35px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 500;
        }
        .content {
          padding: 35px 30px;
        }
        .info-bar {
          background-color: #f3f4f6;
          border-left: 4px solid #3b82f6;
          padding: 16px 20px;
          border-radius: 0 6px 6px 0;
          margin-bottom: 25px;
        }
        .info-bar p {
          font-size: 14px;
          color: #374151;
          margin: 0;
        }
        .info-bar strong {
          color: #1f2937;
          font-weight: 600;
        }
        .meta-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          padding: 18px 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        .meta-item {
          font-size: 14px;
          color: #4b5563;
        }
        .meta-item strong {
          color: #1f2937;
          font-weight: 600;
          font-size: 15px;
        }
        .status-badge {
          display: inline-block;
          background-color: #dcfce7;
          color: #166534;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 13px;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          color: white;
          padding: 14px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-right: 1px solid #4b5563;
        }
        th:last-child {
          border-right: none;
        }
        td {
          color: #374151;
          font-size: 13px;
        }
        tbody tr:hover {
          background-color: #f9fafb;
        }
        .total-row {
          font-weight: 700;
          background-color: #f3f4f6;
          border-top: 2px solid #d1d5db;
        }
        .total-row td {
          padding: 16px 10px;
          font-size: 14px;
          color: #1f2937;
        }
        .footer {
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid #e5e7eb;
          text-align: right;
        }
        .footer p {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.8;
        }
        .footer strong {
          color: #1f2937;
          font-weight: 600;
        }
        .company-signature {
          margin-top: 15px;
          font-size: 14px;
          color: #1f2937;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <h1>${company}</h1>
            <p>Daily Sauda Report</p>
          </div>
          
          <div class="content">
            <div class="status-badge">✓ Sauda Confirmed</div>
            
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
                  <th>Seller Name</th>
                  <th>Delivery</th>
                  <th>Remarks</th>
                  <th style="text-align: center;">Sauda No</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="11" style="text-align:center; padding: 40px; color: #6b7280; font-size: 14px;">No entries found</td></tr>'}
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

            <div class="footer">
              <p>Thanks and Regards,</p>
              <p class="company-signature">Purchase Team</p>
              <p style="margin-top: 8px; font-size: 12px;">Hansaria Food Private Limited</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
