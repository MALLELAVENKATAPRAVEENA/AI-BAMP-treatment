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
      <p style="color: #666; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0;" />
      <p style="font-size: 11px; color: #999; text-align: center;">Confidential Medical Information System &copy; 2026 AI BAMP Predictor Team</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html, text: `Your OTP is ${otp}` });
};

const sendPasswordResetEmail = async (email, otpCode) => {
  const subject = 'BAMP Password Reset Verification Code';
  const text = `Your password reset verification code is:\n\n${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this password reset, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 580px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f52ba; margin-top: 0;">AI BAMP Outcome Predictor</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <p style="font-size: 15px; line-height: 1.5;">Your password reset verification code is:</p>
      <div style="background-color: #f1f5f9; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f52ba;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #475569;">This code expires in <strong>10 minutes</strong>.</p>
      <p style="font-size: 13px; color: #64748b;">If you did not request this password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">BAMP AI Predictor Medical Portal &copy; 2026</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail
};
