import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AIPlanner from "./pages/AIPlanner";
import PlannerResult from "./pages/PlannerResult";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToAnchor from "./components/ScrollToAnchor";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToAnchor />
          <video
            className="global-bg-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/img/bg.mp4" type="video/mp4" />
          </video>
          <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/planner" element={<AIPlanner />} />
          <Route path="/planner-result" element={<PlannerResult />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;