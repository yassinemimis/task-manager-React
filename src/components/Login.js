import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://task-manager-onhy.onrender.com/api/auth"; // ✨ غيّر حسب سيرفرك

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const res = await axios.post(`${API_URL}/login`, {
      email: formData.email,
      password: formData.password,
    });

    if (res.data.success) {
      const { token, user } = res.data;

      // حفظ التوكن في localStorage
      localStorage.setItem("token", token);

      // حفظ معلومات المستخدم (profile)
      localStorage.setItem("userProfile", JSON.stringify(user));

      // حفظ بيانات إضافية إذا تم اختيار "تذكرني"
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }

      // تحديث state في التطبيق إذا كنت تستخدم context أو prop
      if (onLoginSuccess) onLoginSuccess(user);

      // التوجيه بعد تسجيل الدخول
      navigate("/todos");
    } else {
      setError(res.data.message || "حدث خطأ أثناء تسجيل الدخول");
    }
  } catch (err) {
    setError(err.response?.data?.message || "فشل تسجيل الدخول");
  } finally {
    setIsLoading(false);
  }
};


  return (
  <div 
    className="min-vh-100 d-flex align-items-center justify-content-center py-5"
    style={{
      background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    }}
  >
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          {/* Main Auth Card */}
          <div 
            className="card border-0 shadow-lg overflow-hidden"
            style={{ 
              borderRadius: '25px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="card-header bg-transparent border-0 text-center py-5">
              <div className="mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center text-white position-relative"
                  style={{
                    width: '90px',
                    height: '90px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <i className="bi bi-check2-square" style={{ fontSize: '2.5rem' }}></i>
                </div>
              </div>
              <h2 className="fw-bold text-dark mb-2">Welcome Back! 👋</h2>
              <p className="text-muted mb-0 fs-6">Sign in to access your saved tasks</p>
            </div>

            <div className="card-body px-5 pb-5">


              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger border-0 rounded-4 mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-envelope me-2 text-primary"></i>
                    Email
                  </label>
                  <div className="input-group input-group-lg">
                    <span 
                      className="input-group-text bg-light border-2 border-end-0"
                      style={{ borderRadius: '15px 0 0 15px', borderColor: '#e9ecef' }}
                    >
                      <i className="bi bi-person text-muted"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="form-control border-2 border-start-0 ps-2 shadow-none"
                      style={{ 
                        borderRadius: '0 15px 15px 0',
                        borderColor: '#e9ecef',
                        fontSize: '16px'
                      }}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-lock me-2 text-primary"></i>
                    Password
                  </label>
                  <div className="input-group input-group-lg">
                    <span 
                      className="input-group-text bg-light border-2 border-end-0"
                      style={{ borderRadius: '15px 0 0 15px', borderColor: '#e9ecef' }}
                    >
                      <i className="bi bi-shield-lock text-muted"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control border-2 border-start-0 border-end-0 ps-2 shadow-none"
                      style={{ 
                        borderColor: '#e9ecef',
                        fontSize: '16px'
                      }}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn border-2 border-start-0 bg-light"
                      style={{ borderRadius: '0 15px 15px 0', borderColor: '#e9ecef' }}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      id="rememberMe"
                      disabled={isLoading}
                    />
                    <label className="form-check-label text-muted" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <button type="button" className="btn btn-link p-0 text-primary text-decoration-none">
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fw-semibold py-3 shadow-sm"
                    style={{ 
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none'
                    }}
                    disabled={isLoading || !formData.email || !formData.password}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="position-relative mb-4">
                  <hr className="text-muted" />
                  <span 
                    className="position-absolute top-50 start-50 translate-middle px-3 text-muted bg-white"
                    style={{ fontSize: '14px' }}
                  >
                    Or sign in with
                  </span>
                </div>

                {/* Social Login */}
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <button 
                      type="button" 
                      className="btn btn-outline-danger w-100 py-2 rounded-3" 
                      disabled
                    >
                      <i className="bi bi-google me-2"></i>
                      Google
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary w-100 py-2 rounded-3" 
                      disabled
                    >
                      <i className="bi bi-facebook me-2"></i>
                      Facebook
                    </button>
                  </div>
                </div>
              </form>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-muted mb-0">
                  Don’t have an account?{" "}
                  <button 
                    type="button"
                    className="btn btn-link p-0 text-success fw-semibold text-decoration-none"
                    onClick={() => navigate("/register")}
                  >
                    Create a new account
                  </button>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);

};

export default Login;
