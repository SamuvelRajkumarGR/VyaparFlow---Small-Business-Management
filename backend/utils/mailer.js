const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.MAIL_FROM
  );

const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  if (!isEmailConfigured()) {
    throw new Error('Password reset email is not configured. Set the SMTP environment variables.');
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const safeName = String(name || 'there').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Reset your VyaparFlow password',
    text: [
      `Hello ${name || 'there'},`,
      '',
      'We received a request to reset your VyaparFlow password.',
      `Use this link within 30 minutes to choose a new password: ${resetUrl}`,
      '',
      'If you did not request this, you can ignore this email. Your password will not change.',
    ].join('\n'),
    html: `
      <p>Hello ${safeName},</p>
      <p>We received a request to reset your VyaparFlow password.</p>
      <p><a href="${resetUrl}">Choose a new password</a></p>
      <p>This link expires in 30 minutes and can only be used once.</p>
      <p>If you did not request this, you can ignore this email. Your password will not change.</p>
    `,
  });
};

module.exports = { isEmailConfigured, sendPasswordResetEmail };
