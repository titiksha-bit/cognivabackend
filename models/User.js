const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar:   { type: String, default: "" },

    // Health Profile
    profile: {
      age:      { type: Number },
      gender:   { type: String, enum: ["Male", "Female", "Other", ""] },
      city:     { type: String, default: "" },
      height:   { type: Number }, // cm
      weight:   { type: Number }, // kg
      bloodType:{ type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-",""] },
      goal:     { type: String, default: "Improve overall health" },
      conditions: [String],    // chronic conditions
      allergies:  [String],
    },

    // App settings
    settings: {
      notifications: { push: { type: Boolean, default: true }, sms: { type: Boolean, default: false }, email: { type: Boolean, default: true } },
      units:     { type: String, enum: ["metric", "imperial"], default: "metric" },
      language:  { type: String, default: "en" },
      theme:     { type: String, enum: ["dark", "light"], default: "dark" },
    },

    // Gamification
    streak:     { type: Number, default: 0 },
    lastLogDate:{ type: Date },
    healthScore:{ type: Number, default: 0, min: 0, max: 100 },
    badges:     [{ name: String, earnedAt: Date, icon: String }],
    plan:       { type: String, enum: ["free", "pro", "family"], default: "free" },

    // Auth
    isVerified:    { type: Boolean, default: false },
    verifyToken:   String,
    resetToken:    String,
    resetTokenExpiry: Date,
    refreshToken:  String,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Never return password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verifyToken;
  delete obj.resetToken;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
