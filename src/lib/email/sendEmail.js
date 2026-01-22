import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html, attachments }) {
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
    from: `"Hansaria Food" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  };

  await transporter.sendMail(mailOptions);
}
