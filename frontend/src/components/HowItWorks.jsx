import { useRef } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import useBounceText from "../hooks/useBounceText";

const HowItWorks = () => {
  const headingRef = useRef(null);
  useBounceText(headingRef);

  return (
    <section className="section-how" id="how">
      <div className="container">
        <AnimateOnScroll direction="up">
          <span className="subheading">How it works</span>
          <h2 className="heading-secondary" ref={headingRef}>
            Your daily dose of health in 3 simple steps
          </h2>
        </AnimateOnScroll>
      </div>
      <div className="container grid grid--2-cols grid--center-v">
        <AnimateOnScroll direction="left" delay={0.1}>
          <div className="step-text-box">
            <p className="step-number">01</p>
            <h3 className="heading-tertiary">Tell us what you like (and what not)</h3>
            <p className="step-description">
              Never again waste time thinking about what to eat! MealCraft AI
              will create a 100% personalized weekly meal plan just for you.
            </p>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll direction="right" delay={0.2}>
          <div className="step-img-box">
            <img src="/img/app/app-screen-1.png" className="step-img" alt="App screen 1" />
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="left" delay={0.1}>
          <div className="step-img-box">
            <img src="/img/app/app-screen-2.png" className="step-img" alt="App screen 2" />
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll direction="right" delay={0.2}>
          <div className="step-text-box">
            <p className="step-number">02</p>
            <h3 className="heading-tertiary">Approve your weekly meal plan</h3>
            <p className="step-description">
              Once per week, approve the meal plan generated for you by MealCraft
              AI. You can change ingredients, swap entire meals, or even add
              your own recipes.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="left" delay={0.1}>
          <div className="step-text-box">
            <p className="step-number">03</p>
            <h3 className="heading-tertiary">Receive meals at convenient time</h3>
            <p className="step-description">
              Best chefs in town will cook your selected meal every day, and we
              will deliver it to your door whenever works best for you.
            </p>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll direction="right" delay={0.2}>
          <div className="step-img-box">
            <img src="/img/app/app-screen-3.png" className="step-img" alt="App screen 3" />
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default HowItWorks;