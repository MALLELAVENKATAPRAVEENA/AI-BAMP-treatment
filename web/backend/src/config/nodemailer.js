const nodemailer = require('nodemailer');
const config = require('./config');

const isPlaceholder = (user, pass) => {
  if (!user || !pass) return true;
  if (user.includes('yourgmailaddress') || user.includes('example') || user.includes('mock')) return true;
  if (pass.includes('your16digitapppassword') || pass.includes('mock')) return true;
  return false;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const user = config.email.user;
  const pass = config.email.pass;

  if (isPlaceholder(user, pass)) {
    console.log(`[Email Service - Simulated Dispatch] To: ${to} | Subject: ${subject}`);
    console.log(`[Email Service - Body Content]\n${text || html}`);
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.email.host || 'smtp.gmail.com',
      port: config.email.port || 587,
      secure: config.email.port === 465,
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: `"AI BAMP Predictor" <${user}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`[Email Service - SMTP Dispatch Success] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service - SMTP Warning] ${error.message}. Falling back to simulated log mode.`);
    console.log(`[Email Service - Fallback Dispatch] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true, error: error.message };
  }
};

module.exports = {
  sendEmail
};
