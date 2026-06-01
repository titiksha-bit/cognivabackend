const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name:  { type: String, required: true, trim: true },
    dose:  { type: String, required: true },
    unit:  { type: String, default: "mg" },
    type:  { type: String, enum: ["tablet","capsule","liquid","injection","inhaler","patch","other"], default: "tablet" },

    // Schedule
    times:    [{ type: String }],                              // ["08:00", "20:00"]
    days:     [{ type: String }],                              // ["Mon","Tue"] or ["everyday"]
    startDate:{ type: Date, default: Date.now },
    endDate:  { type: Date },
    isActive: { type: Boolean, default: true },

    // Stock
    stockCount:    { type: Number, default: 0 },
    refillAlert:   { type: Number, default: 7 },               // alert when this many left
    instructions:  { type: String },
    sideEffects:   [String],
    interactions:  [String],

    // Logs of when taken
    takenLogs: [{
      takenAt:  { type: Date },
      scheduled:{ type: String },
      status:   { type: String, enum: ["taken","skipped","snoozed"], default: "taken" },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
