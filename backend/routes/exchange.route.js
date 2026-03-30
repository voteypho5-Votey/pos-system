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

// POST /api/exchange
router.post("/", async (req, res) => {
  try {
    const { rate } = req.body;

    const exchange = new Exchange({ rate });
    await exchange.save();

    res.json(exchange);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exchange/latest
router.get("/latest", async (req, res) => {
  try {
    const exchange = await Exchange.findOne().sort({ date: -1 });
    res.json(exchange);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;