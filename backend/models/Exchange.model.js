// models/exchange.model.js
const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: true, // ex: 4100
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Exchange", exchangeSchema);