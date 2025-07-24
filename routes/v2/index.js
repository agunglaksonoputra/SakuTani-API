const express = require("express");
const router = express.Router();

const authorize = require("../../middlewares/authorize.middleware");

// Import semua route modular
const reportRoute = require("./report.routes");

// Middleware Auth
const auth = require("../../middlewares/auth.middleware");

// Daftarkan dengan prefix masing-masing
router.use("/report", auth, reportRoute);

module.exports = router;
