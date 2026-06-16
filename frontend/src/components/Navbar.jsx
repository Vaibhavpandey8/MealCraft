import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { gsap } from "gsap";
import PaymentModal from "./PaymentModal";
import { getMealMacros } from "../utils/nutrition";
import { API_BASE_URL } from "../utils/api";

const Navbar = () => {
  const {
    user,
    login,
    logout,
    authModalOpen: loginOpen,
    setAuthModalOpen: setLoginOpen,
    authModalTab: activeTab,
    setAuthModalTab: setActiveTab
  } = useAuth();

  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal
  } = useCart();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ fullName: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [devLink, setDevLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasSignedUp, setHasSignedUp] = useState(() => localStorage.getItem("mealcraft_signed_up") === "true");

  useEffect(() => {
    if (user) {
      localStorage.setItem("mealcraft_signed_up", "true");
      setHasSignedUp(true);
    }
  }, [user]);

  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);

  // AI Calorie & Nutrition Coach calculations
  const getCartNutrition = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    cart.forEach((item) => {
      calories += (item.calories || 0) * item.quantity;
      const macros = getMealMacros(item.name);
      protein += macros.protein * item.quantity;
      carbs += macros.carbs * item.quantity;
      fat += macros.fat * item.quantity;
    });

    const totalGrams = protein + carbs + fat;
    const proteinPct = totalGrams > 0 ? Math.round((protein / totalGrams) * 100) : 0;
    const carbsPct = totalGrams > 0 ? Math.round((carbs / totalGrams) * 100) : 0;
    const fatPct = totalGrams > 0 ? Math.round((fat / totalGrams) * 100) : 0;

    // Determine advice
    let advice = "Aapke items cart me add ho chuke hain. Hamara AI coach aapke macros analyze kar raha hai! 🥗";
    if (calories > 0) {
      if (proteinPct >= 28) {
        advice = "High Protein combinations selected! Yeh meals aapke muscle recovery aur strength building ke liye solid choice hain! 💪🔥";
      } else if (carbsPct >= 55) {
        advice = "Carb-rich meals! Perfect for high-intensity activities and instant energy replenishment, par simple calories se bachiye. ⚡🌾";
      } else if (fatPct >= 40) {
        advice = "High healthy/rich fats detected! Calorie-dense meal combination hai, ideal for satisfying hunger but manage portion sizes. 🥑🧀";
      } else {
        advice = "Perfect balanced combination! Carbs, protein, aur fats sahi proportion me hain. Weight management ke liye best choice. 🥗✅";
      }
    }

    return { calories, protein, carbs, fat, proteinPct, carbsPct, fatPct, advice };
  };

  const cartNutri = getCartNutrition();

  useEffect(() => {
    document.body.classList.add("dark-mode");

    const handleScroll = () => {
      const header = document.querySelector(".header");
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok) {
        login(data);
        setLoginOpen(false);
        setLoginData({ email: "", password: "" });
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (err) {
      setError("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setDevOtp("");
    setDevLink("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (res.ok) {
        setVerifyEmail(signupData.email);
        setSuccess(data.message || "OTP verification code sent!");

        if (data.devOtp) setDevOtp(data.devOtp);
        if (data.devLink) setDevLink(data.devLink);

        setActiveTab("verify-otp");
        setSignupData({ fullName: "", email: "", password: "" });
      } else {
        setError(data.message || "Signup failed!");
      }
    } catch (err) {
      setError("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, otp: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
        setSuccess(`Welcome to MealCraft, ${data.user.fullName}! 🎉`);
        setOtpCode("");
        setDevOtp("");
        setDevLink("");
        setTimeout(() => {
          setLoginOpen(false);
          setSuccess("");
        }, 2500);
      } else {
        setError(data.message || "Verification failed!");
      }
    } catch (err) {
      setError("Verification failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.previewUrl) {
          setSuccess(
            <span>
              {data.message}{" "}
              <a
                href={data.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#e67e22", textDecoration: "underline", display: "block", marginTop: "1.2rem", fontWeight: 700 }}
              >
                Open Virtual Email Inbox 📧
              </a>
            </span>
          );
        } else if (data.devLink) {
          setSuccess(
            <span>
              {data.message}{" "}
              <a
                href={data.devLink}
                style={{ color: "#e67e22", textDecoration: "underline", display: "block", marginTop: "1.2rem", fontWeight: 700 }}
              >
                Reset Password Link 🔗
              </a>
            </span>
          );
        } else {
          setSuccess(data.message || "Reset link sent! Please check your email.");
        }
        setForgotEmail("");
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to send reset link. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!address) return alert("Please enter delivery address!");
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setCartOpen(false);
    clearCart();
    setOrderSuccess(true);
    setAddress("");
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  return (
    <>
      <header className="header">
        <Link to="/">
          <img className="logo" alt="MealCraft logo" src="/img/mealcraft-logo.png" />
        </Link>



        <nav className="main-nav">
          <ul className="main-nav-list">
            {user && (
              <li>
                <Link
                  to="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    textDecoration: "none",
                    color: "inherit",
                    marginRight: "1.5rem"
                  }}
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt="profile"
                      width="36"
                      height="36"
                      referrerPolicy="no-referrer"
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#e67e22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.6rem",
                      fontWeight: 600,
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: "1.6rem", fontWeight: 500 }}>
                    {user.name}
                  </span>
                </Link>
              </li>
            )}
            {[
              { label: "Home", to: "/" },
              { label: "How it works", to: "/#how" },
              { label: "Meals", to: "/#meals" },
              { label: "Testimonials", to: "/#testimonials" },
              { label: "Pricing", to: "/#pricing" },
              { label: "AI Planner", to: "/planner" },
              { label: "Menu", to: "/menu" }
            ].map((item) => (
              <li key={item.label}>
                <Link
                  className="btn-login"
                  to={item.to}
                  style={{
                    textDecoration: "none",
                    display: "inline-block"
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Authenticate / User profile next to Cart */}
            <li>
              {user ? (
                <button className="btn-logout" onClick={logout}>
                  Logout
                </button>
              ) : (
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    className="btn-login"
                    onClick={() => {
                      setLoginOpen(true);
                      setActiveTab("login");
                      setError("");
                      setSuccess("");
                      setDevOtp("");
                      setDevLink("");
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="btn-login"
                    onClick={() => {
                      setLoginOpen(true);
                      setActiveTab("signup");
                      setError("");
                      setSuccess("");
                      setDevOtp("");
                      setDevLink("");
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </li>
            {/* Cart Icon in Navbar */}
            <li style={{ marginLeft: "1.5rem" }}>
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "inherit",
                }}
              >
                <ion-icon name="cart-outline" style={{ fontSize: "2.8rem", color: "#e67e22" }}></ion-icon>
                {getCartCount() > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      backgroundColor: "#e67e22",
                      color: "white",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: "50%",
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    {getCartCount()}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        <button className="btn-mobile-nav">
          <ion-icon className="icon-mobile-nav" name="menu-outline"></ion-icon>
          <ion-icon className="icon-mobile-nav" name="close-outline"></ion-icon>
        </button>
      </header>

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)}></div>
          <div className="cart-drawer">
            <div className="cart-header">
              <h3>Your Cart 🛒</h3>
              <button className="cart-close" onClick={() => setCartOpen(false)}>&times;</button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "8rem 2rem" }}>
                  <p style={{ fontSize: "5rem" }}>🍽️</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 500, color: "#888", marginTop: "1rem" }}>
                    Your cart is empty!
                  </p>
                </div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cart.map((item) => (
                      <div className="cart-item" key={item._id}>
                        <img src={item.image} alt={item.name} onError={(e) => e.target.src = "/img/meals/meal-1.jpg"} />
                        <div className="cart-item-details">
                          <h4>{item.name}</h4>
                          <p className="cart-item-price">₹{item.price}</p>
                          <div className="cart-item-qty">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                          </div>
                        </div>
                        <button className="cart-item-remove" onClick={() => removeFromCart(item._id)}>
                          <ion-icon name="trash-outline"></ion-icon>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* AI Nutrition Coach Drawer Widget */}
                  <div style={{
                    background: "rgba(230, 126, 34, 0.05)",
                    border: "1px solid rgba(230, 126, 34, 0.2)",
                    borderRadius: "9px",
                    padding: "1.6rem",
                    margin: "1.6rem 0",
                    fontFamily: "inherit"
                  }}>
                    <div
                      onClick={() => setCoachOpen(!coachOpen)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer"
                      }}
                    >
                      <h4 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#e67e22", display: "flex", alignItems: "center", gap: "0.8rem", margin: 0 }}>
                        <span>📊</span> AI Nutrition Coach
                      </h4>
                      <span style={{ fontSize: "1.4rem", color: "#e67e22" }}>{coachOpen ? "▲" : "▼"}</span>
                    </div>

                    {coachOpen && (
                      <div style={{ marginTop: "1.2rem", fontSize: "1.3rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
                          <div style={{ background: "rgba(0,0,0,0.15)", padding: "0.8rem", borderRadius: "5px", textAlign: "center" }}>
                            <span style={{ display: "block", color: "#aaa", fontSize: "1.1rem" }}>Total Energy</span>
                            <strong style={{ fontSize: "1.4rem", color: "#e67e22" }}>{cartNutri.calories} kcal</strong>
                          </div>
                          <div style={{ background: "rgba(0,0,0,0.15)", padding: "0.8rem", borderRadius: "5px", textAlign: "center" }}>
                            <span style={{ display: "block", color: "#aaa", fontSize: "1.1rem" }}>Protein</span>
                            <strong style={{ fontSize: "1.4rem", color: "#3498db" }}>{cartNutri.protein}g</strong>
                          </div>
                        </div>

                        {/* Macro Ratios progress bars */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.2rem" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", marginBottom: "0.2rem", color: "#ccc" }}>
                              <span>Protein ({cartNutri.proteinPct}%)</span>
                              <span>Carbs ({cartNutri.carbsPct}%)</span>
                              <span>Fat ({cartNutri.fatPct}%)</span>
                            </div>
                            <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
                              <div style={{ width: `${cartNutri.proteinPct}%`, backgroundColor: "#3498db" }}></div>
                              <div style={{ width: `${cartNutri.carbsPct}%`, backgroundColor: "#2ecc71" }}></div>
                              <div style={{ width: `${cartNutri.fatPct}%`, backgroundColor: "#e74c3c" }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Coach Tip */}
                        <div style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          borderLeft: "3px solid #e67e22",
                          padding: "1rem",
                          borderRadius: "4px",
                          fontSize: "1.2rem",
                          lineHeight: "1.5",
                          color: "#ddd"
                        }}>
                          <strong>Coach Advice:</strong> {cartNutri.advice}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="cart-checkout-section">
                    <div className="cart-total">
                      <span>Subtotal:</span>
                      <strong>₹{getCartTotal()}</strong>
                    </div>

                    {user ? (
                      <>
                        <div className="cart-address-input">
                          <label>Delivery Address</label>
                          <input
                            type="text"
                            placeholder="Enter full delivery address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                        <button
                          className="btn-checkout"
                          onClick={handleProceedToCheckout}
                          disabled={cart.length === 0}
                        >
                          Proceed to Pay 💳
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-checkout btn-checkout-auth"
                        onClick={() => {
                          setCartOpen(false);
                          setActiveTab("login");
                          setLoginOpen(true);
                        }}
                      >
                        Login to Checkout 🔐
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPayment && cart.length > 0 && (
        <PaymentModal
          cartItems={cart}
          totalAmount={getCartTotal()}
          address={address}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Order Success Toast */}
      {orderSuccess && (
        <div style={{
          position: "fixed", top: "2rem", right: "2rem",
          backgroundColor: "#27ae60", color: "white",
          padding: "1.6rem 2.4rem", borderRadius: "9px",
          fontSize: "1.6rem", fontWeight: 500, zIndex: 99999,
          boxShadow: "0 1rem 2rem rgba(0,0,0,0.2)",
        }}>
          🎉 Orders placed successfully!
        </div>
      )}

      {/* Authenticate Modal */}
      {loginOpen && (
        <>
          <div className="auth-overlay" onClick={() => setLoginOpen(false)}></div>
          <div className="auth-modal">
            <button className="auth-modal-close" onClick={() => setLoginOpen(false)}>
              &times;
            </button>
            {activeTab === "forgot" ? (
              <h3 style={{ fontSize: "2rem", color: "#e67e22", textAlign: "center", marginBottom: "2rem", fontWeight: 600 }}>
                Reset Password 🔒
              </h3>
            ) : activeTab === "verify-otp" ? (
              <h3 style={{ fontSize: "2rem", color: "#e67e22", textAlign: "center", marginBottom: "2.4rem", fontWeight: 600 }}>
                Email Verification 🔑
              </h3>
            ) : (
              <div className="auth-modal-tabs">
                <button
                  type="button"
                  className={`auth-modal-tab ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); setDevOtp(""); setDevLink(""); }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-modal-tab ${activeTab === "signup" ? "active" : ""}`}
                  onClick={() => { setActiveTab("signup"); setError(""); setSuccess(""); setDevOtp(""); setDevLink(""); }}
                >
                  Sign Up
                </button>
              </div>
            )}
            {error && (
              <p style={{ color: "red", fontSize: "1.4rem", marginBottom: "1.5rem", textAlign: "center" }}>
                {error}
              </p>
            )}
            {success && (
              <p style={{ color: "#27ae60", fontSize: "1.4rem", marginBottom: "1.5rem", textAlign: "center", fontWeight: 500 }}>
                {success}
              </p>
            )}
            {activeTab === "forgot" ? (
              <form className="auth-modal-form" onSubmit={handleForgotPassword}>
                <p style={{ fontSize: "1.3rem", color: "#ccc", marginBottom: "1.5rem", textAlign: "center", lineHeight: "1.4" }}>
                  Enter your registered email address below, and we'll send you a password reset link.
                </p>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Sending link..." : "Send Reset Link 📧"}
                </button>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab("login"); setError(""); setSuccess(""); }}
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: "1.3rem",
                    color: "#999",
                    textDecoration: "none",
                    marginTop: "1.5rem"
                  }}
                >
                  ← Back to Login
                </a>
              </form>
            ) : activeTab === "verify-otp" ? (
              <form className="auth-modal-form" onSubmit={handleVerifyOTP}>
                <p style={{ fontSize: "1.3rem", color: "#ccc", marginBottom: "2rem", textAlign: "center", lineHeight: "1.5" }}>
                  Please enter the 6-digit verification code sent to your email <strong>{verifyEmail}</strong>.
                </p>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="Enter 6-digit OTP Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1.8rem", fontWeight: 600 }}
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP Code 🔑"}
                </button>

                {devOtp && (
                  <div style={{
                    marginTop: "1.5rem",
                    padding: "1.2rem",
                    background: "rgba(230,126,34,0.1)",
                    border: "1px dashed #e67e22",
                    borderRadius: "7px",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    color: "#ddd"
                  }}>
                    <strong>Dev Mode OTP Code: </strong>
                    <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#e67e22", marginLeft: "0.5rem" }}>{devOtp}</span>
                    {devLink && (
                      <a
                        href={devLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#3498db", textDecoration: "underline", display: "block", marginTop: "0.6rem" }}
                      >
                        Open Virtual Test Email 📧
                      </a>
                    )}
                  </div>
                )}

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab("signup"); setError(""); setSuccess(""); setDevOtp(""); setDevLink(""); }}
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: "1.3rem",
                    color: "#999",
                    textDecoration: "none",
                    marginTop: "1.5rem"
                  }}
                >
                  ← Back to Sign Up
                </a>
              </form>
            ) : activeTab === "login" ? (
              <form className="auth-modal-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab("forgot"); setError(""); setSuccess(""); }}
                  style={{
                    display: "block",
                    textAlign: "right",
                    fontSize: "1.2rem",
                    color: "#e67e22",
                    textDecoration: "none",
                    marginTop: "-1rem",
                    marginBottom: "1.5rem",
                    fontWeight: 500
                  }}
                >
                  Forgot Password?
                </a>
                <button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  textTransform: "uppercase",
                  fontSize: "1rem",
                  color: "#999",
                  margin: "0.2rem 0"
                }}>
                  <span style={{ flex: 1, height: "1px", backgroundColor: "#eee", marginRight: "10px" }}></span>
                  or
                  <span style={{ flex: 1, height: "1px", backgroundColor: "#eee", marginLeft: "10px" }}></span>
                </div>
                <a href={`${API_BASE_URL}/api/auth/google?client_url=${window.location.origin}`} className="btn-google" style={{ justifyContent: "center" }}>
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    width="18"
                    height="18"
                    alt="Google"
                  />
                  Sign in with Google
                </a>
              </form>
            ) : (
              <form className="auth-modal-form" onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={signupData.fullName}
                  onChange={(e) =>
                    setSignupData({ ...signupData, fullName: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password (min. 6 chars)"
                  required
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;