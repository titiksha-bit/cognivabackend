const router = require("express").Router();
const { getCurrentPlan, generatePlan, toggleTask } = require("../controllers/planController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/current",                  getCurrentPlan);
router.post("/generate",                generatePlan);
router.patch("/:planId/task/:taskId",   toggleTask);

module.exports = router;
