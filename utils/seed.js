/**
 * COGNIVA — Database Seed Script
 * Run: node utils/seed.js
 * Creates a demo user + sample health data
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const VitalLog = require("../models/VitalLog");
const Medication = require("../models/Medication");
const Plan = require("../models/Plan");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing demo data
  await User.deleteMany({ email: "titiksha@cogniva.app" });
  console.log("🧹 Cleared old seed data");

  // Create demo user
  const user = await User.create({
    name: "Titiksha Sharma",
    email: "titiksha@cogniva.app",
    password: "cogniva123",
    profile: { age: 28, gender: "Female", city: "Delhi", height: 162, weight: 58, bloodType: "B+", goal: "Improve Sleep Quality" },
    settings: { notifications: { push: true, sms: false, email: true } },
    streak: 12,
    healthScore: 78,
    plan: "pro",
  });
  console.log(`👤 Created user: ${user.email}`);

  // Seed 7 days of vital logs
  const days = 7;
  const logs = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(8, 0, 0, 0);
    logs.push({
      user: user._id, date,
      heartRate:    65 + Math.floor(Math.random() * 15),
      systolic:     115 + Math.floor(Math.random() * 15),
      diastolic:    75  + Math.floor(Math.random() * 10),
      spo2:         96  + Math.floor(Math.random() * 4),
      sleepHours:   6   + Math.floor(Math.random() * 3),
      sleepMinutes: Math.floor(Math.random() * 60),
      waterIntake:  6   + Math.floor(Math.random() * 3),
      steps:        5000 + Math.floor(Math.random() * 5000),
      caloriesBurned: 300 + Math.floor(Math.random() * 300),
      mood:         ["😊","😐","😴"][Math.floor(Math.random() * 3)],
      source: "manual",
    });
  }
  await VitalLog.insertMany(logs);
  console.log(`📊 Created ${logs.length} vital logs`);

  // Seed medications
  await Medication.create([
    { user: user._id, name: "Vitamin D3",  dose: "600",  unit: "IU",  type: "capsule", times: ["18:00"], days: ["everyday"], stockCount: 30, isActive: true },
    { user: user._id, name: "Metformin",   dose: "500",  unit: "mg",  type: "tablet",  times: ["08:00","20:00"], days: ["everyday"], stockCount: 45, isActive: true },
  ]);
  console.log("💊 Created medications");

  // Seed current plan
  const monday = new Date();
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  await Plan.create({
    user: user._id,
    weekStart: monday, weekEnd: sunday,
    goal: "Improve Sleep Quality",
    tasks: [
      { title: "Drink 8 glasses of water", category: "water",       targetValue: 8,  unit: "glasses" },
      { title: "30-minute walk",            category: "exercise",    targetValue: 30, unit: "minutes" },
      { title: "Sleep by 11 PM",            category: "sleep",       targetValue: 23, unit: "hour" },
      { title: "Take Vitamin D",            category: "medication",  targetValue: 1,  unit: "dose" },
      { title: "Meditate 10 minutes",       category: "mindfulness", targetValue: 10, unit: "minutes" },
    ],
    isActive: true,
  });
  console.log("🗺️  Created health plan");

  console.log("\n✅ Seed complete!");
  console.log("─────────────────────────────────");
  console.log("  Email:    titiksha@cogniva.app");
  console.log("  Password: cogniva123");
  console.log("─────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
