import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CustomCursor from "../components/CustomCursor";

const Profile = () => {
  const { user, token, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const darkMode = localStorage.getItem("darkMode") === "true";

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName }),
      });

      const data = await res.json();

      if (res.ok) {
        login({ ...data, token });
        setSuccess(true);
        setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Update failed!");
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomCursor />
      <main style={{
        padding: "9.6rem 0",
        minHeight: "80vh",
        backgroundColor: darkMode ? "#1a1a2e" : "transparent",
      }}>
        <div className="container">
          <span className="subheading">My Profile</span>
          <h2 className="heading-secondary" style={{
            marginBottom: "4.8rem",
            color: darkMode ? "#e0e0e0" : "#333",
          }}>
            Your Account
          </h2>

          <div style={{
            maxWidth: "60rem",
            background: darkMode ? "#16213e" : "white",
            borderRadius: "11px",
            padding: "3.2rem",
            boxShadow: "0 2.4rem 4.8rem rgba(0,0,0,0.075)",
          }}>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "2.4rem", marginBottom: "3.2rem" }}>
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt="profile"
                  style={{ width: "8rem", height: "8rem", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: "8rem", height: "8rem", borderRadius: "50%",
                  backgroundColor: "#e67e22", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "3.2rem", fontWeight: 600,
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontSize: "2.4rem", fontWeight: 600, color: darkMode ? "#e0e0e0" : "#333" }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: "1.6rem", color: darkMode ? "#aaa" : "#888" }}>
                  {user?.photo ? "Google Account" : "Email Account"}
                </p>
              </div>
            </div>

            {/* Success message */}
            {success && (
              <div style={{
                padding: "1.2rem 1.6rem", backgroundColor: "#d4edda",
                borderRadius: "9px", marginBottom: "2.4rem",
                color: "#155724", fontSize: "1.6rem",
              }}>
                ✅ Profile updated successfully!
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                padding: "1.2rem 1.6rem", backgroundColor: "#f8d7da",
                borderRadius: "9px", marginBottom: "2.4rem",
                color: "#721c24", fontSize: "1.6rem",
              }}>
                ❌ {error}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${darkMode ? "#0f3460" : "#eee"}`, marginBottom: "2.4rem" }}></div>

            {/* Profile Form */}
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: "2.4rem" }}>
                <label style={{
                  fontSize: "1.4rem", fontWeight: 500,
                  color: darkMode ? "#aaa" : "#888",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  display: "block", marginBottom: "0.8rem"
                }}>
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: "100%", padding: "1.2rem", fontSize: "1.8rem",
                      border: "2px solid #e67e22", borderRadius: "9px",
                      fontFamily: "inherit", outline: "none",
                      color: "#333", backgroundColor: "white",
                    }}
                  />
                ) : (
                  <p style={{ fontSize: "1.8rem", color: darkMode ? "#e0e0e0" : "#333", padding: "1.2rem 0" }}>
                    {user?.name}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "2.4rem" }}>
                <label style={{
                  fontSize: "1.4rem", fontWeight: 500,
                  color: darkMode ? "#aaa" : "#888",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  display: "block", marginBottom: "0.8rem"
                }}>
                  Email
                </label>
                <p style={{ fontSize: "1.8rem", color: darkMode ? "#e0e0e0" : "#333", padding: "1.2rem 0" }}>
                  {user?.email || "Google Account"}
                </p>
              </div>

              <div style={{ marginBottom: "2.4rem" }}>
                <label style={{
                  fontSize: "1.4rem", fontWeight: 500,
                  color: darkMode ? "#aaa" : "#888",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  display: "block", marginBottom: "0.8rem"
                }}>
                  Account Type
                </label>
                <p style={{ fontSize: "1.8rem", color: darkMode ? "#e0e0e0" : "#333", padding: "1.2rem 0" }}>
                  {user?.photo ? "🔵 Google OAuth" : "📧 Email & Password"}
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${darkMode ? "#0f3460" : "#eee"}`, marginBottom: "2.4rem" }}></div>

              <div style={{ display: "flex", gap: "1.6rem" }}>
                {editing ? (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "1.2rem 2.4rem", backgroundColor: "#e67e22",
                        color: "white", border: "none", borderRadius: "9px",
                        fontSize: "1.6rem", fontWeight: 500, cursor: "none",
                        transition: "background-color 0.3s",
                      }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setFullName(user?.name || ""); }}
                      style={{
                        padding: "1.2rem 2.4rem", backgroundColor: "transparent",
                        color: darkMode ? "#aaa" : "#888",
                        border: `2px solid ${darkMode ? "#0f3460" : "#ddd"}`,
                        borderRadius: "9px", fontSize: "1.6rem", cursor: "none",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    style={{
                      padding: "1.2rem 2.4rem", backgroundColor: "#e67e22",
                      color: "white", border: "none", borderRadius: "9px",
                      fontSize: "1.6rem", fontWeight: 500, cursor: "none",
                      transition: "background-color 0.3s",
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;