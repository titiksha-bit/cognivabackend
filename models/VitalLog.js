const mongoose = require("mongoose");

const vitalLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, default: Date.now },

    // Core vitals
    heartRate:   { type: Number, min: 20, max: 300 },        // BPM
    systolic:    { type: Number, min: 60, max: 250 },         // mmHg
    diastolic:   { type: Number, min: 40, max: 150 },         // mmHg
    spo2:        { type: Number, min: 50, max: 100 },         // %
    temperature: { type: Number, min: 30, max: 45 },          // °C
    glucose:     { type: Number, min: 30, max: 600 },         // mg/dL

    // Lifestyle
    sleepHours:  { type: Number, min: 0, max: 24 },
    sleepMinutes:{ type: Number, min: 0, max: 59 },
    waterIntake: { type: Number, min: 0, max: 20 },           // glasses (250ml each)
    steps:       { type: Number, min: 0 },
    caloriesBurned: { type: Number, min: 0 },
    caloriesConsumed:{ type: Number, min: 0 },
    weight:      { type: Number },                            // kg

    // Mood & symptoms
    mood:        { type: String, enum: ["😊","😐","😢","😠","😴","🤒",""] },
    moodScore:   { type: Number, min: 1, max: 5 },
    symptoms:    [{ type: String }],
    notes:       { type: String, maxlength: 1000 },

    // Source
    source: { type: String, enum: ["manual", "wearable", "import"], default: "manual" },
  },
  { timestamps: true }
);

// Compound index for fast user+date queries
vitalLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("VitalLog", vitalLogSchema);
