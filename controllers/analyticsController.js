const VitalLog = require("../models/VitalLog");

// @GET /api/analytics/weekly
exports.getWeekly = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await VitalLog.find({ user: req.user._id, date: { $gte: since } }).sort({ date: 1 });

    // Group by day
    const byDay = {};
    logs.forEach(log => {
      const day = new Date(log.date).toLocaleDateString("en-US", { weekday: "short" });
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(log);
    });

    const avg = (arr, key) => {
      const vals = arr.map(l => l[key]).filter(v => v != null);
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };

    const summary = Object.entries(byDay).map(([day, dayLogs]) => ({
      day,
      heartRate:   avg(dayLogs, "heartRate"),
      systolic:    avg(dayLogs, "systolic"),
      diastolic:   avg(dayLogs, "diastolic"),
      sleepHours:  avg(dayLogs, "sleepHours"),
      waterIntake: avg(dayLogs, "waterIntake"),
      steps:       avg(dayLogs, "steps"),
      weight:      avg(dayLogs, "weight"),
    }));

    // Overall averages
    const overall = {
      avgHeartRate:  avg(logs, "heartRate"),
      avgSystolic:   avg(logs, "systolic"),
      avgSleep:      avg(logs, "sleepHours"),
      avgWater:      avg(logs, "waterIntake"),
      avgSteps:      avg(logs, "steps"),
      totalLogs:     logs.length,
    };

    res.json({ success: true, data: { summary, overall, logs } });
  } catch (err) { next(err); }
};

// @GET /api/analytics/insights — AI-style pattern detection
exports.getInsights = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs = await VitalLog.find({ user: req.user._id, date: { $gte: since } }).sort({ date: -1 });

    const insights = [];

    if (logs.length < 3) {
      return res.json({ success: true, data: { insights: ["Log more vitals to unlock AI insights!"] } });
    }

    // Sleep trend
    const sleepLogs = logs.filter(l => l.sleepHours).map(l => l.sleepHours);
    if (sleepLogs.length >= 3) {
      const avg = sleepLogs.reduce((a, b) => a + b, 0) / sleepLogs.length;
      if (avg < 7) insights.push(`Your average sleep is ${avg.toFixed(1)}h — below the 7-9h recommendation.`);
      else insights.push(`Great sleep! You're averaging ${avg.toFixed(1)}h this month.`);
    }

    // Heart rate trend
    const hrLogs = logs.filter(l => l.heartRate).map(l => l.heartRate);
    if (hrLogs.length >= 3) {
      const recent = hrLogs.slice(0, 3).reduce((a, b) => a + b) / 3;
      const older  = hrLogs.slice(-3).reduce((a, b) => a + b) / 3;
      const diff = ((recent - older) / older * 100).toFixed(1);
      if (Math.abs(diff) > 3) insights.push(`Your resting heart rate ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff)}% recently.`);
    }

    // Water
    const waterLogs = logs.filter(l => l.waterIntake).map(l => l.waterIntake * 0.25);
    if (waterLogs.length >= 3) {
      const avg = waterLogs.reduce((a, b) => a + b) / waterLogs.length;
      if (avg < 1.5) insights.push(`You're averaging only ${avg.toFixed(1)}L/day. Try to reach 2L.`);
    }

    if (!insights.length) insights.push("All vitals look stable. Keep up the great work!");

    res.json({ success: true, data: { insights, totalLogs: logs.length } });
  } catch (err) { next(err); }
};

// @GET /api/analytics/healthscore
exports.getHealthScore = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs  = await VitalLog.find({ user: req.user._id, date: { $gte: since } });
    if (!logs.length) return res.json({ success: true, data: { score: 0 } });

    let score = 50; // base

    const avg = (key) => { const v = logs.map(l => l[key]).filter(x => x != null); return v.length ? v.reduce((a,b)=>a+b)/v.length : null; };

    const hr = avg("heartRate");
    if (hr && hr >= 60 && hr <= 100) score += 10;

    const sys = avg("systolic"), dia = avg("diastolic");
    if (sys && dia && sys <= 130 && dia <= 85) score += 10;

    const sleep = avg("sleepHours");
    if (sleep && sleep >= 7) score += 10;

    const water = avg("waterIntake");
    if (water && water * 0.25 >= 1.5) score += 10;

    const steps = avg("steps");
    if (steps && steps >= 7500) score += 10;

    score = Math.min(100, score);

    await require("../models/User").findByIdAndUpdate(req.user._id, { healthScore: score });

    res.json({ success: true, data: { score, breakdown: { heartRate: hr, sleep, water: water ? water*0.25 : null, steps } } });
  } catch (err) { next(err); }
};
