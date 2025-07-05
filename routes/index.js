const express = require("express");
const router = express.Router();

// Import semua route modular
// const authRoute = require("./auth.route");
// const userRoute = require("./user.route");
// const ownerRoute = require("./owner.route");

// Daftarkan dengan prefix masing-masing
// router.use("/auth", authRoute);
// router.use("/users", userRoute);
// router.use("/owners", ownerRoute);

// Endpoint dasar untuk test
router.get("/", (req, res) => {
  res.send("✅ API route active");
});

module.exports = router;
