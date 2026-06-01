const router = require("express").Router();
const { getMeds, addMed, updateMed, takeDose, deleteMed, getTodaySchedule } = require("../controllers/medicationsController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/today",       getTodaySchedule);
router.get("/",            getMeds);
router.post("/",           addMed);
router.put("/:id",         updateMed);
router.post("/:id/take",   takeDose);
router.delete("/:id",      deleteMed);

module.exports = router;
