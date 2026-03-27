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

      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const itemDiscount = Number(item.discount) || 0;

      if (qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `ចំនួនទំនិញមិនត្រឹមត្រូវសម្រាប់ ${product.name}`,
        });
      }

      if (product.stockQty < qty) {
        return res.status(400).json({
          success: false,
          message: `ស្តុកមិនគ្រប់សម្រាប់ ${product.name}`,
        });
      }

      const rawTotal = qty * price;
      const safeItemDiscount = Math.max(0, Math.min(itemDiscount, rawTotal));
      const total = rawTotal - safeItemDiscount;

      subtotal += total;

      normalizedItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price,
        discount: safeItemDiscount,
        total,
      });
    }

    const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100);
    const safeTax = Number((Number(tax) || 0).toFixed(2));
    const finalSubtotal = Number(subtotal.toFixed(2));
    const finalAmountReceived = Number((Number(amountReceived) || 0).toFixed(2));

    const discountAmount = Number(
      ((finalSubtotal * safeDiscount) / 100).toFixed(2)
    );

    const finalGrandTotal = Number(
      (finalSubtotal - discountAmount + safeTax).toFixed(2)
    );

    const changeBack = Number(
      Math.max(finalAmountReceived - finalGrandTotal, 0).toFixed(2)
    );

    const dueAmount = Number(
      Math.max(finalGrandTotal - finalAmountReceived, 0).toFixed(2)
    );

    let paymentStatus = "paid";
    if (finalAmountReceived <= 0) {
      paymentStatus = "unpaid";
    } else if (dueAmount > 0) {
      paymentStatus = "partial";
    }

    const sale = await Sale.create({
      invoiceNo: makeInvoiceNo(),
      items: normalizedItems,
      subtotal: finalSubtotal,
      discount: safeDiscount,
      discountAmount,
      tax: safeTax,
      grandTotal: finalGrandTotal,
      amountReceived: finalAmountReceived,
      changeBack,
      dueAmount,
      paymentStatus,
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