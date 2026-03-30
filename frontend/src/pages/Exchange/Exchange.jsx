import React, { useEffect, useState } from "react";
import axios from "../../services/axiosInstance.js";
import toast from "react-hot-toast";
import "./Exchange.css";

function Exchange() {
  const [rate, setRate] = useState("");
  const [exchangeList, setExchangeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const fetchExchangeList = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/exchange");
      setExchangeList(res.data || []);
    } catch (error) {
      console.log(error);
      toast.error("មិនអាចទាញយកទិន្នន័យបានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeList();
  }, []);

  // const handleSave = async () => {
  //   if (!rate) {
  //     return toast.error("សូមបញ្ចូលអត្រាប្តូរប្រាក់");
  //   }

  //   if (Number(rate) <= 0) {
  //     return toast.error("អត្រាប្តូរប្រាក់មិនត្រឹមត្រូវ");
  //   }

  //   try {
  //     await axios.post("/exchange", { rate: Number(rate) });
  //     toast.success("រក្សាទុកបានជោគជ័យ");
  //     setRate("");
  //     fetchExchangeList();
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error?.response?.data?.message || "រក្សាទុកមិនជោគជ័យ");
  //   }
  // };
  const [exchangeRate, setExchangeRate] = useState(4000);
  useEffect(() => {
    const fetchRate = async () => {
      const res = await axios.get("/exchange/latest");
      setExchangeRate(res.data.rate);
    };

    fetchRate();
  }, []);


  const handleSave = async () => {
    try {
      await axios.post("/exchange", { rate: Number(rate) });
      toast.success("Saved!");
      setRate("");
      fetchExchangeList();
    } catch (err) {
      toast.error("Error!");
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await axios.get("/exchange/search", { params });
      setExchangeList(res.data || []);
    } catch (error) {
      console.log(error);
      toast.error("ស្វែងរកមិនជោគជ័យ");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };



  return (
   <div className="layout-content">
    <div className="exchange-page">
      <div className="exchange-grid">
        {/* Left */}
        <div className="exchange-card">
          <p className="exchange-today">Today {today}</p>

          <div className="exchange-divider"></div>

          <div className="exchange-form">
            <input
              type="number"
              placeholder="Enter Exchange Rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="exchange-input"
            />
            <button onClick={handleSave} className="exchange-save-btn">
              Save
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="exchange-card">
          <div className="exchange-search-bar">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="exchange-date-input"
            />

            <span className="exchange-to-text">To</span>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="exchange-date-input"
            />

            <button onClick={handleSearch} className="exchange-search-btn">
              Search
            </button>
          </div>

          <div className="exchange-table-wrapper">
            <table className="exchange-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Exchange</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="2" className="exchange-empty">
                      កំពុងទាញយកទិន្នន័យ...
                    </td>
                  </tr>
                ) : exchangeList.length > 0 ? (
                  exchangeList.map((item) => (
                    <tr key={item._id}>
                      <td>{formatDate(item.createdAt)}</td>
                      <td className="exchange-rate-text">{item.rate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="exchange-empty">
                      មិនមានទិន្នន័យ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="exchange-pagination">
            <button className="page-btn">Prev</button>
            <span>Page 1</span>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Exchange;