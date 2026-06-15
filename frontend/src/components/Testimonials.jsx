import { useRef } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import useBounceText from "../hooks/useBounceText";

const Testimonials = () => {
  const headingRef = useRef(null);
  useBounceText(headingRef);

  const testimonials = [
    { name: "Dave Bryson", img: "/img/customers/dave.jpg", text: "Inexpensive, healthy and great-tasting meals, without even having to order manually! It feels truly magical." },
    { name: "Ben Hadley", img: "/img/customers/ben.jpg", text: "The AI algorithm is crazy good, it chooses the right meals for me every time. It's amazing not to worry about food anymore!" },
    { name: "Steve Miller", img: "/img/customers/steve.jpg", text: "MealCraft is a life saver! I just started a company, so there's no time for cooking. I couldn't live without my daily meals now!" },
    { name: "Hannah Smith", img: "/img/customers/hannah.jpg", text: "I got MealCraft for the whole family, and it frees up so much time! Plus, everything is organic and vegan and without plastic." },
  ];

  return (
    <section className="section-testimonials" id="testimonials">
      <div className="testimonials-container">
        <AnimateOnScroll direction="up">
          <span className="subheading">Testimonials</span>
          <h2 className="heading-secondary" ref={headingRef}>
            Once you try it, you can't go back
          </h2>
        </AnimateOnScroll>
        <div className="testimonials">
          {testimonials.map((t, i) => (
            <AnimateOnScroll key={t.name} delay={i * 0.15} direction="up">
              <figure className="testimonial">
                <img className="testimonial-img" alt={t.name} src={t.img} />
                <blockquote className="testimonial-text">{t.text}</blockquote>
                <p className="testimonial-name">&mdash; {t.name}</p>
              </figure>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
      <div className="gallery">
        {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
          <AnimateOnScroll key={n} delay={n * 0.05} direction="fade">
            <figure className="gallery-item">
              <img src={`/img/gallery/gallery-${n}.jpg`} alt="Food gallery" />
            </figure>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;