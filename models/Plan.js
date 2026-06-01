const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: Date, required: true },
    weekEnd:   { type: Date, required: true },
    goal:      { type: String, required: true },
    aiGenerated:{ type: Boolean, default: true },

    tasks: [{
      title:      { type: String, required: true },
      category:   { type: String, enum: ["water","sleep","exercise","medication","nutrition","mindfulness","other"] },
      targetValue:{ type: Number },
      unit:       { type: String },
      note:       { type: String },
      completedDays: [{ type: Date }],
    }],

    weeklyTargets: {
      water:    { type: Number, default: 2.0 },   // L per day
      sleep:    { type: Number, default: 8 },     // hrs
      steps:    { type: Number, default: 10000 },
      exercise: { type: Number, default: 5 },     // days per week
    },

    isActive:   { type: Boolean, default: true },
    summary:    { type: String },
  },
  { timestamps: true }
);

planSchema.index({ user: 1, weekStart: -1 });
module.exports = mongoose.model("Plan", planSchema);
