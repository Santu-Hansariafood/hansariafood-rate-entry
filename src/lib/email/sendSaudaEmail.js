import nodemailer from "nodemailer";

const DEFAULT_RECIPIENT = "gopal@hansariafood.com";

export async function sendSaudaEmail({ to, buffer, filename, html, subject }) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "santu@hansariafood.com",
    to: to || DEFAULT_RECIPIENT,
    subject: subject || "Sauda Report",
    text: "Please find attached the Sauda Report Excel file.",
    html,
    attachments: [
      {
        filename,
        content: buffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
