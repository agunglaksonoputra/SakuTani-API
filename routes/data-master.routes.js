const express = require("express");
const dataMastercontroller = require("../controllers/data-master.controller");
const router = express.Router();

router.get("/", dataMastercontroller.getAll);
router.get("/customers", dataMastercontroller.getCustomers);
router.get("/vegetables", dataMastercontroller.getVegetables);
router.get("/units", dataMastercontroller.getUnits);

module.exports = router;
