const router = require("express").Router();
const {
   
  getIncomeReport,
  getStockReport,
  getDashboardSummary,
} = require("../controllers/report.controller");


router.get("/income", getIncomeReport);
router.get("/stock", getStockReport);
router.get("/dashboard-summary", getDashboardSummary);

module.exports = router;