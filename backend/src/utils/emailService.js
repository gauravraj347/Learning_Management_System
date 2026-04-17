import nodemailer from "nodemailer";
import config from "../config/index.js";

/**
 * Create reusable transporter.
 * Uses Ethereal (fake SMTP) in development, real SMTP in production.
 */
const createTransporter = async () => {
  if (config.env === "development") {
    // Use Ethereal for dev testing (no real emails sent)
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Production: use real SMTP (Gmail, SendGrid, etc.)
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

/**
 * Send an email.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"LMS Platform" <${config.email.from || "noreply@lms.com"}>`,
      to,
      subject,
      html,
    });

    // In development, log the preview URL
    if (config.env === "development") {
      console.log(`📧 Email preview: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Don't throw — email failures shouldn't break the flow
    return null;
  }
};

/**
 * Welcome email on registration.
 */
export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to LMS Platform! 🎓",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">Welcome to LMS! 🎓</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">Your account has been created successfully. You're all set to start learning!</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Name:</strong> ${user.name}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Role:</strong> ${user.role}</p>
          </div>
          <p style="font-size: 14px; color: #94a3b8;">Happy Learning! 🚀</p>
        </div>
      </div>
    `,
  });
};

/**
 * Enrollment confirmation email.
 */
export const sendEnrollmentEmail = async (user, course) => {
  return sendEmail({
    to: user.email,
    subject: `Enrolled: ${course.title} ✅`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Enrollment Confirmed! ✅</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">You have been successfully enrolled in:</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e;">
            <h3 style="margin: 0 0 10px 0; color: #1e293b;">${course.title}</h3>
            <p style="margin: 5px 0; color: #475569;">${course.description || ""}</p>
            <p style="margin: 10px 0 0 0; color: #475569;"><strong>Price:</strong> ${course.price === 0 ? "Free" : `₹${course.price}`}</p>
          </div>
          <p style="font-size: 14px; color: #94a3b8;">Start learning now! 📚</p>
        </div>
      </div>
    `,
  });
};

/**
 * Course completion congratulations email.
 */
export const sendCompletionEmail = async (user, course) => {
  return sendEmail({
    to: user.email,
    subject: `Congratulations! You completed ${course.title} 🏆`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Congratulations! 🏆</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">You've completed <strong>${course.title}</strong>! 🎉</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; padding: 15px 30px; border-radius: 8px; font-size: 18px; font-weight: bold;">
              100% Complete
            </div>
          </div>
          <p style="font-size: 14px; color: #94a3b8; text-align: center;">Your certificate is ready for download from your dashboard.</p>
        </div>
      </div>
    `,
  });
};

export default sendEmail;
