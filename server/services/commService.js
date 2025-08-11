// server/services/commService.js

import dotenv from "dotenv";
dotenv.config();
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import createError from "http-errors";
import { EmailTemplate } from "../models/emailTemplate.js";
import logger from "../utils/logger.js";

if (!process.env.SENDGRID_API_KEY) {
  logger.error("✖ SENDGRID_API_KEY is missing in .env");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const smtpMailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Compile {{placeholders}}
function compileTemplate(templateString = "", variables = {}) {
  return templateString.replace(/{{\s*([\w]+)\s*}}/g, (_, key) =>
    variables[key] != null ? variables[key] : ""
  );
}

// Send templated email using DB template
export async function sendEmail(templateKey, to, variables = {}) {
  const template = await EmailTemplate.findOne({ key: templateKey });
  if (!template) {
    logger.error(`✖ Template [${templateKey}] not found. Admin must (re-)seed templates`);
    // Fallback: send a minimal generic email instead of throwing 500
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
      subject: "Notification",
      html: `Notification service is not fully initialized.<br>Please inform your admin.`,
    });
    throw createError(500, `Email template [${templateKey}] not found`);
  }
  const subject = compileTemplate(template.subject, variables);
  const html = compileTemplate(template.body, variables).split("\n").map(l => l.trim()).join("");
  const message = {
    to,
    from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
    subject,
    html
  };
  try {
    await sgMail.send(message);
    logger.info(`📨 Email sent to ${to} using [${templateKey}]`);
  } catch (err) {
    logger.warn(`❌ SendGrid failed: ${err.message} — falling back to SMTP`);
    try {
      await smtpMailer.sendMail(message);
      logger.info(`📨 Email sent via SMTP fallback to ${to} [${templateKey}]`);
    } catch (smtpErr) {
      logger.error(`❌ SMTP fallback failed: ${smtpErr.message}`);
      throw createError(500, "Email sending failed via all transports");
    }
  }
}

export async function sendOTP(email, otp, name = "") {
  try {
    await sendEmail("OTP_VERIFICATION", email, { name, otp });
    logger.info(`✔ OTP sent to ${email}: ${otp}`);
  } catch (err) {
    logger.warn(`⚠ OTP send failed to ${email} (code: ${otp}) - ${err.message}`);
  }
}
