export const generateDeletedSaudaEmailTemplate = ({
  company,
  date,
  time,
  saudaEntry,
  reason,
  userName,
  userEmail,
  userMobile,
}) => {
  const formatSaudaNo = (value) =>
    value ? value.toString().slice(-4) : "-";

  const {
    saudaNo,
    unit,
    commodity,
    tons,
    finalRate,
    sellerName,
    sellerCompany,
    deliveryDate,
    others,
  } = saudaEntry || {};

  const deleterLabel =
    userName || userEmail || userMobile || "Unknown user";

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sauda Deleted Notification</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      }
      .container {
        max-width: 640px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      }
      .header {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .title {
        margin: 0;
        font-size: 20px;
        color: #b91c1c;
      }
      .subtitle {
        margin: 4px 0 0;
        color: #4b5563;
        font-size: 14px;
      }
      .section-title {
        font-size: 16px;
        margin: 16px 0 8px;
        color: #111827;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 16px;
        font-size: 14px;
      }
      .details-grid p {
        margin: 0;
      }
      .label {
        font-weight: 600;
        color: #374151;
      }
      .value {
        color: #111827;
      }
      .reason {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        font-size: 14px;
        color: #991b1b;
      }
      .footer {
        margin-top: 24px;
        font-size: 12px;
        color: #6b7280;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="title">Sauda Deleted</h1>
        <p class="subtitle">
          A sauda entry has been deleted for <strong>${company}</strong>.
        </p>
      </div>

      <h2 class="section-title">Deletion Details</h2>
      <div class="details-grid">
        <p><span class="label">Date:</span> <span class="value">${date}</span></p>
        <p><span class="label">Time:</span> <span class="value">${time}</span></p>
        <p><span class="label">Deleted By:</span> <span class="value">${deleterLabel}</span></p>
        ${
          userMobile
            ? `<p><span class="label">User Mobile:</span> <span class="value">${userMobile}</span></p>`
            : ""
        }
        ${
          userEmail
            ? `<p><span class="label">User Email:</span> <span class="value">${userEmail}</span></p>`
            : ""
        }
      </div>

      <div class="reason">
        <strong>Reason:</strong>
        <span>${reason || "-"}</span>
      </div>

      <h2 class="section-title">Sauda Details</h2>
      <div class="details-grid">
        <p><span class="label">Sauda No:</span> <span class="value">${formatSaudaNo(
          saudaNo
        )}</span></p>
        <p><span class="label">Company:</span> <span class="value">${company}</span></p>
        <p><span class="label">Unit:</span> <span class="value">${unit || "-"}</span></p>
        <p><span class="label">Commodity:</span> <span class="value">${
          commodity || "-"
        }</span></p>
        <p><span class="label">Tons:</span> <span class="value">${
          typeof tons === "number" ? tons : "-"
        }</span></p>
        <p><span class="label">Rate:</span> <span class="value">₹${
          typeof finalRate === "number" ? finalRate : "-"
        }</span></p>
        <p><span class="label">Seller Name:</span> <span class="value">${
          sellerName || "-"
        }</span></p>
        <p><span class="label">Seller Company:</span> <span class="value">${
          sellerCompany || "-"
        }</span></p>
        <p><span class="label">Delivery Date:</span> <span class="value">${
          deliveryDate || "-"
        }</span></p>
        <p><span class="label">Notes:</span> <span class="value">${
          others || "-"
        }</span></p>
      </div>

      <div class="footer">
        <p>
          This is an automated notification sent to admin emails configured in
          the system.
        </p>
      </div>
    </div>
  </body>
</html>
`;
};

