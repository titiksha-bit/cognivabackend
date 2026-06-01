const router = require("express").Router();
const { logVitals, getToday, getLogs, updateLog, deleteLog } = require("../controllers/vitalsController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.post("/",      logVitals);
router.get("/today",  getToday);
router.get("/",       getLogs);
router.put("/:id",    updateLog);
router.delete("/:id", deleteLog);

module.exports = router;
