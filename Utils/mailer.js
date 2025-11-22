import { transporter, resend, isProd } from '../Config/emailConfig.js';

export const sendEmail = async (to, subject, text, html, attachmentPath) => {
  try {
    if (isProd) {
      // 🟢 Use Resend in production (Render)
      await resend.emails.send({
        from: process.env.EMAIL_USER, // Must be verified in Resend
        to,
        subject,
        html: html || `<p>${text}</p>`,
        attachments: attachmentPath
          ? [{filename: "invoice.pdf", path: attachmentPath }]
          : undefined,
      });
      console.log("✅ Email sent successfully via Resend");
    } else {
      // 🔵 Use Gmail in local development
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments: attachmentPath ? [{ path: attachmentPath }] : [],
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully via Gmail");
    }
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
