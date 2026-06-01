const VitalLog = require("../models/VitalLog");
const User = require("../models/User");

// @POST /api/vitals — Log new vitals
exports.logVitals = async (req, res, next) => {
  try {
    const { heartRate, systolic, diastolic, spo2, sleepHours, sleepMinutes,
            waterIntake, steps, caloriesBurned, weight, mood, symptoms, notes, date } = req.body;

    const log = await VitalLog.create({
      user: req.user._id,
      date: date || new Date(),
      heartRate, systolic, diastolic, spo2,
      sleepHours, sleepMinutes, waterIntake,
      steps, caloriesBurned, weight, mood,
      symptoms: symptoms || [],
      notes,
    });

    // Update streak
    await updateStreak(req.user._id);

    res.status(201).json({ success: true, message: "Vitals logged successfully", data: log });
  } catch (err) { next(err); }
};

// @GET /api/vitals/today — Get today's log
exports.getToday = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const log = await VitalLog.findOne({ user: req.user._id, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

// @GET /api/vitals?days=7 — Get recent logs
exports.getLogs = async (req, res, next) => {
  try {
    const days  = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 50;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await VitalLog.find({ user: req.user._id, date: { $gte: since } })
      .sort({ date: -1 }).limit(limit);

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) { next(err); }
};

// @PUT /api/vitals/:id — Update a log
exports.updateLog = async (req, res, next) => {
  try {
    const log = await VitalLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

// @DELETE /api/vitals/:id
exports.deleteLog = async (req, res, next) => {
  try {
    const log = await VitalLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });
    res.json({ success: true, message: "Log deleted" });
  } catch (err) { next(err); }
};

// Helper — update streak
async function updateStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today - 86400000);

  if (!user.lastLogDate) {
    user.streak = 1;
  } else {
    const last = new Date(user.lastLogDate); last.setHours(0, 0, 0, 0);
    if (last.getTime() === yesterday.getTime()) user.streak += 1;
    else if (last.getTime() < yesterday.getTime()) user.streak = 1;
    // same day — no change
  }
  user.lastLogDate = new Date();
  await user.save();
}
