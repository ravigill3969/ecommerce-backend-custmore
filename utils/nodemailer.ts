import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "rodger.marvin68@ethereal.email",
    pass: "ynXpMt1NFpD1djc5vP",
  },
});

export async function sendEmail() {
  const info = await transporter.sendMail({
    from: '"Test App 👋" <test@example.com>', // Sender
    to: "recipient@example.com", // Receiver
    subject: "Hello from Ethereal",
    text: "This is a plain text message.",
    html: "<b>This is a test email using Ethereal SMTP</b>",
  });

  console.log("✅ Email sent:", info.messageId);
  console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
}

sendEmail().catch(console.error);
