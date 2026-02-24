export const generatePasswordExpiryEmailTemplate = (name, daysRemaining) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #d9534f; text-align: center;">Password Expiry Notice</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>This is a reminder that your password for <strong>Hansaria Food</strong> will expire in <strong>${daysRemaining} day${daysRemaining > 1 ? "s" : ""}</strong>.</p>
      <p>To continue using the application securely, you are required to reset your password within the next few days. If your password expires, you will be locked out and forced to reset it before you can log in again.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.hansariafood.site/resetpassword" 
           style="background-color: #0275d8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
           Reset Password Now
        </a>
      </div>
      <p style="color: #777; font-size: 12px; text-align: center;">
        If you have already reset your password, please ignore this email.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="text-align: center; color: #999; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Hansaria Food Private Limited. All rights reserved.
      </p>
    </div>
  `;
};
