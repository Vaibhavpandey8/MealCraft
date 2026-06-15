import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CustomCursor from "../components/CustomCursor";
import { API_BASE_URL } from "../utils/api";

const Orders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const statusColor = {
    pending: "#f39c12",
    confirmed: "#27ae60",
    delivered: "#2980b9",
    cancelled: "#e74c3c",
  };

  return (
    <>
      <CustomCursor />
      <main style={{ padding: "9.6rem 0", minHeight: "80vh" }}>
        <div className="container">
          <span className="subheading">My Orders</span>
          <h2 className="heading-secondary" style={{ marginBottom: "4.8rem" }}>
            Welcome, {user?.name}! 👋
          </h2>

          {loading ? (
            <p style={{ fontSize: "1.8rem", color: "#888" }}>Loading orders... 📦</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4.8rem" }}>
              <p style={{ fontSize: "4rem" }}>🍽️</p>
              <p style={{ fontSize: "2rem", fontWeight: 600, marginTop: "1rem" }}>
                No orders yet!
              </p>
              <p style={{ fontSize: "1.6rem", color: "#888", marginTop: "1rem" }}>
                Go to Menu and order your first meal!
              </p>
              <Link
                to="/menu"
                className="btn btn--full"
                style={{ display: "inline-block", marginTop: "2.4rem" }}
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
              {orders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    background: "white",
                    borderRadius: "11px",
                    padding: "2.4rem",
                    boxShadow: "0 2.4rem 4.8rem rgba(0,0,0,0.075)",
                    display: "grid",
                    gridTemplateColumns: "8rem 1fr auto",
                    gap: "2.4rem",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={order.mealImage || "/img/meals/meal-1.jpg"}
                    alt={order.mealName}
                    style={{
                      width: "8rem",
                      height: "8rem",
                      borderRadius: "9px",
                      objectFit: "cover",
                    }}
                    onError={(e) => e.target.src = "/img/meals/meal-1.jpg"}
                  />

                  <div>
                    <p style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "0.8rem" }}>
                      {order.mealName}
                    </p>
                    <p style={{ fontSize: "1.4rem", color: "#888" }}>
                      Quantity: {order.quantity} &bull; ₹{order.price} per meal
                    </p>
                    <p style={{ fontSize: "1.4rem", color: "#888", marginTop: "0.4rem" }}>
                      📍 {order.deliveryAddress}
                    </p>
                    <p style={{ fontSize: "1.4rem", color: "#888", marginTop: "0.4rem" }}>
                      🕐 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.6rem 1.4rem",
                      borderRadius: "100px",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      backgroundColor: statusColor[order.status] + "22",
                      color: statusColor[order.status],
                      marginBottom: "1.2rem",
                      textTransform: "capitalize",
                    }}>
                      {order.status}
                    </span>
                    <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e67e22" }}>
                      ₹{order.price * order.quantity}
                    </p>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        style={{
                          marginTop: "1rem",
                          padding: "0.6rem 1.4rem",
                          fontSize: "1.3rem",
                          backgroundColor: "transparent",
                          border: "1px solid #e74c3c",
                          color: "#e74c3c",
                          borderRadius: "9px",
                          cursor: "none",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={e => {
                          e.target.style.backgroundColor = "#e74c3c";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={e => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#e74c3c";
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Orders;