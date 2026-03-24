const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  const { products } = req.body;

  let total = 0;

  for (let item of products) {
    const product = await Product.findById(item.productId);
    total += product.price * item.quantity;

    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    products,
    totalPrice: total
  });

  res.json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("products.productId");
  res.json(orders);
};