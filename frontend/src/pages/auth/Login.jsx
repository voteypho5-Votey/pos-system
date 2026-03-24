import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await login(formData);
      const role = res?.data?.data?.role;

      if (role === "admin") {
        navigate("/");
      } else if (role === "user") {
        navigate("/pos");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.response?.data?.message || "ចូលប្រើប្រាស់មិនជោគជ័យ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>ចូលប្រើប្រាស់</h2>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

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
          {loading ? "កំពុងចូល..." : "ចូលប្រើ"}
        </button>

        <p className="register-link">
          មិនទាន់មានគណនីមែនទេ? <Link to="/register">បង្កើតគណនី</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;