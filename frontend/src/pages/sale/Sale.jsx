import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./sale.css";

function Sale() {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;



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
    setSelectedSale(sale);
    setShowReceipt(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?");
    if (!ok) return;

    try {
      await axiosInstance.delete(`/sale/${id}`);

      setSales((prev) => prev.filter((item) => item.id !== id));

      if (selectedSale?.id === id) {
        setSelectedSale(null);
        setShowReceipt(false);
      }

      alert("លុបបានជោគជ័យ");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "លុបមិនបាន");
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

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

      {showReceipt && selectedSale && (
        <div className="receipt-overlay">
          <div className="receipt-box">
            <h2 className="receipt-title">VT GARAGE</h2>
            <p className="receipt-sub">លេខវិក័យប័ត្រ</p>

            <div className="receipt-header-info">
              <p>វិក័យប័ត្រ: {selectedSale.invoice}</p>
              <p>អ្នកគិតប្រាក់: {selectedSale.seller}</p>
              <p>ថ្ងៃខែឆ្នាំ: {selectedSale.date}</p>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-items">


              {selectedSale.items?.length > 0 ? (
                selectedSale.items.map((item, index) => (
                  <div key={index} className="receipt-item">
                    <span>{item.name}</span>
                    <span>{item.qty}</span>
                    <span>${Number(item.total).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="receipt-empty">មិនមានទំនិញ</div>
              )}
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-summary">
              <div className="receipt-row">
                <span>ទឹកប្រាក់សរុប</span>
                <span>${Number(selectedSale.subtotal).toFixed(2)}</span>
              </div>

              <div className="receipt-row discount">
                <span>បញ្ចុះតម្លៃ ({selectedSale.discount}%)</span>
                <span>-${Number(selectedSale.discountAmount).toFixed(2)}</span>
              </div>

              <div className="receipt-row">
                <span>ពន្ធ​ Tax</span>
                <span>${Number(selectedSale.tax).toFixed(2)}</span>
              </div>

              <div className="receipt-row total">
                <span>តម្លៃសរុប</span>
                <span>${Number(selectedSale.total).toFixed(2)}</span>
              </div>

              <div className="receipt-total-row">
                <span>តម្លៃសរុបគិតជារៀល</span>
                <span>
                  ៛
                  {(Number(receiptData.total || 0) * exchangeRate).toLocaleString()}
                </span>
              </div>

              <div className="receipt-row">
                <span>ប្រាក់ទទួល</span>
                <span>${Number(selectedSale.amountReceived).toFixed(2)}</span>
              </div>

              <div className="receipt-row">
                <span>ទឹកប្រាក់ជំពាក់</span>
                <span>${Number(selectedSale.changeBack).toFixed(2)}</span>
              </div>

              {Number(selectedSale.dueAmount || 0) > 0 && (
                <div className="receipt-row">
                  <span>ប្រាក់អាប់</span>
                  <span>${Number(selectedSale.dueAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="receipt-row">
                <span>Status</span>
                <span>
                  {selectedSale.paymentStatus === "paid"
                    ? "បានបង់រួច"
                    : selectedSale.paymentStatus === "partial"
                      ? "បង់បានខ្លះ"
                      : "មិនទាន់បង់"}
                </span>
              </div>
            </div>

            <p className="receipt-thank">🙏 សូមអរគុណ!</p>

            <div className="receipt-actions">
              <button onClick={() => setShowReceipt(false)}>បិទ</button>
              <button onClick={() => window.print()}>🖨 Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sale;