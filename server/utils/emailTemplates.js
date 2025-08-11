// server/utils/emailTemplates.js

/**
 * Welcome email for new registrations
 */
export function welcomeTemplate({ name, username, password, portalUrl }) {
  return `
    <h1>Welcome, ${name}!</h1>
    <p>Your account has been created. Use the credentials below to log in:</p>
    <ul>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>Please <a href="${portalUrl}/login">log in</a> and change your password immediately.</p>
    <hr/>
    <p>Thanks,<br/>Teacher Recruitment Team</p>
  `;
}

/**
 * OTP email
 */
export function otpTemplate({ otp, expiresInMinutes }) {
  return `
    <h3>Your One-Time Password</h3>
    <p>Use the following OTP to verify your account (expires in ${expiresInMinutes} minutes):</p>
    <h2>${otp}</h2>
    <p>If you did not request this, please ignore.</p>
  `;
}

/**
 * Interview scheduled notification
 */
export function interviewScheduledTemplate({ candidateName, requirementTitle, dateTime, mode }) {
  return `
    <h3>Interview Scheduled</h3>
    <p>Dear ${candidateName},</p>
    <p>Your interview for <strong>${requirementTitle}</strong> is scheduled on ${dateTime} (${mode}).</p>
    <p>Good luck!</p>
    <hr/>
    <p>Teacher Recruitment System</p>
  `;
}

/**
 * Generic status update
 */
export function statusUpdateTemplate({ candidateName, requirementTitle, status }) {
  return `
    <p>Dear ${candidateName},</p>
    <p>Your application for "<strong>${requirementTitle}</strong>" has been updated to status: <strong>${status}</strong>.</p>
    <hr/>
    <p>Teacher Recruitment System</p>
  `;
}
