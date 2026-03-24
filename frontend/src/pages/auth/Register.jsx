import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore"; 
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await register(formData);
      setSuccessMessage(res?.data?.message || "បង្កើតគណនីបានជោគជ័យ");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.response?.data?.message || "បង្កើតគណនីមិនជោគជ័យ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>បង្កើតគណនី</h2>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        <div className="form-group">
          <label>ឈ្មោះ</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="បញ្ចូលឈ្មោះ"
            required
          />
        </div>

        <div className="form-group">
          <label>អ៊ីមែល</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="បញ្ចូលអ៊ីមែល"
            required
          />
        </div>

        <div className="form-group">
          <label>លេខសម្ងាត់</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="បញ្ចូលលេខសម្ងាត់"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "កំពុងបង្កើត..." : "ចុះឈ្មោះ"}
        </button>

        <p className="login-link">
          មានគណនីរួចហើយ? <Link to="/login">ចូលប្រើ</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;