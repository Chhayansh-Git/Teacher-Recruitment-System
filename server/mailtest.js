import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables from .env file
dotenv.config();

console.log('Using configuration:');
console.log({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '*****' : 'not set'
});

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const info = await transporter.sendMail({
    from: `"Test" <${process.env.EMAIL_FROM}>`,
    to: "test@example.com",
    subject: "Mailtrap Test",
    text: "Hello from Mailtrap!",
    html: "<b>Hello from Mailtrap!</b>"
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);