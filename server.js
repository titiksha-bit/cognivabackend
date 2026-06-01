/**
 * COGNIVA HEALTH AI — Main Server
 * Entry point for the Express application
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();

// ── Database ─────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
connectDB();

// ── Middleware ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",     authLimiter, require("./routes/auth"));
app.use("/api/user",     require("./routes/user"));
app.use("/api/vitals",   require("./routes/vitals"));
app.use("/api/logs",     require("./routes/logs"));
app.use("/api/meds",     require("./routes/medications"));
app.use("/api/reports",  require("./routes/reports"));
app.use("/api/plan",     require("./routes/plan"));
app.use("/api/chat",     require("./routes/chat"));
app.use("/api/analytics",require("./routes/analytics"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cogniva API is running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Cogniva Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
