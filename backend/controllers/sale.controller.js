const Sale = require("../models/Sale");
const Product = require("../models/Product");

const makeInvoiceNo = () => {
  return "INV-" + Date.now();
};

exports.getSales = async (req, res) => {
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

exports.createSale = async (req, res) => {
  try {
    const {
      items = [],
      discount = 0,
      tax = 0,
      amountReceived = 0,
      cashier = "",
    } = req.body;

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "មិនមានទំនិញក្នុងកន្ត្រក",
      });
    }

    let subtotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `រកមិនឃើញទំនិញ ${item.name}`,
        });
      }

      if (product.stockQty < item.qty) {
        return res.status(400).json({
          success: false,
          message: `ស្តុកមិនគ្រប់សម្រាប់ ${product.name}`,
        });
      }

      const qty = Number(item.qty);
      const price = Number(item.price);
      const total = qty * price;

      subtotal += total;

      normalizedItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price,
        total,
      });
    }

    const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100);
    const safeTax = Number(tax) || 0;
    const safeAmountReceived = Number(amountReceived) || 0;

    const discountAmount = (subtotal * safeDiscount) / 100;
    const grandTotal = subtotal - discountAmount + safeTax;
    const changeBack = safeAmountReceived - grandTotal;

    if (safeAmountReceived < grandTotal) {
      return res.status(400).json({
        success: false,
        message: "ប្រាក់ដែលទទួលមិនគ្រប់",
      });
    }

    const sale = await Sale.create({
      invoiceNo: makeInvoiceNo(),
      items: normalizedItems,
      subtotal,
      discount: safeDiscount,
      discountAmount,
      tax: safeTax,
      grandTotal,
      amountReceived: safeAmountReceived,
      changeBack,
      cashier,
    });

    for (const item of normalizedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQty: -item.qty },
      });
    }

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "រកមិនឃើញការលក់",
      });
    }

    // restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQty: item.qty },
      });
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "លុបបានជោគជ័យ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};