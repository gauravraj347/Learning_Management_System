import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate a course completion certificate as PDF.
 * Returns the file path of the generated certificate.
 */
export const generateCertificate = async (user, course) => {
  const certDir = path.resolve("uploads/certificates");

  // Ensure directory exists
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const filename = `cert-${user._id}-${course._id}-${Date.now()}.pdf`;
  const filepath = path.join(certDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // ── Background gradient border ──────────────────────
    doc
      .rect(20, 20, pageWidth - 40, pageHeight - 40)
      .lineWidth(3)
      .stroke("#667eea");

    doc
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .lineWidth(1)
      .stroke("#c7d2fe");

    // ── Header ──────────────────────────────────────────
    doc
      .fontSize(14)
      .fillColor("#667eea")
      .text("LMS PLATFORM", centerX - 60, 60, { width: 120, align: "center" });

    doc
      .fontSize(36)
      .fillColor("#1e293b")
      .text("Certificate of Completion", 0, 100, {
        width: pageWidth,
        align: "center",
      });

    // ── Decorative line ─────────────────────────────────
    doc
      .moveTo(centerX - 150, 150)
      .lineTo(centerX + 150, 150)
      .lineWidth(2)
      .stroke("#667eea");

    // ── Body ────────────────────────────────────────────
    doc
      .fontSize(14)
      .fillColor("#64748b")
      .text("This is to certify that", 0, 180, {
        width: pageWidth,
        align: "center",
      });

    doc
      .fontSize(28)
      .fillColor("#1e293b")
      .text(user.name, 0, 210, { width: pageWidth, align: "center" });

    doc
      .fontSize(14)
      .fillColor("#64748b")
      .text("has successfully completed the course", 0, 260, {
        width: pageWidth,
        align: "center",
      });

    doc
      .fontSize(22)
      .fillColor("#667eea")
      .text(`"${course.title}"`, 0, 290, {
        width: pageWidth,
        align: "center",
      });

    // ── Completion date ─────────────────────────────────
    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(12)
      .fillColor("#94a3b8")
      .text(`Completed on: ${completionDate}`, 0, 340, {
        width: pageWidth,
        align: "center",
      });

    // ── Certificate ID ──────────────────────────────────
    const certId = `LMS-${Date.now().toString(36).toUpperCase()}`;

    doc
      .fontSize(10)
      .fillColor("#cbd5e1")
      .text(`Certificate ID: ${certId}`, 0, 380, {
        width: pageWidth,
        align: "center",
      });

    // ── Signature line ──────────────────────────────────
    doc
      .moveTo(centerX - 100, 430)
      .lineTo(centerX + 100, 430)
      .lineWidth(1)
      .stroke("#94a3b8");

    doc
      .fontSize(11)
      .fillColor("#64748b")
      .text("LMS Platform Administration", 0, 440, {
        width: pageWidth,
        align: "center",
      });

    // ── Footer ──────────────────────────────────────────
    doc
      .fontSize(8)
      .fillColor("#cbd5e1")
      .text(
        "This certificate is auto-generated and verifiable at lms-platform.com",
        0,
        pageHeight - 70,
        { width: pageWidth, align: "center" }
      );

    doc.end();

    stream.on("finish", () => {
      resolve({
        filename,
        filepath,
        url: `/uploads/certificates/${filename}`,
        certId,
      });
    });

    stream.on("error", reject);
  });
};
