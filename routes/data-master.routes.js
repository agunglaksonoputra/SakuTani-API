const express = require("express");
const dataMastercontroller = require("../controllers/data-master.controller");
const router = express.Router();

router.get("/", dataMastercontroller.getAll);

module.exports = router;
