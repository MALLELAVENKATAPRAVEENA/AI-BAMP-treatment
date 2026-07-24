const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: config.email.user ? {
    user: config.email.user,
    pass: config.email.pass
  } : undefined
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!config.email.user) {
      console.log(`[Email Mock Log] To: ${to} | Subject: ${subject} | Content: ${text || html}`);
      return { success: true, mocked: true };
    }
    const info = await transporter.sendMail({
      from: `"AI BAMP Predictor" <${config.email.user}>`,
      to,
      subject,
      text,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email Dispatch Error:', error.message);
    // Fall back gracefully so flow is never blocked
    return { success: true, mocked: true, error: error.message };
  }
};

module.exports = {
  sendEmail
};
