const router = require("express").Router();
const { getWeekly, getInsights, getHealthScore } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/weekly",      getWeekly);
router.get("/insights",    getInsights);
router.get("/healthscore", getHealthScore);

module.exports = router;
