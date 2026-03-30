import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./product.css";


function Product() {
  const API_URL = "/product";

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState({
    image: null,
    name: "",
    category: "",
    code: "",
    costPrice: "",
    salePrice: "",
    stockQty: "",
    status: "មាន",
  });


  const getProducts = async () => { //Phjeap
    try {
      const res = await axiosInstance.get(API_URL);
      setProducts(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញទិន្នន័យទំនិញបានទេ");
    }
  };
  const getCategories = async () => { //Phjeap
    try {
      const res = await axiosInstance.get("/category");
      setCategories(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("មិនអាចទាញប្រភេទទំនិញបានទេ");
    }
  };

  useEffect(() => {     //Phjeap
    getProducts();
    getCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const keyword = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.code?.toLowerCase().includes(keyword) ||
        String(item.costPrice || "").includes(keyword) ||
        String(item.salePrice || "").includes(keyword) ||
        String(item.stockQty || "").includes(keyword) ||
        item.status?.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      image: null,
      name: "",
      category: "",
      code: "",
      costPrice: "",
      salePrice: "",
      stockQty: "",
      status: "មាន",
    });
    setPreviewImage("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      image: null,
      name: product.name || "",
      category: product.category || "",
      code: product.code || "",
      costPrice: product.costPrice || "",
      salePrice: product.salePrice || "",
      stockQty: product.stockQty || "",
      status: product.status || "មាន",
    });
    setPreviewImage(product.image || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreviewImage(URL.createObjectURL(file));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("code", formData.code);
      payload.append("costPrice", formData.costPrice);
      payload.append("salePrice", formData.salePrice);
      payload.append("stockQty", formData.stockQty);
      payload.append("status", formData.status);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (editingId) {
        await axiosInstance.put(`${API_URL}/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post(API_URL, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      closeModal();
      getProducts();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "រក្សាទុកទិន្នន័យមិនបានទេ");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      getProducts();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "លុបទិន្នន័យមិនបានទេ");
    }
  };

  return (
    <div className="product-page">
      <div className="product-header">
        <h2>ទំនិញ</h2>
        <button className="product-add-btn" onClick={openAddModal}>
          + បន្ថែមថ្មី
        </button>
      </div>

      <div className="product-card">

        <div className="product-tools">
          <input
            className="product-search"
            type="text"
            placeholder="ស្វែងរក..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>រូបភាព</th>
              <th>ឈ្មោះទំនិញ</th>
              <th>ប្រភេទទំនិញ</th>
              <th>កូដទំនិញ</th>
              <th>ថ្លៃដើម</th>
              <th>ថ្លៃលក់</th>
              <th>ចំនួនស្តុក</th>
              <th>ស្ថានភាព</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <tr key={item._id}>
                  
                  <td data-label="ល.រ">{index + 1}</td>

                  <td data-label="រូបភាព">
                    {item.image ? (
                      <img
                        src={`https://pos-system-ofv8.onrender.com${item.image}`}
                        alt={item.name}
                        className="product-thumb"
                      />
                    ) : (
                      <div className="product-no-image">No Image</div>
                    )}
                  </td>
                  <td data-label="ឈ្មោះ">{item.name}</td>
                  <td data-label="ប្រភេទ">{item.category}</td>
                  <td data-label="កូដ">{item.code}</td>
                  <td data-label="ថ្លៃដើម">{item.costPrice}$</td>
                  <td data-label="ថ្លៃលក់">{item.salePrice}$</td>
                  <td data-label="ស្តុក">{item.stockQty}</td>
                  <td data-label="ស្ថានភាព">{item.status}</td>
                  <td data-label="សកម្មភាព" className="td-button">

                    <button
                      className="product-edit-btn"
                      onClick={() => openEditModal(item)}
                    >
                      កែប្រែ
                    </button>
                    <button
                      className="product-delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      លុប
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="product-empty">
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="product-modal-overlay">
          <div className="product-modal-box">
            <div className="product-modal-header">
              <h3>{editingId ? "កែប្រែទំនិញ" : "បន្ថែមទំនិញថ្មី"}</h3>
              <button className="product-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>


            <form onSubmit={handleSubmit} className="product-form">
             
                <div className="product-form-group">
                  <label>រូបភាព</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImage}
                  />
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="preview"
                      className="product-thumb"
                    />
                  )}
                </div>

                <div className="product-form-group">
                  <label>ឈ្មោះទំនិញ</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="បញ្ចូលឈ្មោះទំនិញ"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="product-form-group">
                  <label>ប្រភេទទំនិញ</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">ជ្រើសរើសប្រភេទទំនិញ</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-group">
                  <label>កូដទំនិញ</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="បញ្ចូលកូដទំនិញ"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="product-form-row">
                  <div className="product-form-group">
                    <label>ថ្លៃដើម</label>
                    <input
                      type="number"
                      name="costPrice"
                      placeholder="បញ្ចូលថ្លៃដើម"
                      value={formData.costPrice}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="product-form-group">
                    <label>ថ្លៃលក់</label>
                    <input
                      type="number"
                      name="salePrice"
                      placeholder="បញ្ចូលថ្លៃលក់"
                      value={formData.salePrice}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="product-form-row">
                  <div className="product-form-group">
                    <label>ចំនួនស្តុក</label>
                    <input
                      type="number"
                      name="stockQty"
                      placeholder="បញ្ចូលចំនួនស្តុក"
                      value={formData.stockQty}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="product-form-group">
                    <label>ស្ថានភាព</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="មាន">មាន</option>
                      <option value="អស់">អស់</option>
                      <option value="អសកម្ម">អសកម្ម</option>
                    </select>
                  </div>
                </div>
              

              <div className="product-modal-buttons">
                <button
                  type="button"
                  className="product-cancel-btn"
                  onClick={closeModal}
                >
                  បោះបង់
                </button>

                <button type="submit" className="product-submit-btn">
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

export default Product;