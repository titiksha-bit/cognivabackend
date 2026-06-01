const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:   { type: String, default: "Health Chat" },
    messages:[{
      role:    { type: String, enum: ["user","assistant"], required: true },
      content: { type: String, required: true },
      createdAt:{ type: Date, default: Date.now },
    }],
    isActive:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

chatSchema.index({ user: 1, updatedAt: -1 });
module.exports = mongoose.model("Chat", chatSchema);
