const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);

// route yang membutuhkan token
router.get("/profile", auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
