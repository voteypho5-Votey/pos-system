const router = require("express").Router();
const {
  getSales,
  createSale,
  deleteSale,
} = require("../controllers/sale.controller");

const { protect, isAdmin } = require("../middleware/auth.middleware");

router.get("/", protect, getSales);
router.post("/", protect, createSale);
router.delete("/:id", protect, isAdmin, deleteSale);

module.exports = router;