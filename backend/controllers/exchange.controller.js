const Exchange = require("../models/Exchange.model");

exports.createRate = async (req, res) => {
  try {
    const { rate } = req.body;

    if (!rate) {
      return res.status(400).json({ message: "Rate is required" });
    }

    const newRate = await Exchange.create({ rate });

    res.status(201).json(newRate);
  } catch (error) {
    res.status(500).json({ message: "Error saving rate" });
  }
};

exports.getAllRates = async (req, res) => {
  try {
    const rates = await Exchange.find().sort({ createdAt: -1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rates" });
  }
};

exports.getLatestRate = async (req, res) => {
  try {
    const latest = await Exchange.findOne().sort({ createdAt: -1 });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ message: "Error fetching latest rate" });
  }
};

exports.searchRates = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    let filter = {};

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const rates = await Exchange.find(filter).sort({ createdAt: -1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: "Error searching rates" });
  }
};