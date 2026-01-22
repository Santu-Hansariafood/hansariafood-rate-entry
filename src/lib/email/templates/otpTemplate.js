export const getOtpEmailTemplate = (name, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset OTP</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#0f766e; padding:25px; text-align:center;">
              <img src="https://hansariafood.site/logo/logo1.png" alt="Hansaria Food Logo" style="height:60px; margin-bottom:10px;" />
              <h2 style="margin:0; color:#ffffff; font-size:20px; font-weight:600;">
                Hansaria Food Private Limited
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding:35px 30px;">

              <h3 style="margin-top:0; color:#111827; text-align:center;">
                Password Reset Verification
              </h3>

              <p style="color:#374151; font-size:15px; line-height:1.6;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="color:#374151; font-size:15px; line-height:1.6;">
                We received a request to reset your password. Please use the OTP below to continue.
                This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <div style="margin:30px 0; text-align:center;">
                <div style="display:inline-block; padding:15px 35px; border-radius:8px; background:#ecfeff; border:1px dashed #0f766e;">
                  <span style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#0f766e;">
                    ${otp}
                  </span>
                </div>
              </div>

              <p style="color:#6b7280; font-size:13px; text-align:center;">
                If you did not request this, please ignore this email. Your account is safe.
              </p>

            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb; padding:15px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Hansaria Food Private Limited. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
