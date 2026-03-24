const Product = require("../models/Product");
const Sale = require("../models/Sale");

exports.getIncomeReport = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ stockQty: 1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();
    const sales = await Sale.find();

    const totalRevenue = sales.reduce(
      (sum, item) => sum + (item.grandTotal || 0),
      0
    );

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ["$stockQty", 5] },
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalSales,
        totalRevenue,
        lowStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

