const Medication = require("../models/Medication");

// @GET /api/meds
exports.getMeds = async (req, res, next) => {
  try {
    const meds = await Medication.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: meds });
  } catch (err) { next(err); }
};

// @POST /api/meds
exports.addMed = async (req, res, next) => {
  try {
    const med = await Medication.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: med });
  } catch (err) { next(err); }
};

// @PUT /api/meds/:id
exports.updateMed = async (req, res, next) => {
  try {
    const med = await Medication.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!med) return res.status(404).json({ success: false, message: "Medication not found" });
    res.json({ success: true, data: med });
  } catch (err) { next(err); }
};

// @POST /api/meds/:id/take — Mark a dose as taken
exports.takeDose = async (req, res, next) => {
  try {
    const { scheduledTime, status } = req.body;
    const med = await Medication.findOne({ _id: req.params.id, user: req.user._id });
    if (!med) return res.status(404).json({ success: false, message: "Medication not found" });

    med.takenLogs.push({ takenAt: new Date(), scheduled: scheduledTime, status: status || "taken" });
    if (med.stockCount > 0 && status === "taken") med.stockCount -= 1;
    await med.save();

    res.json({ success: true, message: `Dose marked as ${status || "taken"}`, data: med });
  } catch (err) { next(err); }
};

// @DELETE /api/meds/:id
exports.deleteMed = async (req, res, next) => {
  try {
    const med = await Medication.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false }, { new: true });
    if (!med) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Medication removed" });
  } catch (err) { next(err); }
};

// @GET /api/meds/today — Get today's schedule
exports.getTodaySchedule = async (req, res, next) => {
  try {
    const meds = await Medication.find({ user: req.user._id, isActive: true });
    const now = new Date();
    const schedule = meds.flatMap(m =>
      (m.times || []).map(t => {
        const [h, min] = t.split(":").map(Number);
        const due = new Date(); due.setHours(h, min, 0, 0);
        const minsLeft = Math.round((due - now) / 60000);
        return { medId: m._id, name: m.name, dose: m.dose, time: t, dueAt: due, minsLeft, isDue: minsLeft >= -30 && minsLeft <= 30, stock: m.stockCount };
      })
    ).sort((a, b) => a.dueAt - b.dueAt);

    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
};
