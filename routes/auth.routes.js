const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// router.get("/", (req, res) => {
//   res.send("✅ API route active");
// });
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verifyToken);
router.post("/reset-password", authController.resetPassword);
router.post("/change-username", authController.changeUsername);

module.exports = router;
