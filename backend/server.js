const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const categoryRoute = require("./routes/category.route");
const saleRoute = require("./routes/sale.route");
const reportRoute = require("./routes/report.route");


const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/sale", saleRoute);
app.use("/api/report", reportRoute);
app.use("/api/stock-report", reportRoute);

app.get("/", (req, res) => {
  res.send("MASTERIT POS API running...");
});

mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});