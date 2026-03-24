import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./pos.css";

function Pos() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ទាំងអស់");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);

  const getCategories = async () => {
    try {
      const res = await axiosInstance.get("/category");
      setCategories(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញប្រភេទទំនិញបានទេ");
    }
  };

  const getProducts = async () => {
    try {
      const res = await axiosInstance.get("/product");
      setProducts(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញទំនិញបានទេ");
    }
  };

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        activeCategory === "ទាំងអស់" || item.category === activeCategory;

      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item._id === product._id);

      if (found) {
        if (found.qty >= found.stock) {
          alert("ស្តុកមិនគ្រប់");
          return prev;
        }

        return prev.map((item) =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: Number(product.salePrice) || 0,
          stock: Number(product.stockQty) || 0,
          image: product.image || "",
          qty: 1,
        },
      ];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          if (item.qty >= item.stock) {
            alert("ស្តុកមិនគ្រប់");
            return item;
          }
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      })
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100);
  const safeTax = Number(tax) || 0;
  const safeAmountReceived = Number(amountReceived) || 0;

  const discountAmount = (subtotal * safeDiscount) / 100;
  const grandTotal = subtotal - discountAmount + safeTax;
  const changeBack = Math.max(safeAmountReceived - grandTotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("សូមជ្រើសទំនិញជាមុន");
      return;
    }

    if (safeAmountReceived < grandTotal) {
      alert("ប្រាក់ទទួលមិនគ្រប់");
      return;
    }

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        discount: safeDiscount,
        tax: safeTax,
        amountReceived: safeAmountReceived,
        cashier: "Cashier",
      };

      const res = await axiosInstance.post("/sale", payload);
      const sale = res.data.data;

      setReceiptData({
        invoice: sale.invoiceNo,
        date: new Date(sale.createdAt).toLocaleString(),
        items: sale.items || [],
        subtotal: sale.subtotal || 0,
        discount: sale.discount || 0,
        discountAmount: sale.discountAmount || 0,
        tax: sale.tax || 0,
        total: sale.grandTotal || 0,
        amountReceived: sale.amountReceived || 0,
        changeBack: sale.changeBack || 0,
      });

      setShowReceipt(true);
      await getProducts();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "បង់ប្រាក់មិនបាន");
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
  };

  const finishSale = () => {
    setCart([]);
    setDiscount(0);
    setTax(0);
    setAmountReceived(0);
    setReceiptData(null);
    setShowReceipt(false);
  };
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="pos-page">
      <div className="pos-left">
        <h2 className="pos-title">ផ្ទាំងការលក់</h2>

        <div className="pos-product-box">
          <h3 className="section-title">ប្រភេទទំនិញ</h3>

          <input
            type="text"
            className="pos-search"
            placeholder="ស្វែងរកទំនិញ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="category-tabs">
            <button
              className={`category-btn ${activeCategory === "ទាំងអស់" ? "active-category" : ""
                }`}
              onClick={() => setActiveCategory("ទាំងអស់")}
            >
              ទាំងអស់
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`category-btn ${activeCategory === cat.name ? "active-category" : ""
                  }`}
                onClick={() => setActiveCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <div
                key={item._id}
                className="product-card"
                onClick={() => addToCart(item)}
              >
                <div className="product-images">
                  {item.image ? (
                    <img
                      src={`http://localhost:8000${item.image}`}
                      alt={item.name}
                      className="product-images"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="no-image-box"
                    style={{ display: item.image ? "none" : "flex" }}
                  >
                    No Image
                  </div>
                </div>

                <div className="product-info">
                  <div className="product-name">
                    {item.name}{" "}
                    <span className="stock-text">x{item.stockQty}</span>
                  </div>
                  <div className="product-price">
                    ${(Number(item.salePrice) || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">មិនមានទំនិញ</div>
          )}
        </div>
      </div>

      <div className="pos-right">
        <h3 className="cart-title">ទំនិញក្នុងកន្ត្រក</h3>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="empty-cart">មិនទាន់មានទំនិញ</div>
          ) : (
            cart.map((item) => (
              <div className="cart-row" key={item._id}>
                <div className="cart-name">{item.name}</div>

                <div className="cart-qty-box">
                  <button
                    className="qty-btn"
                    onClick={() => decreaseQty(item._id)}
                  >
                    -
                  </button>
                  <span className="qty-number">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => increaseQty(item._id)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-price">
                  ${(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span>ចំនួនសរុប</span>
            <span className="total-price">${subtotal.toFixed(2)}</span>
          </div>

          <div className="cart-total-row">
            <span>បញ្ចុះតម្លៃ (%)</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>

          <div className="cart-total-row">
            <span>ចំនួនTax</span>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="cart-total-row">
            <span>ទឹកប្រាក់សរុប</span>
            <span className="total-price">${grandTotal.toFixed(2)}</span>
          </div>

          <div className="cart-total-row">
            <span>ចំនួនទឹកប្រាក់ទទួល</span>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="cart-total-row">
            <span>ចំនួនទឹកប្រាក់ត្រលប់</span>
            <span className="total-price">${changeBack.toFixed(2)}</span>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            បង់ប្រាក់
          </button>
        </div>
      </div>

      {showReceipt && receiptData && (
        <div className="receipt-overlay">
          <div className="receipt-box">
            <h1 className="receipt-title">MASTERIT POS</h1>

            <div className="receipt-head">
              <div className="receipt-left">
                <h3>វិក័យប័ត្រ</h3>
              </div>

              <div className="receipt-right">
                <p>កាលបរិច្ឆេទ: {receiptData.date}</p>
                <p>លេខ: {receiptData.invoice}</p>
              </div>
            </div>

            <div className="receipt-table">
              <div className="receipt-row receipt-header-row">
                <span>មុខម្ហូប</span>
                <span>ចំនួន</span>
                <span>តម្លៃ</span>
              </div>
              <div className="receipt-rowLigh">
                {receiptData.items && receiptData.items.length > 0 ? (
                  receiptData.items.map((item, index) => (
                    <div
                      className="receipt-row"
                      key={item.productId || item._id || index}
                    >
                      <span>{item.name}</span>
                      <span>{item.qty}</span>
                      <span>
                        ${Number(item.total || item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="receipt-row">
                    <span>មិនមានទំនិញ</span>
                    <span>-</span>
                    <span>-</span>
                  </div>
                )}
              </div>
            </div>

            <div className="receipt-row receipt-total-row">
              <span></span>
              <span>ទឹកប្រាក់សរុប</span>
              <span>${Number(receiptData.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="receipt-row receipt-total-row">
              <span></span>
              <span>បញ្ចុះតម្លៃ ({receiptData.discount || 0}%)</span>
              <span>
                -${Number(receiptData.discountAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="receipt-row receipt-total-row">
              <span></span>
              <span>ពន្ធ</span>
              <span>${Number(receiptData.tax || 0).toFixed(2)}</span>
            </div>

            <div className="receipt-row receipt-total-row">
              <span></span>
              <span>ចំនួនសរុប</span>
              <span>${Number(receiptData.total || 0).toFixed(2)}</span>
            </div>

            <div className="receipt-row receipt-total-row">
              <span></span>
              <span>ប្រាក់ទទួល</span>
              <span>${Number(receiptData.amountReceived || 0).toFixed(2)}</span>
            </div>

            <div className="receipt-row receipt-total-row">
              <span></span>
              <span>ប្រាក់អាប់</span>
              <span>${Number(receiptData.changeBack || 0).toFixed(2)}</span>
            </div>

            <p className="receipt-thank">សូមអរគុណ!</p>

            <div className="receipt-buttons">
              <button className="receipt-close-btn" onClick={closeReceipt}>
                បិទ
              </button>
              <button className="receipt-finish-btn" onClick={finishSale}>
                រួចរាល់
              </button>
              <button className="receipt-print-btn" onClick={handlePrint}>
                🖨️ បោះពុម្ព
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pos;