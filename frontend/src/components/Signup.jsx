import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Jab user logout kare toh success reset ho jaaye
  useEffect(() => {
    if (!user) {
      setSuccess(false);
      setFormData({ fullName: "", email: "", password: "" });
      setError("");
    }
  }, [user]);

  // Agar logged in hai toh welcome message
  if (user) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "2rem" }}>👋</p>
        <p style={{ fontSize: "1.8rem", fontWeight: 600 }}>
          Welcome back, {user.name}!
        </p>
        <p style={{ fontSize: "1.4rem", color: "#555" }}>
          You are already signed in. Enjoy your meals! 🍽️
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Signup failed!");
      }
    } catch (err) {
      setError("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <p style={{ fontSize: "2rem" }}>📧</p>
        <p style={{ fontSize: "1.8rem", fontWeight: 600 }}>Check your email!</p>
        <p style={{ fontSize: "1.4rem", color: "#555" }}>
          We sent a verification link to <b>{formData.email}</b>
        </p>
      </div>
    );
  }

  return (
    <form className="cta-form" onSubmit={handleSubmit}>
      {error && (
        <p style={{ color: "red", fontSize: "1.4rem", marginBottom: "1rem" }}>
          {error}
        </p>
      )}
      <div>
        <label htmlFor="signup-name">Full Name</label>
        <input
          id="signup-name"
          type="text"
          placeholder="John Smith"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="signup-email">Email address</label>
        <input
          id="signup-email"
          type="email"
          placeholder="me@example.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          placeholder="Min. 6 characters"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <button type="submit" className="btn btn--form" disabled={loading}>
        {loading ? "Signing up..." : "Start eating well"}
      </button>
    </form>
  );
};

export default Signup;
