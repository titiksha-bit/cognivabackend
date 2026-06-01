const Report = require("../models/Report");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/reports");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `report-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  cb(null, allowed.includes(file.mimetype));
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024 },
});

// @POST /api/reports/upload
exports.uploadReport = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { title, type, date, notes } = req.body;

    const report = await Report.create({
      user: req.user._id,
      title: title || req.file.originalname,
      type: type || "blood",
      date: date || new Date(),
      fileUrl: `/uploads/reports/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      notes,
      processed: false,
    });

    // Queue AI processing (async — don't wait)
    processReportWithAI(report._id).catch(console.error);

    res.status(201).json({ success: true, message: "Report uploaded. AI analysis in progress.", data: report });
  } catch (err) { next(err); }
};

// @GET /api/reports
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ date: -1 }).limit(50);
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

// @GET /api/reports/:id
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

// @DELETE /api/reports/:id
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: "Not found" });
    // Delete file
    const filePath = path.join(__dirname, "..", report.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: "Report deleted" });
  } catch (err) { next(err); }
};

// AI processing (stub — in production, use OCR + Anthropic API)
async function processReportWithAI(reportId) {
  await new Promise(r => setTimeout(r, 2000)); // simulate delay
  await Report.findByIdAndUpdate(reportId, {
    processed: true,
    aiSummary: "Report analyzed successfully. Key markers extracted.",
    aiRecommendations: [
      "Consult your doctor for detailed interpretation.",
      "Continue monitoring your key health markers.",
    ],
  });
}
