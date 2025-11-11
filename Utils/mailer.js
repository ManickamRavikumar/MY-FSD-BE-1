import {transporter} from '../Config/emailConfig.js';

export const sendEmail = async (to, subject, text ,html ,attachmentPath) => { 
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
            attachments: attachmentPath ? [{ path: attachmentPath }] : [],
        }
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Error sending email: ", error.message);
    }
};
