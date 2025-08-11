// server/models/emailTemplate.js

import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  channel: { type: String, enum: ["email", "sms"], default: "email" },
  subject: { type: String, trim: true },
  body: { type: String, required: true },
  description: { type: String, default: "" },
  reserved: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

emailTemplateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const defaultTemplates = [
  {
    key: "OTP_VERIFICATION",
    channel: "email",
    subject: "Your Verification Code",
    body: `Hello {{name}},\n\nYour verification code is **{{otp}}**. It expires in 10 minutes.\n\nThanks,\nTeacher Recruitment Team`,
    reserved: true
  },
  {
    key: "INITIAL_CREDENTIALS",
    channel: "email",
    subject: "Your Account Credentials",
    body: `Hello {{name}},\n\nUsername: {{username}}\nPassword: {{tempPassword}}\n\nPlease log in and change your password immediately.\n\nRegards,\nTeacher Recruitment Team`,
    reserved: true
  },
  {
    key: "CANDIDATES_PUSHED",
    channel: "email",
    subject: "Candidates Pushed: {{requirementTitle}}",
    body: `Hello {{schoolName}},\n\n{{count}} candidate(s) have been pushed for the requirement '{{requirementTitle}}'.\n\nLog in to review and proceed to shortlisting or interviews.\n\nRegards,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "SHORTLIST_STATUS_UPDATE",
    channel: "email",
    subject: "Your Application Status: {{status}}",
    body: `Hello {{candidateName}},\n\nYou have been {{status}} for the position '{{requirementTitle}}' at {{schoolName}}.{{notes}}\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "CANDIDATE_PIPELINE_STATUS",
    channel: "email",
    subject: "Candidate Pipeline Update: {{candidateName}} ({{status}})",
    body: `Dear {{schoolName}},\n\nCandidate {{candidateName}} has {{status}} for the requirement '{{requirementTitle}}'.\n\n{{notes}}\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "INTERVIEW_SCHEDULED",
    channel: "email",
    subject: "Interview Scheduled: {{requirementTitle}}",
    body: `Hello {{candidateName}},\n\nYour interview for '{{requirementTitle}}' at {{schoolName}} is scheduled for {{scheduledAt}} (Mode: {{mode}}).\nPanel: {{panel}}\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "INTERVIEW_RESCHEDULED",
    channel: "email",
    subject: "Interview Rescheduled: {{requirementTitle}}",
    body: `Hello {{candidateName}},\n\nYour interview for '{{requirementTitle}}' at {{schoolName}} has been rescheduled to {{scheduledAt}} (Mode: {{mode}}).\nPanel: {{panel}}\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "INTERVIEW_RESULT",
    channel: "email",
    subject: "Interview Feedback: {{requirementTitle}}",
    body: `Hello {{candidateName}},\n\nHere is the feedback regarding your interview for '{{requirementTitle}}' at {{schoolName}}:\nStatus: {{status}}\nFeedback: {{feedback}}\nScore: {{score}}\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "PROFILE_UPDATED",
    channel: "email",
    subject: "School Profile Updated",
    body: `Hello {{schoolName}},\n\nYour school profile has been updated: {{updatedFields}}\n\nIf you did not do this, please contact support.\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "REQUIREMENT_POSTED",
    channel: "email",
    subject: "Requirement Posted: {{requirementTitle}}",
    body: `Hello {{schoolName}},\n\nYour requirement '{{requirementTitle}}' has been posted successfully.\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "REQUIREMENT_UPDATED",
    channel: "email",
    subject: "Requirement Updated: {{requirementTitle}}",
    body: `Hello {{schoolName}},\n\nYour requirement '{{requirementTitle}}' has been updated. Fields: {{updatedFields}}\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "REQUIREMENT_DELETED",
    channel: "email",
    subject: "Requirement Deleted: {{requirementTitle}}",
    body: `Hello {{schoolName}},\n\nYour requirement '{{requirementTitle}}' has been deleted as requested.\n\nBest,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "GENERAL_UPDATE",
    channel: "email",
    subject: "Update: {{status}}",
    body: `Hello {{name}},\n\n{{comments}}\n\nThanks,\nTeacher Recruitment Team`,
    reserved: false
  },
  {
    key: "SMS_OTP",
    channel: "sms",
    body: `Your OTP is {{otp}}. Valid for 10 min.`,
    reserved: true
  }
];

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", emailTemplateSchema);

export { EmailTemplate };

export async function ensureDefaultTemplates() {
  for (const tpl of defaultTemplates) {
    const found = await EmailTemplate.findOne({ key: tpl.key });
    if (!found) {
      await EmailTemplate.create(tpl);
      console.log(`✅ EmailTemplate: inserted default ${tpl.key}`);
    } else if (
      tpl.reserved &&
      (found.body !== tpl.body || found.subject !== tpl.subject)
    ) {
      await EmailTemplate.findOneAndUpdate({ key: tpl.key }, {
        $set: {
          body: tpl.body,
          subject: tpl.subject,
          reserved: true,
        }
      });
      console.log(`✅ EmailTemplate: updated reserved default ${tpl.key}`);
    }
  }
}
