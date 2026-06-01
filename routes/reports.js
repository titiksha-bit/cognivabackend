const router = require("express").Router();
const { upload, uploadReport, getReports, getReport, deleteReport } = require("../controllers/reportsController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.post("/upload", upload.single("report"), uploadReport);
router.get("/",        getReports);
router.get("/:id",     getReport);
router.delete("/:id",  deleteReport);

module.exports = router;
