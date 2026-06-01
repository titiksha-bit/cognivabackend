const router = require("express").Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

router.use(protect);

// @GET /api/user/profile
router.get("/profile", (req, res) => {
  res.json({ success: true, data: req.user });
});

// @PUT /api/user/profile
router.put("/profile", async (req, res, next) => {
  try {
    const allowed = ["name", "profile", "settings"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (err) { next(err); }
});

// @PUT /api/user/password
router.put("/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (err) { next(err); }
});

// @DELETE /api/user/account
router.delete("/account", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: "Account deleted permanently" });
  } catch (err) { next(err); }
});

module.exports = router;
