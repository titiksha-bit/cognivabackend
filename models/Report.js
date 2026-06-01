const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:    { type: String, required: true },
    type:     { type: String, enum: ["blood","lipid","thyroid","urine","xray","mri","other"], default: "blood" },
    date:     { type: Date, default: Date.now },
    fileUrl:  { type: String },
    fileName: { type: String },
    fileSize: { type: Number },

    // AI extracted results
    results: [{
      name:     { type: String },
      value:    { type: String },
      unit:     { type: String },
      status:   { type: String, enum: ["normal","low","high","critical"] },
      refRange: { type: String },
    }],

    // AI summary
    aiSummary:       { type: String },
    aiRecommendations:[String],
    processed:       { type: Boolean, default: false },
    processingError: { type: String },

    doctorShared:    { type: Boolean, default: false },
    notes:           { type: String },
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, date: -1 });
module.exports = mongoose.model("Report", reportSchema);
