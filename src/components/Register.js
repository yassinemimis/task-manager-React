import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://task-manager-onhy.onrender.com/api/auth"; // ✨ غيّر حسب السيرفر

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");

    // حساب قوة كلمة المرور
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrengthInfo = () => {
    if (passwordStrength <= 2)
      return { color: "danger", text: "ضعيفة", width: "33%" };
    if (passwordStrength <= 3)
      return { color: "warning", text: "متوسطة", width: "66%" };
    return { color: "success", text: "قوية", width: "100%" };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // تحقق من صحة المدخلات
    if (formData.password !== formData.confirmPassword) {
      setError("كلمتا المرور غير متطابقتان");
      return;
    }

    if (passwordStrength < 3) {
      setError(
        "كلمة المرور ضعيفة جداً. يجب أن تحتوي على 8 أحرف على الأقل مع أرقام وحروف"
      );
      return;
    }

    if (!acceptTerms) {
      setError("يجب الموافقة على الشروط والأحكام");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("تم إنشاء الحساب بنجاح! 🎉");

        // ✅ بعد التسجيل يروح مباشرة للـ todos
        navigate("/todos");
      } else {
        setError(res.data.message || "حدث خطأ أثناء إنشاء الحساب");
      }
    } catch (err) {
      setError(err.response?.data?.message || "فشل إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthInfo();

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
                  className="d-inline-flex align-items-center justify-content-center text-white"
                  style={{
                    width: '90px',
                    height: '90px',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    borderRadius: '50%',
                    boxShadow: '0 15px 35px rgba(40, 167, 69, 0.3)'
                  }}
                >
                  <i className="bi bi-person-plus" style={{ fontSize: '2.5rem' }}></i>
                </div>
              </div>
              <h2 className="fw-bold text-dark mb-2">Join us now! 🚀</h2>
              <p className="text-muted mb-0 fs-6">Create your account and start your task management journey</p>
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

              <form onSubmit={handleRegister}>
                {/* Name Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-person me-2 text-success"></i>
                    Full Name
                  </label>
                  <div className="input-group input-group-lg">
                    <span 
                      className="input-group-text bg-light border-2 border-end-0"
                      style={{ borderRadius: '15px 0 0 15px', borderColor: '#e9ecef' }}
                    >
                      <i className="bi bi-person-circle text-muted"></i>
                    </span>
                    <input
                      type="text"
                      name="name"
                      className="form-control border-2 border-start-0 ps-2 shadow-none"
                      style={{ 
                        borderRadius: '0 15px 15px 0',
                        borderColor: '#e9ecef',
                        fontSize: '16px'
                      }}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-envelope me-2 text-success"></i>
                    Email Address
                  </label>
                  <div className="input-group input-group-lg">
                    <span 
                      className="input-group-text bg-light border-2 border-end-0"
                      style={{ borderRadius: '15px 0 0 15px', borderColor: '#e9ecef' }}
                    >
                      <i className="bi bi-at text-muted"></i>
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
                      placeholder="example@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-lock me-2 text-success"></i>
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
                      style={{ borderColor: '#e9ecef', fontSize: '16px' }}
                      placeholder="Strong password"
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
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: '4px' }}>
                        <div
                          className={`progress-bar bg-${strengthInfo.color}`}
                          style={{ width: strengthInfo.width }}
                        ></div>
                      </div>
                      <small className={`text-${strengthInfo.color} mt-1 d-block`}>
                        Password strength: {strengthInfo.text}
                      </small>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-shield-check me-2 text-success"></i>
                    Confirm Password
                  </label>
                  <div className="input-group input-group-lg">
                    <span 
                      className="input-group-text bg-light border-2 border-end-0"
                      style={{ borderRadius: '15px 0 0 15px', borderColor: '#e9ecef' }}
                    >
                      <i className="bi bi-shield-check text-muted"></i>
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="form-control border-2 border-start-0 border-end-0 ps-2 shadow-none"
                      style={{ borderColor: '#e9ecef', fontSize: '16px' }}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn border-2 border-start-0 bg-light"
                      style={{ borderRadius: '0 15px 15px 0', borderColor: '#e9ecef' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <small className={`${formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'} mt-1 d-block`}>
                      <i className={`bi ${formData.password === formData.confirmPassword ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                      {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </small>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      id="acceptTerms"
                      disabled={isLoading}
                    />
                    <label className="form-check-label text-muted" htmlFor="acceptTerms">
                      I agree to{" "}
                      <button type="button" className="btn btn-link p-0 text-primary text-decoration-none">
                        Terms & Conditions
                      </button>
                      {" "}and{" "}
                      <button type="button" className="btn btn-link p-0 text-primary text-decoration-none">
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>

                {/* Register Button */}
                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg fw-semibold py-3 shadow-sm"
                    style={{ 
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      border: 'none'
                    }}
                    disabled={isLoading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword || !acceptTerms}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Creating account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-check me-2"></i>
                        Create Account Now
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-muted mb-0">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    className="btn btn-link p-0 text-primary fw-semibold text-decoration-none"
                   onClick={() => navigate("/login")}
                  >
                    Log in here
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

export default Register;
