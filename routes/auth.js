// routes/auth.js
const router = require("express").Router();
const { register, login, refreshToken, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");

router.post("/register", [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
], register);

router.post("/login", [
  body("email").isEmail(),
  body("password").notEmpty(),
], login);

router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
