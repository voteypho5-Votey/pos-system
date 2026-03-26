import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./StockReport.css";

function StockReport() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const getStockStatus = (stockQty) => {
    const qty = Number(stockQty) || 0;

    if (qty === 0) return "Out of Stock";
    if (qty <= 5) return "Low Stock";
    return "In Stock";
  };

  const getStockReport = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/report/stock");
      setRows(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញ Stock Report បានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStockReport();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return rows.filter((item) => {
      const nameMatch = (item.name || "").toLowerCase().includes(keyword);
      const codeMatch = (item.code || "").toLowerCase().includes(keyword);
      const categoryMatch = (item.category || "").toLowerCase().includes(keyword);

      const status = getStockStatus(item.stockQty);
      const statusMatch = statusFilter ? status === statusFilter : true;

      return (nameMatch || codeMatch || categoryMatch) && statusMatch;
    });
  }, [rows, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalProducts = filteredRows.length;

  const lowStockCount = filteredRows.filter(
    (item) => Number(item.stockQty) > 0 && Number(item.stockQty) <= 5
  ).length;

  const outOfStockCount = filteredRows.filter(
    (item) => Number(item.stockQty) === 0
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      alert("មិនមានទិន្នន័យសម្រាប់ Export");
      return;
    }

    const headers = [
      "ល.រ",
      "ឈ្មោះទំនិញ",
      "ប្រភេទទំនិញ",
      "កូដ",
      "ថ្លៃដើម",
      "ថ្លៃលក់",
      "ស្តុកនៅសល់",
      "ស្ថានភាព",
    ];
    const getStockStatus = (stockQty) => {
      const qty = Number(stockQty) || 0;
      if (qty === 0) return "អស់ពីស្តុក";
      if (qty <= 5) return "ស្តុកជិតអស់";
      return "មានក្នុងស្តុក";
    };

    const csvRows = filteredRows.map((item, index) => [
      index + 1,
      item.name || "",
      item.category || "",
      item.code || "",
      Number(item.costPrice || 0).toFixed(2),
      Number(item.salePrice || 0).toFixed(2),
      item.stockQty || 0,
      getStockStatus(item.stockQty),
    ]);
    const toKhmerNumber = (value) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return String(value).replace(/\d/g, (d) => khmerDigits[d]);
    };
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    // ✅ UTF-8 BOM សម្រាប់អក្សរខ្មែរ
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stock-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };




  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="stock-page">
      <div className="stock-header">
        <h2>របាយការណ៍ស្តុក</h2>
      </div>

      <div className="stock-top-cards">
        <div className="summary-card">
          <div className="top-card">
            <p>ចំនួនទំនិញសរុប</p>
            <h3>{totalProducts}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="top-card warning-card">
            <p>ស្តុកជិតអស់</p>
            <h3>{lowStockCount}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="top-card danger-card">
            <p>អស់ពីស្តុក</p>
            <h3>{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="ស្វែងរកតាមឈ្មោះទំនិញ / កូដ / ប្រភេទ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">ស្ថានភាពទាំងអស់</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setStatusFilter("");
          }}
        >
          សម្អាត
        </button>

        <button className="print-btn" onClick={handlePrint}>
          Print
        </button>

        <button className="csv-btn" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      <div className="table-wrapper print-area">
        {loading ? (
          <div className="loading-box">កំពុងទាញទិន្នន័យ...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ល.រ</th>
                  <th>រូបភាព</th>
                  <th>ឈ្មោះទំនិញ</th>
                  <th>ប្រភេទទំនិញ</th>
                  <th>កូដ</th>
                  <th>ថ្លៃដើម</th>
                  <th>ថ្លៃលក់</th>
                  <th>ស្តុកនៅសល់</th>
                  <th>ស្ថានភាព</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((item, index) => {
                    const status = getStockStatus(item.stockQty);

                    return (
                      <tr key={item._id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          <div className="product-image-box">
                            {item.image ? (
                              <img
                                src={`https://pos-system-ofv8.onrender.com${item.image}`}
                                alt={item.name}
                                className="product-image"
                              />
                            ) : (
                              <span className="no-image">No Image</span>
                            )}
                          </div>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.code}</td>
                        <td>${Number(item.costPrice || 0).toFixed(2)}</td>
                        <td>${Number(item.salePrice || 0).toFixed(2)}</td>
                        <td className="stock-qty">{item.stockQty}</td>
                        <td>
                          <span
                            className={`status-badge ${status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="no-data">
                      មិនមានទិន្នន័យ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="stock-footer">
              <span>
                ទំព័រ {currentPage}/{totalPages}
              </span>

              <div className="stock-pagination">
                <button
                  className="stock-page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`stock-page-btn ${currentPage === i + 1 ? "stock-active-page" : ""
                      }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="stock-page-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StockReport;