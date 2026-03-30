const express = require("express");
const router = express.Router();
const {
  createRate,
  getAllRates,
  searchRates,
  getLatestRate,
} = require("../controllers/exchange.controller");

router.post("/", createRate);
router.get("/", getAllRates);
router.get("/latest", getLatestRate);
router.get("/search", searchRates);


module.exports = router;