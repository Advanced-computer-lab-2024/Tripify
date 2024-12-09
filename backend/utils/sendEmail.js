import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter using Brevo's SMTP server
const sendEmail = async (to, subject, text, html = "") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",  // Brevo's SMTP server
      port: 587,  // STARTTLS
      secure: false,  // false for STARTTLS
      auth: {
        user: process.env.BREVO_EMAIL,  // Your Brevo email address (configured in .env)
        pass: process.env.BREVO_API_KEY,  // Your Brevo API key (configured in .env)
      },
    });

    const mailOptions = {
      from: "tripify11@outlook.com",  // Hardcoded sender email
      to,  // Recipient(s)
      subject,  // Subject line
      text,  // Plain text body
      html,  // Optional: HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

export default sendEmail;
