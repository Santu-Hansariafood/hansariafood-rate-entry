
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
  let summaryBlock = "";

  const entriesList = [];
  const formatSaudaNo = (value) =>
    value ? value.toString().split("-").pop() : "-";
  
  if (saudaEntries instanceof Map) {
      for (const [key, list] of saudaEntries.entries()) {
          if (Array.isArray(list)) {
              entriesList.push(...list);
          }
      }
  } else if (typeof saudaEntries === 'object') {
       for (const [key, list] of Object.entries(saudaEntries)) {
          if (Array.isArray(list)) {
              entriesList.push(...list);
          }
      }
  }

  entriesList.forEach((entry) => {
    const tons = Number(entry.tons) || 0;
    const rate = Number(entry.finalRate) || 0;
    const value = tons * rate * 1000;
    
    if (tons <= 0 && rate <= 0) return;

    totalTons += tons;
    const itemValue = tons * rate; 
    totalValue += itemValue;

    summaryBlock += `
      <div style="background-color: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="color: #166534; margin: 0 0 10px 0;">✅ Sauda Confirmed</h3>
        <p style="margin: 0 0 10px 0; font-weight: bold;">Sauda details are as follows:</p>
        <div style="display: grid; gap: 5px; font-size: 14px;">
           <p style="margin: 2px 0;"><strong>Date:</strong> ${date}</p>
           <p style="margin: 2px 0;"><strong>Location:</strong> ${entry.unit || "-"}</p>
           <p style="margin: 2px 0;"><strong>Commodity:</strong> ${entry.commodity || "-"}</p>
           <p style="margin: 2px 0;"><strong>Tons:</strong> ${tons}</p>
           <p style="margin: 2px 0;"><strong>Rate:</strong> ₹${rate}</p>
           <p style="margin: 2px 0;"><strong>Sauda No:</strong> ${formatSaudaNo(entry.saudaNo)}</p>
           <p style="margin: 2px 0;"><strong>Buyer:</strong> ${company || "-"}</p>
           <p style="margin: 2px 0;"><strong>Seller Company:</strong> ${entry.sellerCompany || "-"}</p>
           <p style="margin: 2px 0;"><strong>Delivery Date:</strong> ${entry.deliveryDate || "-"}</p>
           <p style="margin: 2px 0;"><strong>Notes:</strong> ${entry.others || "-"}</p>
        </div>
      </div>
    `;

    tableRows += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; text-align: center;">${slNo++}</td>
        <td style="padding: 8px;">${entry.unit || "-"}</td>
        <td style="padding: 8px;">${entry.commodity || "-"}</td>
        <td style="padding: 8px; text-align: right;">${rate.toFixed(2)}</td>
        <td style="padding: 8px; text-align: right;">${tons.toFixed(3)}</td>
        <td style="padding: 8px; text-align: right;">${itemValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
        <td style="padding: 8px;">${entry.sellerCompany || "-"}</td>
        <td style="padding: 8px;">${entry.sellerName || "-"}</td>
        <td style="padding: 8px;">${entry.deliveryDate || "-"}</td>
        <td style="padding: 8px;">${entry.others || "-"}</td>
        <td style="padding: 8px; text-align: center; color: #dc2626;">${formatSaudaNo(entry.saudaNo)}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { width: 100%; max-width: 900px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { border: 1px solid #ddd; padding: 20px; border-top: none; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background-color: #4b5563; color: white; padding: 10px; text-align: left; }
        .total-row { font-weight: bold; background-color: #f3f4f6; }
        .footer { margin-top: 30px; text-align: right; font-style: italic; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${company}</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Daily Sauda Report</p>
        </div>
        
        <div class="content">
          ${summaryBlock}

          <div style="margin-top: 20px; padding: 10px; background-color: #eff6ff; border-radius: 4px;">
             <p style="margin: 0; font-size: 14px;"><strong>Sauda confirmed by:</strong> ${userName || userEmail || "Unknown"}</p>
          </div>

          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #ddd;">

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time || new Date().toLocaleTimeString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">Sl</th>
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
              ${tableRows || '<tr><td colspan="11" style="text-align:center; padding: 20px;">No entries found</td></tr>'}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4" style="text-align: right; padding: 10px;">Total:</td>
                <td style="text-align: right; padding: 10px;">${totalTons.toFixed(3)} Tons</td>
                <td style="text-align: right; padding: 10px;">${totalValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td colspan="5"></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>Thanks and Regards,<br>Purchase Team<br>Hansaria Food Private Limited</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
