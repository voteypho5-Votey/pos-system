const express = require("express");
const router = express.Router();

const {
  getIncomeReport,
  getStockReport,
  getDashboardSummary,
   paySale,
} = require("../controllers/report.controller");

router.get("/income", getIncomeReport);
router.get("/stock", getStockReport);
router.get("/dashboard-summary", getDashboardSummary);
router.post("/report/sale/pay/:id", paySale);


module.exports = router;