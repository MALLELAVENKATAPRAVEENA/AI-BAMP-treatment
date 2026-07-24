const { sendEmail } = require('../config/nodemailer');

const sendOTPEmail = async (email, otp, fullName) => {
  const subject = 'Your Verification OTP - AI BAMP Predictor System';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1e88e5; text-align: center;">AI BAMP Outcome Predictor</h2>
      <hr style="border: none; border-top: 1px solid #e0e0e0;" />
      <p>Dear <strong>${fullName || 'Healthcare Professional'}</strong>,</p>
      <p>Thank you for registering on the AI BAMP Predictor Platform for Class III Malocclusion Treatment Outcome Assessment.</p>
      <p>Your 6-digit One-Time Password (OTP) for account verification is:</p>
      <div style="background-color: #f4f6f9; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0d47a1;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 13px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0;" />
      <p style="font-size: 11px; color: #999; text-align: center;">Confidential Medical Information System &copy; 2026 AI BAMP Predictor Team</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html, text: `Your OTP is ${otp}` });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const subject = 'Password Reset Request - AI BAMP Predictor';
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
      <h2 style="color: #1e88e5;">Password Reset Instructions</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #1e88e5; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p style="font-size: 12px; color: #777;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html, text: `Reset link: ${resetLink}` });
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail
};
