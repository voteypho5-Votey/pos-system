const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    stockQty: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["មាន", "អស់", "អសកម្ម"],
      default: "មាន",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);