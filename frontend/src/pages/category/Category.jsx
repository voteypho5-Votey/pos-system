import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./category.css";

function Category() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("មាន");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const getCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/category");
      setCategories(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញទិន្នន័យប្រភេទទំនិញបានទេ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setStatus("មាន");
    setEditingId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };
const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };
  const openEditModal = (item) => {
    setEditingId(item._id);
    setName(item.name || "");
    setStatus(item.status || "មាន");
    setShowModal(true);
  };

  // const addCategory = async (e) => {
  //   e.preventDefault();

  //   if (!name.trim()) {
  //     alert("សូមបញ្ចូលឈ្មោះប្រភេទទំនិញ");
  //     return;
  //   }

  //   try {
  //     await axiosInstance.post("/category", {
  //       name: name.trim(),
  //       status,
  //     });

  //     setName("");
  //     setStatus("មាន");
  //     getCategories();
  //   } catch (error) {
  //     console.log(error);
  //     alert(error?.response?.data?.message || "បន្ថែមប្រភេទទំនិញមិនបាន");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("សូមបញ្ចូលឈ្មោះប្រភេទទំនិញ");
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put("/category/" + editingId, {
          name: name.trim(),
          status,
        });
      } else {
        await axiosInstance.post("/category", {
          name: name.trim(),
          status,
        });
      }

      closeModal();
      getCategories();
    } catch (error) {
      console.log(error);
      alert(
        error?.response?.data?.message ||
          (editingId
            ? "កែប្រែប្រភេទទំនិញមិនបាន"
            : "បន្ថែមប្រភេទទំនិញមិនបាន")
      );
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?");
    if (!ok) return;

    try {
      await axiosInstance.delete("/category/" + id);
      getCategories();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "លុបប្រភេទទំនិញមិនបាន");
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  return (
    <div className="category-page">
      <div className="category-header">
        <h2>ប្រភេទទំនិញ</h2>
        <button className="category-add-btn" onClick={openAddModal}>
          + បន្ថែមថ្មី
        </button>
      </div>

      <div className="category-card">
        {/* <form className="category-form" onSubmit={addCategory}>
          <input
            className="category-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="បញ្ចូលប្រភេទ"
          />

          <select
            className="category-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="មាន">មាន</option>
            <option value="អសកម្ម">អសកម្ម</option>
          </select>

          <button className="category-add-btn" type="submit">
            បន្ថែម
          </button>
        </form> */}

        <div className="category-tools">
          <input
            className="category-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរក..."
          />
        </div>

        <table className="category-table">
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>ប្រភេទទំនិញ</th>
              <th>ពិណ៏នា</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="category-empty">
                  កំពុងទាញទិន្នន័យ...
                </td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((item, index) => (
                <tr key={item._id} >
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.status || "មាន"}</td>
                  <td className="td-button">
                    <button
                      type="button"
                      className="category-edit-btn"
                      onClick={() => openEditModal(item)}
                    >
                      កែប្រែ
                    </button>
                    <button
                      type="button"
                      className="category-delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      លុប
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="category-empty">
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="category-modal-overlay">
          <div className="category-modal-box">
            <div className="category-modal-header">
              <h3>កែប្រែប្រភេទទំនិញ</h3>
              <button className="category-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="category-form-group">
                <label>ប្រភេទទំនិញ</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="បញ្ចូលប្រភេទទំនិញ"
                />
              </div>

              <div className="category-form-group">
                <label>ពិណ៏នា</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="មាន">មាន</option>
                  <option value="អសកម្ម">អសកម្ម</option>
                </select>
              </div>

              <div className="category-modal-buttons">
                <button
                  type="button"
                  className="category-cancel-btn"
                  onClick={closeModal}
                >
                  បោះបង់
                </button>

                <button type="submit" className="category-submit-btn">
                  {editingId ? "កែប្រែ" : "រក្សាទុក"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;