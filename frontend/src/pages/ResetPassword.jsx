import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuthModalOpen, setAuthModalTab } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long!");
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Password reset successful!");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate("/");
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  return (
    <>
      <CustomCursor />
      <main style={{ padding: "9.6rem 0", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          width: "100%",
          maxWidth: "45rem",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "15px",
          padding: "4rem",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ fontSize: "2.8rem", fontWeight: 700, color: "#e67e22", marginBottom: "1.2rem", textAlign: "center" }}>
            Reset Password 🔒
          </h2>
          
          {success ? (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <p style={{ fontSize: "5rem", marginBottom: "1.5rem" }}>🎉</p>
              <p style={{ fontSize: "1.6rem", color: "#2ecc71", fontWeight: 500, marginBottom: "2.4rem", lineHeight: "1.5" }}>
                {success}
              </p>
              <button
                onClick={handleLoginClick}
                style={{
                  width: "100%",
                  padding: "1.2rem",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  backgroundColor: "#e67e22",
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  cursor: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => e.target.style.backgroundColor = "#cf711f"}
                onMouseLeave={e => e.target.style.backgroundColor = "#e67e22"}
              >
                Log In Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2rem" }}>
              <p style={{ fontSize: "1.4rem", color: "#ccc", textAlign: "center", lineHeight: "1.4" }}>
                Please choose a strong new password (minimum 6 characters) for your account.
              </p>

              {error && (
                <p style={{ color: "red", fontSize: "1.4rem", textAlign: "center", margin: 0 }}>
                  {error}
                </p>
              )}

              <div>
                <label style={{ fontSize: "1.3rem", color: "#999", display: "block", marginBottom: "0.8rem" }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.2rem",
                    fontSize: "1.6rem",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid #555",
                    borderRadius: "9px",
                    color: "white",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "1.3rem", color: "#999", display: "block", marginBottom: "0.8rem" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.2rem",
                    fontSize: "1.6rem",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid #555",
                    borderRadius: "9px",
                    color: "white",
                    outline: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1.4rem",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  backgroundColor: "#e67e22",
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  cursor: "none",
                  transition: "all 0.3s ease",
                  marginTop: "1rem"
                }}
                onMouseEnter={e => e.target.style.backgroundColor = "#cf711f"}
                onMouseLeave={e => e.target.style.backgroundColor = "#e67e22"}
              >
                {loading ? "Resetting Password..." : "Update Password 🔒"}
              </button>

              <Link
                to="/"
                style={{
                  textAlign: "center",
                  fontSize: "1.3rem",
                  color: "#999",
                  textDecoration: "none",
                  marginTop: "1rem"
                }}
              >
                ← Back to Home
              </Link>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default ResetPassword;
