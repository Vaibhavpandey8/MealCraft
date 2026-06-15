import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Footer = () => {
  const { setAuthModalOpen, setAuthModalTab } = useAuth();
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: "", body: "" });

  const openInfoModal = (title, body) => {
    setInfoModalData({ title, body });
    setInfoModalOpen(true);
  };

  return (
    <footer className="footer">
      <div className="container grid grid--footer">
        <div className="logo-col">
          <Link to="/" className="footer-logo">
            <img className="logo" alt="MealCraft logo" src="/img/mealcraft-logo.png" />
          </Link>
          <ul className="social-links">
            <li>
              <a className="footer-link" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <ion-icon className="social-icon" name="logo-instagram"></ion-icon>
              </a>
            </li>
            <li>
              <a className="footer-link" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <ion-icon className="social-icon" name="logo-facebook"></ion-icon>
              </a>
            </li>
            <li>
              <a className="footer-link" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <ion-icon className="social-icon" name="logo-twitter"></ion-icon>
              </a>
            </li>
          </ul>
          <p className="copyright">
            Copyright &copy; {new Date().getFullYear()} by MealCraft, Inc. All rights reserved.
          </p>
        </div>

        <div className="address-col">
          <p className="footer-heading">Contact us</p>
          <address className="contacts">
            <p className="address">Rashtrapati Bhavan, New Delhi, Delhi 110004, India</p>
            <p>
              <a className="footer-link" href="tel:415-201-6370">415-201-6370</a><br />
              <a className="footer-link" href="mailto:hello@mealcraft.com">hello@mealcraft.com</a>
            </p>
          </address>
        </div>

        <nav className="nav-col">
          <p className="footer-heading">Account</p>
          <ul className="footer-nav">
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthModalTab("signup");
                  setAuthModalOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Create account
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthModalTab("login");
                  setAuthModalOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Sign in
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "MealCraft for iOS",
                    "Our iOS mobile app is currently in the crafting stage. We are cooking up a premium experience for Apple App Store! 🚀"
                  );
                }}
              >
                iOS app
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "MealCraft for Android",
                    "Our Android mobile app is currently in the crafting stage. We are cooking up a premium experience for Google Play Store! 🚀"
                  );
                }}
              >
                Android app
              </a>
            </li>
          </ul>
        </nav>

        <nav className="nav-col">
          <p className="footer-heading">Company</p>
          <ul className="footer-nav">
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "About MealCraft",
                    "MealCraft is a premium food subscription service delivering healthy, chef-prepared meals straight to your door, 365 days a year. Our mission is to make clean eating effortless and delicious, customized to your nutritional needs. 🍽️"
                  );
                }}
              >
                About MealCraft
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "MealCraft for Business",
                    "Boost employee health, productivity, and happiness with customized corporate meal subscriptions. We cater to offices of all sizes, offering flexible team packages, event catering, and employee wellness perks. Contact corporate@mealcraft.com for plans. 🏢"
                  );
                }}
              >
                For Business
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "Become a Cooking Partner",
                    "Thank you for your interest! We love collaborating with local chefs and kitchens. Please send an email to partnership@mealcraft.com with details about your setup, and our team will get in touch with you within 2-3 business days. 🍳"
                  );
                }}
              >
                Cooking partners
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "Careers at MealCraft",
                    "We are always looking for passionate people to join our team—from chefs and nutritionists to engineers and designers. Send your resume and portfolio to careers@mealcraft.com. Let's make healthy eating accessible together! 💼"
                  );
                }}
              >
                Careers
              </a>
            </li>
          </ul>
        </nav>

        <nav className="nav-col">
          <p className="footer-heading">Resources</p>
          <ul className="footer-nav">
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "Recipe Directory",
                    "Explore our rich catalog of healthy meals, categorized by diets like vegetarian, vegan, keto, and gluten-free. Complete recipes, nutritional facts, and ingredient transparency details are available inside our menu catalog! 📚"
                  );
                }}
              >
                Recipe directory
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "Help & Support",
                    "Have questions about subscriptions, delivery timings, or customized plans? Our support team is online 24/7 to assist you. Send us an email at hello@mealcraft.com or reach out via our social handles. We will resolve your queries within 24 hours. 💬"
                  );
                }}
              >
                Help center
              </a>
            </li>
            <li>
              <a
                className="footer-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openInfoModal(
                    "Privacy Policy & Terms",
                    "MealCraft is committed to protecting your personal data and ensuring a secure experience. We use bank-grade encryption to handle payments and securely store order details. For our complete terms and conditions, feel free to contact us at privacy@mealcraft.com. 🔐"
                  );
                }}
              >
                Privacy & terms
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {infoModalOpen && (
        <>
          <div className="auth-overlay" onClick={() => setInfoModalOpen(false)}></div>
          <div className="auth-modal" style={{ textAlign: "center", alignItems: "center" }}>
            <button className="auth-modal-close" onClick={() => setInfoModalOpen(false)}>
              &times;
            </button>
            <h3 style={{ fontSize: "2.4rem", fontWeight: 600, color: "#e67e22", marginBottom: "1.6rem" }}>
              {infoModalData.title}
            </h3>
            <p style={{ fontSize: "1.6rem", color: "#e0e0e0", lineHeight: "1.6", marginBottom: "2.8rem" }}>
              {infoModalData.body}
            </p>
            <button
              onClick={() => setInfoModalOpen(false)}
              style={{
                padding: "1.2rem 2.8rem",
                backgroundColor: "#e67e22",
                color: "white",
                border: "none",
                borderRadius: "9px",
                fontSize: "1.6rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.3s"
              }}
            >
              Okay, got it!
            </button>
          </div>
        </>
      )}
    </footer>
  );
};

export default Footer;