const Plan = require("../models/Plan");
const VitalLog = require("../models/VitalLog");

// @GET /api/plan/current
exports.getCurrentPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ user: req.user._id, isActive: true }).sort({ weekStart: -1 });
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// @POST /api/plan/generate — AI generates a new plan
exports.generatePlan = async (req, res, next) => {
  try {
    // Deactivate old plan
    await Plan.updateMany({ user: req.user._id }, { isActive: false });

    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Get recent vitals to personalize
    const logs = await VitalLog.find({ user: req.user._id }).sort({ date: -1 }).limit(7);
    const avgSleep = logs.length ? logs.filter(l=>l.sleepHours).reduce((a,b)=>a+(b.sleepHours||0),0)/logs.length : 7;
    const avgWater = logs.length ? logs.filter(l=>l.waterIntake).reduce((a,b)=>a+(b.waterIntake||0),0)/logs.length : 6;

    const goal = req.user.profile?.goal || "Improve overall health";

    const tasks = [
      { title: `Drink ${Math.max(8, Math.ceil(avgWater + 1))} glasses of water`, category: "water", targetValue: Math.max(8, Math.ceil(avgWater + 1)), unit: "glasses" },
      { title: `Sleep ${Math.min(9, Math.ceil(avgSleep + 0.5))} hours`, category: "sleep", targetValue: Math.min(9, Math.ceil(avgSleep + 0.5)), unit: "hours" },
      { title: "30-minute walk or exercise", category: "exercise", targetValue: 30, unit: "minutes" },
      { title: "Take all medications on time", category: "medication", targetValue: 100, unit: "%" },
      { title: "Meditate or breathe deeply for 10 minutes", category: "mindfulness", targetValue: 10, unit: "minutes" },
    ];

    const plan = await Plan.create({
      user: req.user._id,
      weekStart: monday,
      weekEnd: sunday,
      goal,
      tasks,
      isActive: true,
      summary: `Personalized plan based on your recent ${logs.length} day logs.`,
    });

    res.status(201).json({ success: true, message: "New plan generated!", data: plan });
  } catch (err) { next(err); }
};

// @PATCH /api/plan/:planId/task/:taskId — Toggle task completion
exports.toggleTask = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.planId, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    const task = plan.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const alreadyDone = task.completedDays.some(d => new Date(d).setHours(0,0,0,0) === today.getTime());

    if (alreadyDone) {
      task.completedDays = task.completedDays.filter(d => new Date(d).setHours(0,0,0,0) !== today.getTime());
    } else {
      task.completedDays.push(today);
    }

    await plan.save();
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};
