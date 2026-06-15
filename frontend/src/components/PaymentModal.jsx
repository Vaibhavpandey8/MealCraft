import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import CustomCursor from "./CustomCursor";
import { API_BASE_URL } from "../utils/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ cartItems, totalAmount, address, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const mealNames = cartItems.map(item => `${item.name} x ${item.quantity}`).join(", ");
      
      const res = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          mealName: mealNames.substring(0, 100), // Metadata string limit
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create intent");
      }

      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: address,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // Save each item as a separate order record
        for (const item of cartItems) {
          await fetch(`${API_BASE_URL}/api/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              meal: item._id,
              mealName: item.name,
              mealImage: item.image,
              price: item.price,
              quantity: item.quantity,
              deliveryAddress: address,
            }),
          });
        }

        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Payment failed! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "2.4rem" }}>
        <label style={{
          fontSize: "1.4rem", fontWeight: 500, color: "#888",
          textTransform: "uppercase", letterSpacing: "0.5px",
          display: "block", marginBottom: "0.8rem"
        }}>
          Card Details
        </label>
        <div style={{
          padding: "1.2rem",
          border: "1px solid #ddd",
          borderRadius: "9px",
          backgroundColor: "white",
        }}>
          <CardElement options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#333",
                "::placeholder": { color: "#aaa" },
              },
            },
          }} />
        </div>
      </div>

      {error && (
        <p style={{ color: "red", fontSize: "1.4rem", marginBottom: "1.6rem" }}>
          ❌ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: "100%", padding: "1.4rem", backgroundColor: "#e67e22",
          color: "white", border: "none", borderRadius: "9px",
          fontSize: "1.8rem", fontWeight: 600, cursor: "none",
          transition: "background-color 0.3s",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Processing..." : `Pay ₹${totalAmount}`}
      </button>

      <p style={{ fontSize: "1.2rem", color: "#aaa", marginTop: "1.2rem", textAlign: "center" }}>
        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </p>
    </form>
  );
};

const PaymentModal = ({ cartItems, totalAmount, address, onSuccess, onClose }) => {
  return (
    <>
      <CustomCursor />
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)", zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "white", borderRadius: "11px", padding: "3.2rem",
          width: "90%", maxWidth: "50rem", position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "1.6rem", right: "1.6rem",
              background: "none", border: "none", fontSize: "2rem",
              cursor: "none", color: "#333",
            }}
          >✕</button>

          <h3 style={{ fontSize: "2.4rem", fontWeight: 600, marginBottom: "0.8rem", color: "#000" }}>
            Complete Payment
          </h3>
          <p style={{ fontSize: "1.6rem", color: "#888", marginBottom: "2.4rem" }}>
            Paying for {cartItems.length} items &bull; <strong style={{ color: "#e67e22" }}>₹{totalAmount}</strong>
          </p>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              cartItems={cartItems}
              totalAmount={totalAmount}
              address={address}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;