import { useRef } from "react";
import { Link } from "react-router-dom";
import AnimateOnScroll from "./AnimateOnScroll";
import useBounceText from "../hooks/useBounceText";

const Pricing = () => {
  const headingRef = useRef(null);
  useBounceText(headingRef);

  return (
    <section className="section-pricing" id="pricing">
      <div className="container">
        <AnimateOnScroll direction="up">
          <span className="subheading">Pricing</span>
          <h2 className="heading-secondary" ref={headingRef}>
            Eating well without breaking the bank
          </h2>
        </AnimateOnScroll>
      </div>
      <div className="container grid grid--2-cols margin-bottom-md">
        <AnimateOnScroll direction="left" delay={0.1}>
          <div className="pricing-plan pricing-plan--starter">
            <header className="plan-header">
              <p className="plan-name">Starter</p>
              <p className="plan-price"><span>₹</span>2,999</p>
              <p className="plan-text">per month. That's just ₹99 per meal!</p>
            </header>
            <ul className="list">
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span>1 Desi meal per day</span></li>
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span>Order from 11am to 10pm</span></li>
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span>Delivery is free</span></li>
              <li className="list-item"><ion-icon className="list-icon" name="close-outline" style={{ color: "#e74c3c" }}></ion-icon><span>No premium festival menus</span></li>
            </ul>
            <div className="plan-sing-up">
              <Link to="/menu" className="btn btn--full">Start eating well</Link>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right" delay={0.2}>
          <div className="pricing-plan pricing-plan--complete">
            <header className="plan-header">
              <p className="plan-name">Complete</p>
              <p className="plan-price"><span>₹</span>4,999</p>
              <p className="plan-text">per month. That's just ₹79 per meal!</p>
            </header>
            <ul className="list">
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span><strong>2 Desi meals</strong> per day</span></li>
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span>Order <strong>24/7</strong></span></li>
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span>Delivery is free</span></li>
              <li className="list-item"><ion-icon className="list-icon" name="checkmark-outline"></ion-icon><span>Access to premium festival menus</span></li>
            </ul>
            <div className="plan-sing-up">
              <Link to="/menu" className="btn btn--full">Start eating well</Link>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      <div className="container grid">
        <aside className="plan-details">
          Prices include all applicable taxes. You can cancel at any time. Both plans include the following:
        </aside>
      </div>

      <div className="container grid grid--4-cols">
        {[
          { icon: "infinite-outline", title: "Never cook again!", text: "Our subscriptions cover 365 days per year, even including major holidays." },
          { icon: "nutrition-outline", title: "Ghee & Premium Spices", text: "Our cooks only use premium ingredients, pure Desi ghee, and fresh organic vegetables." },
          { icon: "leaf-outline", title: "Eco-Friendly Tiffin", text: "All our partners use reusable eco-friendly tiffins to keep your food hot and fresh." },
          { icon: "pause-outline", title: "Pause anytime", text: "Going on vacation? Just pause your subscription, and we refund unused days." },
        ].map((feature, i) => (
          <AnimateOnScroll key={feature.title} direction="up" delay={i * 0.1}>
            <div className="feature">
              <ion-icon className="feature-icon" name={feature.icon}></ion-icon>
              <p className="feature-title">{feature.title}</p>
              <p className="feature-text">{feature.text}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
};

export default Pricing;