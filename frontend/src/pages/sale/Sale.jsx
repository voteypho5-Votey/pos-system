import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import logo from "../../assets/logo vt.jpg";
import "./sale.css";

function Sale() {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  // const [receiptData, setSelectedSale] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [exchangeRate, setExchangeRate] = useState(4100);

  // useEffect(() => {
  //   axios.get("/api/exchange-rate").then(res => {
  //     setExchangeRate(res.data.rate);
  //   });
  // }, []);

  const getSales = async () => {
    try {
      const res = await axiosInstance.get("/sale");
      const apiSales = (res.data.data || []).map((item) => ({
        id: item._id,
        invoice: item.invoiceNo,
        seller: item.cashier || "Cashier",
        total: Number(item.grandTotal || 0),
        date: new Date(item.createdAt).toLocaleString(),
        items: item.items || [],
        subtotal: item.subtotal || 0,
        discount: item.discount || 0,
        discountAmount: item.discountAmount || 0,
        tax: item.tax || 0,
        amountReceived: item.amountReceived || 0,
        changeBack: item.changeBack || 0,
        dueAmount: item.dueAmount || 0,
        paymentStatus: item.paymentStatus || "paid",
      }));
      setSales(apiSales);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញទិន្នន័យការលក់បានទេ");
    }
  };

  useEffect(() => {
    getSales();
  }, []);

  const filteredSales = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return sales.filter(
      (item) =>
        item.invoice.toLowerCase().includes(keyword) ||
        item.seller.toLowerCase().includes(keyword) ||
        String(item.total).includes(keyword) ||
        item.date.toLowerCase().includes(keyword)
    );
  }, [sales, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / rowsPerPage));

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredSales.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSales, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleView = (sale) => {
    setReceiptData(sale);
    setShowReceipt(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?");
    if (!ok) return;

    try {
      await axiosInstance.delete(`/sale/${id}`);

      setSales((prev) => prev.filter((item) => item.id !== id));

      if (receiptData?.id === id) {
        setReceiptData(null);
        setShowReceipt(false);
      }

      alert("លុបបានជោគជ័យ");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "លុបមិនបាន");
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // const handlePrint = () => {
  //   const el = document.getElementById("print-receipt");
  //   if (!el) return;

  //   const printContents = el.innerHTML;
  //   const originalContents = document.body.innerHTML;

  //   document.body.innerHTML = printContents;
  //   window.print();
  //   document.body.innerHTML = originalContents;

  //   window.location.reload();
  // };
  const handlePrint = () => {
  window.print();
};

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  return (
    <div className="sale-content">
      <div className="sale-page-header">
        <h2>បញ្ជីការលក់</h2>
      </div>

      <div className="sale-table-card">
        <div className="sale-table-tools">
          <div className="sale-search-wrap">
            <input
              className="sale-search-box"
              type="text"
              placeholder="សូមបញ្ចូល ពាក្យ:"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="sale-search-icon">⌕</span>
          </div>
        </div>

        <table className="sale-table">
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>លេខវិក័យប័ត្រ</th>
              <th>លក់ដោយ</th>
              <th>ចំនួនសរុប</th>
              <th>កាលបរិច្ឆេទ</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>

          <tbody>
            {paginatedSales.length > 0 ? (
              paginatedSales.map((item, index) => (
                <tr key={item.id}>
                  <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{item.invoice}</td>
                  <td>{item.seller}</td>
                  <td className="sale-total">
                    ${Number(item.total).toFixed(2)}
                  </td>
                  <td>{item.date}</td>
                  <td style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="sale-view-btn"
                      onClick={() => handleView(item)}
                    >
                      👁 មើលលំអិត
                    </button>
                    {currentUser?.role === "admin" && (
                      <button
                        className="sale-delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        លុប
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="sale-no-data">
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="sale-footer">
          <span>
            ទំព័រ {currentPage}/{totalPages}
          </span>

          <div className="sale-pagination">
            <button
              className="sale-page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`sale-page-btn ${currentPage === i + 1 ? "sale-active-page" : ""
                  }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="sale-page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {showReceipt && receiptData && (
        <div className="receipt-overlay">
          <div className="receipt-box" id="print-receipt">
            <div className="receipt-brand">
              <div className="logo">
                <img src={logo} alt="Logo" width="70" height="70" />
                <h1 className="receipt-title">VT GARAGE</h1>
              </div>

              <p className="receipt-subtitle">វិក័យប័ត្រទូទាត់</p>
            </div>

            <div className="receipt-head">
              <div className="receipt-left">
                <h3>ព័ត៌មានវិក័យប័ត្រ</h3>
                <p>លេខវិក័យប័ត្រ: {receiptData.invoice}</p>
                <p>កាលបរិច្ឆេទ: {receiptData.date}</p>
              </div>

              <div className="receipt-right">
                <p>
                  ស្ថានភាព៖{" "}
                  <span
                    className={`status-badge ${receiptData.paymentStatus === "paid"
                      ? "paid"
                      : receiptData.paymentStatus === "partial"
                        ? "partial"
                        : "unpaid"
                      }`}
                  >
                    {receiptData.paymentStatus === "paid"
                      ? "បានបង់រួច"
                      : receiptData.paymentStatus === "partial"
                        ? "បង់បានខ្លះ"
                        : "មិនទាន់បង់"}
                  </span>
                </p>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-table">
              <div className="receipt-header-row">
                <span>មុខទំនិញ</span>
                <span>ចំនួន</span>
                <span>តម្លៃរាយ</span>
                <span>បញ្ចុះតម្លៃ</span>
                <span>សរុប</span>
              </div>

              <div className="receipt-rowLigh">
                {receiptData.items && receiptData.items.length > 0 ? (
                  receiptData.items.map((item, index) => {
                    const qty = Number(item.qty || 0);
                    const price = Number(item.price || 0);
                    const rowTotal = price * qty;
                    const rowDiscount = Number(item.discount || 0);
                    const rowFinal = Number(item.total || rowTotal - rowDiscount);

                    return (
                      <div
                        className="receipt-row"
                        key={item.productId || item._id || index}
                      >
                        <span className="receipt-item-name">{item.name}</span>
                        <span>{qty}</span>
                        <span>${price.toFixed(2)}</span>
                        <span>{rowDiscount > 0 ? `$${rowDiscount.toFixed(2)}` : "-"}</span>
                        <span>${rowFinal.toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="receipt-row">
                    <span>មិនមានទំនិញ</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                  </div>
                )}
              </div>
            </div>


            <div className="receipt-summary">
              <div className="receipt-total-row">
                <span>ទឹកប្រាក់សរុប</span>
                <span>${Number(receiptData.subtotal || 0).toFixed(2)}</span>
              </div>

              <div className="receipt-total-row">
                <span>បញ្ចុះតម្លៃ ({receiptData.discount || 0}%)</span>
                <span>- ${Number(receiptData.discountAmount || 0).toFixed(2)}</span>
              </div>

              <div className="receipt-total-row">
                <span>ពន្ធ</span>
                <span>${Number(receiptData.tax || 0).toFixed(2)}</span>
              </div>

              <div className="receipt-total-row grand-row">
                <span>តម្លៃសរុប</span>
                <span>${Number(receiptData.total || 0).toFixed(2)}</span>
              </div>

              <div className="receipt-total-row">
                <span>តម្លៃសរុបគិតជារៀល</span>
                <span>
                  ៛
                  {Math.round(Number(receiptData.total || 0) * exchangeRate)}
                  {/* {Math.round(Number(receiptData.total || 0) * exchangeRate).toLocaleString()} */}
                </span>
              </div>
              {/* ================== */}
              <div className="receipt-total-row">
                <span>ប្រាក់ទទួល</span>
                <span>${Number(receiptData.amountReceived || 0).toFixed(2)}</span>
              </div>

              {Number(receiptData.dueAmount || 0) > 0 && (
                <div className="receipt-total-row due-row">
                  <span>ទឹកប្រាក់ជំពាក់</span>
                  <span>${Number(receiptData.dueAmount || 0).toFixed(2)}</span>
                </div>
              )}

              {Number(receiptData.changeBack || 0) > 0 && (
                <div className="receipt-total-row change-row">
                  <span>ប្រាក់អាប់</span>
                  <span>${Number(receiptData.changeBack || 0).toFixed(2)}</span>
                </div>
              )}

              <div className="receipt-footer-note">
                <p>សូមអរគុណសម្រាប់ការទិញទំនិញ</p>
                <p>ទំនាក់ទំនង: 012 345 678</p>
              </div>
            </div>



            <div className="receipt-buttons">
              <button className="receipt-close-btn" onClick={closeReceipt}>
                បិទ
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

export default Sale;