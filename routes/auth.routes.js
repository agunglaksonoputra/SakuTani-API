const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// router.get("/", (req, res) => {
//   res.send("✅ API route active");
// });
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
