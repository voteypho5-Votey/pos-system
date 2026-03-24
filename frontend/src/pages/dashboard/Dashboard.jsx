// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../services/axiosInstance";
// import "./dashboard.css";

// function Dashboard() {
//   const [summary, setSummary] = useState({
//     totalProducts: 0,
//     totalSales: 0,
//     totalRevenue: 0,
//     lowStockCount: 0,
//   });



//   const [loading, setLoading] = useState(false);

//   const getDashboardSummary = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get("/report/dashboard-summary");
//       setSummary(res.data.data || {});
//     } catch (error) {
//       console.log(error);
//       alert("មិនអាចទាញ Dashboard Summary បានទេ");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getDashboardSummary();
//   }, []);

//   return (
//     <div className="dashboard-page">
//       <div className="dashboard-header">
//         <h2>ផ្ទាំងគ្រប់គ្រង</h2>
//       </div>

//       {loading ? (
//         <div className="dashboard-loading">កំពុងទាញទិន្នន័យ...</div>
//       ) : (
//         <div className="summary-grid">
//           <div className="summary-card revenue-card">
//             <div className="summary-title">ចំណូលសរុប</div>
//             <div className="summary-value">
//               ${Number(summary.totalRevenue || 0).toFixed(2)}
//             </div>
//           </div>

//           <div className="summary-card products-card">
//             <div className="summary-title">ទំនិញសរុប</div>
//             <div className="summary-value">{summary.totalProducts || 0}</div>
//           </div>

//           <div className="summary-card sales-card">
//             <div className="summary-title">ការលក់សរុប</div>
//             <div className="summary-value">{summary.totalSales || 0}</div>
//           </div>

//           <div className="summary-card stock-card">
//             <div className="summary-title">ស្តុកជិតអស់</div>
//             <div className="summary-value">{summary.lowStockCount || 0}</div>
//           </div>
//         </div>
//       )}

//       <div className="bord">
//         hi
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
// ===================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "./dashboard.css";



import {
  FaDollarSign,
  FaBoxOpen,
  FaShoppingCart,
  FaExclamationTriangle,
  FaArrowUp,
  FaClipboardList,
  FaPlusCircle,
  FaCashRegister,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    summary: {
      totalProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      lowStockCount: 0,
      todaySales: 0,
      todayRevenue: 0,
    },
    salesByDay: [
      { day: "Mon", total: 120 },
      { day: "Tue", total: 180 },
      { day: "Wed", total: 90 },
      { day: "Thu", total: 210 },
      { day: "Fri", total: 160 },
      { day: "Sat", total: 250 },
      { day: "Sun", total: 140 },
    ],
    salesTrend: [
      { month: "Jan", total: 800 },
      { month: "Feb", total: 950 },
      { month: "Mar", total: 1200 },
      { month: "Apr", total: 1100 },
      { month: "May", total: 1400 },
      { month: "Jun", total: 1700 },
    ],
    salesByCategory: [
      { name: "ភេសជ្ជៈ", total: 12 },
      { name: "អាហារ", total: 8 },
      { name: "គ្រឿងប្រើប្រាស់", total: 6 },
      { name: "ផ្សេងៗ", total: 4 },
    ],
    recentSales: [
      {
        _id: "1",
        invoiceNo: "INV-001",
        customerName: "Walk-in",
        totalAmount: 12,
        createdAt: new Date(),
      },
      {
        _id: "2",
        invoiceNo: "INV-002",
        customerName: "Chanthy",
        totalAmount: 8.5,
        createdAt: new Date(),
      },
    ],
    lowStockProducts: [
      { _id: "1", name: "Coca Cola", stockQty: 2, category: "Drink" },
      { _id: "2", name: "Pepsi", stockQty: 3, category: "Drink" },
    ],
    topProducts: [
      { _id: "1", name: "Coca Cola", soldQty: 25 },
      { _id: "2", name: "Pepsi", soldQty: 18 },
      { _id: "3", name: "Water", soldQty: 12 },
    ],
  });

  const [loading, setLoading] = useState(false);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/report/dashboard-summary");
      const data = res.data?.data;

      if (data) {
        setDashboard((prev) => ({
          ...prev,
          summary: {
            totalProducts: data.totalProducts || 0,
            totalSales: data.totalSales || 0,
            totalRevenue: data.totalRevenue || 0,
            lowStockCount: data.lowStockCount || 0,
            todaySales: data.todaySales || 0,
            todayRevenue: data.todayRevenue || 0,
          },
          salesByDay:
            Array.isArray(data.salesByDay) && data.salesByDay.length > 0
              ? data.salesByDay
              : prev.salesByDay,
          salesTrend:
            Array.isArray(data.salesTrend) && data.salesTrend.length > 0
              ? data.salesTrend
              : prev.salesTrend,
          salesByCategory:
            Array.isArray(data.salesByCategory) && data.salesByCategory.length > 0
              ? data.salesByCategory
              : prev.salesByCategory,
          recentSales:
            Array.isArray(data.recentSales) && data.recentSales.length > 0
              ? data.recentSales
              : prev.recentSales,
          lowStockProducts:
            Array.isArray(data.lowStockProducts) && data.lowStockProducts.length > 0
              ? data.lowStockProducts
              : prev.lowStockProducts,
          topProducts:
            Array.isArray(data.topProducts) && data.topProducts.length > 0
              ? data.topProducts
              : prev.topProducts,
        }));
      }
    } catch (error) {
      console.log("Dashboard error:", error);
      alert("មិនអាចទាញទិន្នន័យ Dashboard បានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const salesBarData = {
    labels: dashboard.salesByDay.map((item) => item.day),
    datasets: [
      {
        label: "Sales",
        data: dashboard.salesByDay.map((item) => item.total),
        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#dc2626",
          "#7c3aed",
          "#0891b2",
          "#ea580c",
        ],
        borderRadius: 8,
      },
    ],
  };

  const salesBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "ការលក់ប្រចាំសប្ដាហ៍" },
    },
  };

  const categoryDoughnutData = {
    labels: dashboard.salesByCategory.map((item) => item.name),
    datasets: [
      {
        label: "Category",
        data: dashboard.salesByCategory.map((item) => item.total),
        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#dc2626",
          "#7c3aed",
          "#0891b2",
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "ការលក់តាមប្រភេទ" },
    },
  };

  const salesLineData = {
    labels: dashboard.salesTrend.map((item) => item.month),
    datasets: [
      {
        label: "Revenue Trend",
        data: dashboard.salesTrend.map((item) => item.total),
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const salesLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "ចំណូលតាមខែ" },
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>ផ្ទាំងគ្រប់គ្រង</h2>
          <p>សង្ខេបទិន្នន័យសំខាន់ៗនៃប្រព័ន្ធ MASTERIT POS</p>
        </div>

        <button className="refresh-btn" onClick={getDashboardData}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="dashboard-loading">កំពុងទាញទិន្នន័យ...</div>
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card revenue-card">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <div className="summary-title">ចំណូលសរុប</div>
              <div className="summary-value">
                ${Number(dashboard.summary.totalRevenue || 0).toFixed(2)}
              </div>
            </div>

            <div className="summary-card products-card">
              <div className="card-icon">
                <FaBoxOpen />
              </div>
              <div className="summary-title">ទំនិញសរុប</div>
              <div className="summary-value">
                {dashboard.summary.totalProducts || 0}
              </div>
            </div>

            <div className="summary-card sales-card">
              <div className="card-icon">
                <FaShoppingCart />
              </div>
              <div className="summary-title">ការលក់សរុប</div>
              <div className="summary-value">
                {dashboard.summary.totalSales || 0}
              </div>
            </div>

            <div className="summary-card stock-card">
              <div className="card-icon">
                <FaExclamationTriangle />
              </div>
              <div className="summary-title">ស្តុកជិតអស់</div>
              <div className="summary-value">
                {dashboard.summary.lowStockCount || 0}
              </div>
            </div>
          </div>

          <div className="today-grid">
            <div className="mini-card">
              <span className="mini-label">ការលក់ថ្ងៃនេះ</span>
              <strong>{dashboard.summary.todaySales || 0}</strong>
            </div>
            <div className="mini-card">
              <span className="mini-label">ចំណូលថ្ងៃនេះ</span>
              <strong>
                ${Number(dashboard.summary.todayRevenue || 0).toFixed(2)}
              </strong>
            </div>
            <div className="mini-card">
              <span className="mini-label">Top Product</span>
              <strong>{dashboard.topProducts?.[0]?.name || "-"}</strong>
            </div>
            <div className="mini-card">
              <span className="mini-label">Low Stock Alert</span>
              <strong>{dashboard.summary.lowStockCount || 0} Items</strong>
            </div>
          </div>

          <div className="chart-grid" >
            <div className="chart-card large-chart">
              <div className="chart-title">ដ្យាក្រាមការលក់</div>
              <div className="chart-box" >
                <Bar data={salesBarData} options={salesBarOptions} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">ប្រភេទទំនិញ</div>
              <div className="chart-box">
                <Doughnut
                  data={categoryDoughnutData}
                  options={categoryDoughnutOptions}
                />
              </div>
            </div>
          </div>

          <div className="chart-grid second-chart-grid">
            <div className="chart-card">
              <div className="chart-title">ចំណូលតាមខែ</div>
              <div className="chart-box">
                <Line data={salesLineData} options={salesLineOptions} />
              </div>
            </div>

            <div className="action-card">
              <div className="chart-title">សកម្មភាពរហ័ស</div>

              <button className="action-btn" onClick={() => navigate("/product")}>
                <FaPlusCircle /> បន្ថែមទំនិញ
              </button>

              <button className="action-btn" onClick={() => navigate("/pos")}>
                <FaCashRegister /> ចូល POS
              </button>

              <button className="action-btn" onClick={() => navigate("/sale-report")}>
                <FaClipboardList /> មើលរបាយការណ៍
              </button>

              <button className="action-btn" onClick={() => navigate("/category")}>
                <FaArrowUp /> គ្រប់គ្រងប្រភេទ
              </button>
            </div>
          </div>

          <div className="bottom-grid">
            <div className="table-card">
              <div className="section-title">ការលក់ថ្មីៗ</div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>អតិថិជន</th>
                      <th>សរុប</th>
                      <th>កាលបរិច្ឆេទ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentSales.length > 0 ? (
                      dashboard.recentSales.map((sale) => (
                        <tr key={sale._id}>
                          <td>{sale.invoiceNo || "-"}</td>
                          <td>{sale.customerName || "Walk-in"}</td>
                          <td>${Number(sale.totalAmount || 0).toFixed(2)}</td>
                          <td>{formatDate(sale.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-text">
                          មិនទាន់មានទិន្នន័យ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="side-info-grid">
              <div className="info-card">
                <div className="section-title">ទំនិញជិតអស់ស្តុក</div>
                {dashboard.lowStockProducts.length > 0 ? (
                  dashboard.lowStockProducts.map((item) => (
                    <div key={item._id} className="list-item">
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.category || "-"}</p>
                      </div>
                      <span className="danger-badge">{item.stockQty}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-text">មិនមានទំនិញជិតអស់ទេ</div>
                )}
              </div>

              <div className="info-card">
                <div className="section-title">ទំនិញលក់ដាច់ជាងគេ</div>
                {dashboard.topProducts.length > 0 ? (
                  dashboard.topProducts.map((item) => (
                    <div key={item._id} className="list-item">
                      <div>
                        <strong>{item.name}</strong>
                      </div>
                      <span className="primary-badge">{item.soldQty} sold</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-text">មិនទាន់មានទិន្នន័យ</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;