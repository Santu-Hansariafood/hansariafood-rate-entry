const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const capitalizeWords = (str) =>
  String(str ?? "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

export const generateRateReportEmailTemplate = ({
  company = "Hansaria Food",
  date = "",
  time = "",
  rates = [],
}) => {
  let tableRows = "";
  let slNo = 1;

  const uniqueLocations = new Set();

  rates.forEach((rate) => {
    const location = String(rate.location || "").trim();
    if (location) uniqueLocations.add(location.toLowerCase());

    tableRows += `
      <tr>
        <td style="padding: 14px 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">${slNo++}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(capitalizeWords(rate.company))}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(rate.location || "-")}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(rate.commodity || "-")}</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(rate.mobile || "-")}</td>
        <td style="padding: 14px 10px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${formatCurrency(rate.rate)}</td>
      </tr>
    `;
  });

  const locationCount = uniqueLocations.size;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Rate Report - ${escapeHtml(date)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          color: #1a202c;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          line-height: 1.6;
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container { width: 100%; max-width: 1000px; margin: 0 auto; }
        .email-wrapper {
          background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
          color: white;
          padding: 46px 40px;
          text-align: center;
        }
        .header h1 { font-size: 34px; font-weight: 800; margin-bottom: 10px; letter-spacing: 0.5px; }
        .header p { font-size: 17px; opacity: 0.95; font-weight: 500; }
        .header .date-pill {
          display: inline-block;
          margin-top: 18px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .content { padding: 40px; }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 11px 22px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 26px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .status-badge svg { width: 17px; height: 17px; }
        .summary {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 28px;
        }
        .summary-card {
          flex: 1 1 160px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 4px solid #0ea5e9;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
        }
        .summary-card .label {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #0369a1;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .summary-card .value { font-size: 20px; font-weight: 800; color: #0c4a6e; }
        .table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          margin-bottom: 28px;
        }
        .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table { width: 100%; min-width: 760px; border-collapse: collapse; font-size: 14px; }
        th {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }
        td { color: #374151; font-size: 14px; white-space: nowrap; }
        tbody tr:nth-child(even) { background-color: #f9fafb; }
        .footer {
          margin-top: 40px;
          padding-top: 26px;
          border-top: 2px solid #e5e7eb;
          text-align: right;
        }
        .footer p { font-size: 14px; color: #6b7280; line-height: 2; }
        .company-signature { margin-top: 18px; font-size: 16px; color: #1f2937; font-weight: 700; }
        .company-name { margin-top: 8px; font-size: 13px; color: #4b5563; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <h1>${escapeHtml(company)}</h1>
            <p>Daily Rate Report</p>
            <span class="date-pill">${escapeHtml(date)}</span>
          </div>

          <div class="content">
            <div class="status-badge">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Today's Rates
            </div>

            <div class="summary">
              <div class="summary-card">
                <span class="label">Total Rates</span>
                <span class="value">${rates.length}</span>
              </div>
              <div class="summary-card">
                <span class="label">Locations</span>
                <span class="value">${locationCount}</span>
              </div>
              <div class="summary-card">
                <span class="label">Generated At</span>
                <span class="value" style="font-size: 16px;">${escapeHtml(time || "")}</span>
              </div>
            </div>

            <div class="table-container">
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style="text-align: center;">Sl No</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Commodity</th>
                      <th>Mobile</th>
                      <th style="text-align: right;">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows || '<tr><td colspan="6" style="text-align:center; padding: 60px 20px; color: #6b7280; font-size: 16px; font-weight: 500;">No rates updated today</td></tr>'}
                  </tbody>
                </table>
              </div>
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
