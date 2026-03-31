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

    const revenueData = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const lowStockProducts = await Product.find({ stockQty: { $lt: 5 } }).limit(5);
    const lowStockCount = lowStockProducts.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.countDocuments({
      createdAt: { $gte: today },
    });

    const todayRevenueData = await Sale.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    const todayRevenue = todayRevenueData[0]?.total || 0;


    const salesByDay = await Sale.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$grandTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          day: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Sun" },
                { case: { $eq: ["$_id", 2] }, then: "Mon" },
                { case: { $eq: ["$_id", 3] }, then: "Tue" },
                { case: { $eq: ["$_id", 4] }, then: "Wed" },
                { case: { $eq: ["$_id", 5] }, then: "Thu" },
                { case: { $eq: ["$_id", 6] }, then: "Fri" },
                { case: { $eq: ["$_id", 7] }, then: "Sat" },
              ],
              default: "-",
            },
          },
          total: 1,
        },
      },
      { $sort: { day: 1 } },
    ]);

    const salesTrend = await Sale.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$grandTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: ["Month ", { $toString: "$_id" }],
          },
          total: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    const salesByCategory = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          name: { $first: "$product.category" },
          total: { $sum: "$items.total" },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(5);

    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          soldQty: { $sum: "$items.qty" },
        },
      },
      { $sort: { soldQty: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalSales,
        totalRevenue,
        lowStockCount,
        todaySales,
        todayRevenue,
        salesByDay,
        salesTrend,
        salesByCategory,
        recentSales,
        lowStockProducts,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.paySale = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "ចំនួនប្រាក់មិនត្រឹមត្រូវ",
      });
    }

    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "រកមិនឃើញវិក័យប័ត្រ",
      });
    }
    if (sale.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "វិក័យប័ត្រនេះបានបង់រួចហើយ",
      });
    }

    // 👉 បូកប្រាក់ថ្មី
    sale.amountReceived = Number(sale.amountReceived || 0) + Number(amount);

    const total = Number(sale.grandTotal || 0);

    // 👉 គណនា
    if (sale.amountReceived >= total) {
      sale.changeBack = sale.amountReceived - total;
      sale.dueAmount = 0;
      sale.paymentStatus = "paid";
    } else {
      sale.dueAmount = total - sale.amountReceived;
      sale.changeBack = 0;
      sale.paymentStatus = "partial";
    }

    await sale.save();

    res.json({
      success: true,
      message: "សងប្រាក់បានជោគជ័យ",
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
