const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

// router.get("/", (req, res) => {
//   res.send("✅ API route active");
// });
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verifyToken);
router.post("/reset-password", authController.resetPassword);
router.post("/change-username", authController.changeUsername);
router.post("/generate-reset-code", auth, authorize(["admin"]), authController.generateResetPassword);
router.get("/reset-code", auth, authorize(["admin"]), authController.getActiveResetCodes);

module.exports = router;
