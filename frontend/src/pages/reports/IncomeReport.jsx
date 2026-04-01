import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./IncomeReport.css";

function IncomeReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [paidStatus, setPaidStatus] = useState({});


  const rowsPerPage = 10;

  const getIncomeReport = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/report/income");
      setRows(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញទិន្នន័យរបាយការណ៍ចំណូលបានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIncomeReport();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return rows.filter((item) => {
      const invoiceNo = item.invoiceNo?.toLowerCase() || "";
      const cashier = item.cashier?.toLowerCase() || "";
      const matchSearch =
        invoiceNo.includes(keyword) || cashier.includes(keyword);

      const itemDate = item.createdAt ? new Date(item.createdAt) : null;
      if (!itemDate) return false;

      const matchFrom = fromDate ? itemDate >= new Date(fromDate) : true;

      const matchTo = toDate
        ? itemDate <= new Date(toDate + "T23:59:59")
        : true;

      const matchMonth = selectedMonth
        ? `${itemDate.getFullYear()}-${String(
          itemDate.getMonth() + 1
        ).padStart(2, "0")}` === selectedMonth
        : true;

      return matchSearch && matchFrom && matchTo && matchMonth;
    });
  }, [rows, search, fromDate, toDate, selectedMonth]);

  const totalIncome = useMemo(() => {
    return filteredRows.reduce(
      (sum, item) => sum + Number(item.grandTotal || 0),
      0
    );
  }, [filteredRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate, selectedMonth]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      alert("មិនមានទិន្នន័យសម្រាប់ Export");
      return;
    }

    const headers = [
      "No",
      "Invoice",
      "Cashier",
      "Subtotal",
      "Discount",
      "Tax",
      "Grand Total",
      "Amount Received",
      "Amount Due",
      "Change Back",
      "Date",
    ];

    const csvRows = filteredRows.map((item, index) => {
      const subtotal = Number(item.subtotal || 0);
      const discountAmount = subtotal * (Number(item.discount || 0) / 100);
      const tax = Number(item.tax || 0);
      const totalToPay = subtotal - discountAmount + tax;
      const received = Number(item.amountReceived || 0);

      const amountDue = received < totalToPay ? totalToPay - received : 0;
      const changeBack = received > totalToPay ? received - totalToPay : 0;

      return [
        index + 1,
        item.invoiceNo || "",
        item.cashier || "",
        subtotal.toFixed(2),
        discountAmount.toFixed(2),
        tax.toFixed(2),
        totalToPay.toFixed(2),
        received.toFixed(2),
        amountDue.toFixed(2),
        changeBack.toFixed(2),
        item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      ];
    });

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((col) => `"${col}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "income-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredRows.length === 0) {
      alert("មិនមានទិន្នន័យសម្រាប់ Export");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Income Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [
        [
          "No",
          "Invoice",
          "Cashier",
          "Subtotal",
          "Discount",
          "Tax",
          "Grand Total",
          "Amount Received",
          "Amount Due",
          "Change Back",
          "Date",
        ],
      ],
      body: filteredRows.map((item, index) => {
        const subtotal = Number(item.subtotal || 0);
        const discountAmount = subtotal * (Number(item.discount || 0) / 100);
        const tax = Number(item.tax || 0);
        const totalToPay = subtotal - discountAmount + tax;
        const received = Number(item.amountReceived || 0);

        const amountDue = received < totalToPay ? totalToPay - received : 0;
        const changeBack = received > totalToPay ? received - totalToPay : 0;

        return [
          index + 1,
          item.invoiceNo || "",
          item.cashier || "",
          `$${subtotal.toFixed(2)}`,
          `$${discountAmount.toFixed(2)}`,
          `$${tax.toFixed(2)}`,
          `$${totalToPay.toFixed(2)}`,
          `$${received.toFixed(2)}`,
          `$${amountDue.toFixed(2)}`,
          `$${changeBack.toFixed(2)}`,
          item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
        ];
      }),
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    doc.save("income-report.pdf");
  };

  const totalPaid = useMemo(() => {
    return filteredRows.reduce(
      (sum, item) => sum + Number(item.amountReceived || 0),
      0
    );
  }, [filteredRows]);

  const [payments, setPayments] = useState({});
  const handlePaymentChange = (id, value) => {
    setPayments((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
 const handleSubmitPayment = async (id, amountDue) => {
  if (!amountDue || amountDue <= 0) {
    alert("គ្មានប្រាក់ត្រូវសង");
    return;
  }

  try {
    await axiosInstance.post(`/report/sale/pay/${id}`, {
      amount: amountDue,
    });

    alert("សងប្រាក់បានជោគជ័យ");
    getIncomeReport();
  } catch (error) {
    console.log(error);
    alert("មានបញ្ហាក្នុងការសងប្រាក់");
  }
};

  return (
    <div className="income-page">
      <div className="income-header">
        <h2>របាយការណ៍ចំណូល</h2>
      </div>

      <div className="income-top-cards">
        <div className="summary-card ">
          <div className="top-card">
            <p>ចំនួនវិក្កយបត្រ</p>
            <h3>{filteredRows.length}</h3>
          </div>
        </div>
        <div className="summary-card ">
          <div className="top-card danger-card">
            <p>ចំណូលសរុប</p>
            <h3>${totalIncome.toFixed(2)}</h3>
          </div></div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="ស្វែងរកតាម Invoice ឬ Cashier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="filter-input"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="filter-input"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />



        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setFromDate("");
            setToDate("");
            setSelectedMonth("");
          }}
        >
          ទាំងអស់
        </button>

        <button className="print-btn" onClick={handlePrint}>
          🖨 Print
        </button>

        <button className="csv-btn" onClick={handleExportCSV}>
          📄 CSV
        </button>

        <button className="pdf-btn" onClick={handleExportPDF}>
          📑 PDF
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
                  <th>លេខវិក័យប័ត្រ</th>
                  <th>អ្នកគិតលុយ</th>
                  <th>ទឹកប្រាក់សរុប</th>
                  <th>បញ្ចុះតម្លៃ</th>
                  <th>ពន្ធ</th>
                  <th>ទឹកប្រាក់សរុបត្រូវបង់</th>
                  <th>ទឹកប្រាក់ទទួលបាន</th>
                  <th>ទឹកប្រាក់ជំពាក់</th>
                  <th>ប្រាក់សង</th>
                  <th>ទឹកប្រាក់អាប់</th>
                  <th>កាលបរិច្ឆេទ</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((item, index) => {
                    const subtotal = Number(item.subtotal || 0);
                    const discountAmount = subtotal * (Number(item.discount || 0) / 100);
                    const tax = Number(item.tax || 0);
                    const totalAfterDiscount = subtotal - discountAmount;
                    const totalToPay = totalAfterDiscount + tax;
                    const amountReceived = Number(item.amountReceived || 0);



                    //  ជំពាក់
                    const amountDue = amountReceived < totalToPay
                      ? totalToPay - amountReceived
                      : 0;

                    // ប្រាក់សង (Paid)
                    const isPaid = item.paymentStatus === "paid" || paidStatus[item._id];
                    //  អាប់

                    const changeBack = amountReceived > totalToPay
                      ? amountReceived - totalToPay
                      : 0;

                    return (
                      <tr key={item._id}>
                        <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td>{item.invoiceNo}</td>
                        <td>{item.cashier}</td>

                        {/* ទឹកប្រាក់សរុប */}
                        <td>${subtotal.toFixed(2)}</td>

                        {/* បញ្ចុះតម្លៃ (amount) */}
                        <td>-${discountAmount.toFixed(2)}</td>

                        {/* ពន្ធ */}
                        <td>${tax.toFixed(2)}</td>

                        {/* ទឹកប្រាក់សរុបត្រូវបង់ */}
                        <td>${totalToPay.toFixed(2)}</td>

                        {/* ទឹកប្រាក់ទទួលបាន */}
                        <td>${Number(item.amountReceived || 0).toFixed(2)}</td>

                        {/* ទឹកប្រាក់ជំពាក់ */}
                        {/* <td>${Number(item.AmountDue || 0).toFixed(2)}</td> */}
                        <td>${amountDue.toFixed(2)}</td>

                        {/* ទឹកប្រាក់សង */}
                        <td>
                          {/* បង្ហាញចំនួនត្រូវសង */}
                          <div
                            style={{
                              marginBottom: "5px",
                              fontWeight: "bold",
                              color: amountDue > 0 ? "red" : "green"
                            }}
                          >
                            ${amountDue.toFixed(2)}
                          </div>

                          {/* ប៊ូតុងសង */}
                          <button
                            onClick={() => handleSubmitPayment(item._id, amountDue)}
                            disabled={isPaid || amountDue === 0}
                            style={{
                              background: isPaid ? "green" : "#4CAF50",
                              color: "#fff",
                              padding: "5px 10px",
                              border: "none",
                              borderRadius: "5px",
                              cursor: isPaid ? "not-allowed" : "pointer"
                            }}
                          >
                            {isPaid ? "សងរួច" : "សង"}
                          </button>
                        </td>


                        {/* ទឹកប្រាក់អាប់ */}
                        <td>${Number(item.changeBack || 0).toFixed(2)}</td>

                        {/* កាលបរិច្ឆេទ */}
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11">គ្មានទិន្នន័យ</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="income-footer">
              <span>
                ទំព័រ {currentPage}/{totalPages}
              </span>

              <div className="income-pagination">
                <button
                  className="income-page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`income-page-btn ${currentPage === i + 1 ? "income-active-page" : ""
                      }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="income-page-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >

                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IncomeReport;