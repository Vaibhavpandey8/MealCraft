import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const headingRef = useRef(null);
  const taglineRef = useRef(null);
  const descRef = useRef(null);
  const btnsRef = useRef(null);
  const deliveredRef = useRef(null);
  const imgRef = useRef(null);
  const sectionRef = useRef(null);
  const typewriterRef = useRef(null);

  const texts = [
    "Never cook again!",
    "Eat healthy every day!",
    "365 days, zero effort!",
    "Your personal chef awaits!",
  ];

  useEffect(() => {
    // Entry animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(headingRef.current,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1 }
    )
    .fromTo(descRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8 }, "-=0.5"
    )
    .fromTo(btnsRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 }, "-=0.4"
    )
    .fromTo(deliveredRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 }, "-=0.3"
    )
    .fromTo(imgRef.current,
      { opacity: 0, x: 120, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 1.2 }, "-=1.5"
    );

    // Parallax on scroll
    gsap.to(imgRef.current, {
      y: -80,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Letter bounce - word level wrap
    const heading = headingRef.current;
    if (heading) {
      const words = heading.textContent.split(" ");
      const colors = ["#00BCD4", "#FF6B35", "#e91e63"];

      heading.innerHTML = words.map((word, wordIdx) => {
        const color = colors[wordIdx % colors.length];
        return `<span style="display:inline-block; white-space:nowrap; color: ${color};">${
          word.split("").map((char) =>
            `<span class="bounce-letter" style="display:inline-block; transition: transform 0.2s ease, color 0.2s ease; cursor:default; color: inherit;">${char}</span>`
          ).join("")
        }</span>`
      }).join(" ");

      heading.querySelectorAll(".bounce-letter").forEach((letter) => {
        letter.addEventListener("mouseenter", () => {
          gsap.to(letter, { y: -8, color: "#ffffff", duration: 0.2 });
        });
        letter.addEventListener("mouseleave", () => {
          gsap.to(letter, { y: 0, color: "inherit", duration: 0.2 });
        });
      });
    }

    // Letter bounce - word level wrap for tagline
    const tagline = taglineRef.current;
    if (tagline) {
      const words = tagline.textContent.split(" ");
      const wordColors = ["#00BCD4", "#888888", "#FF6B35", "#FF6B35", "#00BCD4", "#e91e63"];

      tagline.innerHTML = words.map((word, wordIdx) => {
        const color = wordColors[wordIdx] || "inherit";
        return `<span style="display:inline-block; white-space:nowrap; color: ${color};">${
          word.split("").map((char) =>
            char === "-"
              ? `<span class="bounce-letter" style="display:inline-block; transition: transform 0.2s ease, color 0.2s ease; cursor:default; margin: 0 8px; color: inherit;">${char}</span>`
              : `<span class="bounce-letter" style="display:inline-block; transition: transform 0.2s ease, color 0.2s ease; cursor:default; color: inherit;">${char}</span>`
          ).join("")
        }</span>`
      }).join(" ");

      tagline.querySelectorAll(".bounce-letter").forEach((letter) => {
        letter.addEventListener("mouseenter", () => {
          gsap.to(letter, { y: -5, color: "#ffffff", duration: 0.2 });
        });
        letter.addEventListener("mouseleave", () => {
          gsap.to(letter, { y: 0, color: "inherit", duration: 0.2 });
        });
      });
    }

    // Letter bounce - word level wrap for description
    const desc = descRef.current;
    if (desc) {
      const words = desc.textContent.split(" ");
      const colors = ["#00BCD4", "#FF6B35", "#e91e63"];

      desc.innerHTML = words.map((word, wordIdx) => {
        const color = colors[wordIdx % colors.length];
        return `<span style="display:inline-block; white-space:nowrap; color: ${color};">${
          word.split("").map((char) =>
            `<span class="bounce-letter" style="display:inline-block; transition: transform 0.2s ease, color 0.2s ease; cursor:default; color: inherit;">${char}</span>`
          ).join("")
        }</span>`
      }).join(" ");

      desc.querySelectorAll(".bounce-letter").forEach((letter) => {
        letter.addEventListener("mouseenter", () => {
          gsap.to(letter, { y: -3, color: "#ffffff", duration: 0.2 });
        });
        letter.addEventListener("mouseleave", () => {
          gsap.to(letter, { y: 0, color: "inherit", duration: 0.2 });
        });
      });
    }

    // Typewriter
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer;

    const typeWriter = () => {
      const current = texts[textIndex];
      const el = typewriterRef.current;
      if (!el) return;

      const colors = ["#00BCD4", "#FF6B35", "#e91e63"];

      if (!isDeleting) {
        const text = current.substring(0, charIndex + 1);
        const words = text.split(" ");
        el.innerHTML = words.map((word, wordIdx) => {
          const color = colors[wordIdx % colors.length];
          return `<span style="color: ${color}">${word}</span>`;
        }).join(" ");

        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          timer = setTimeout(typeWriter, 1500);
          return;
        }
      } else {
        const text = current.substring(0, charIndex - 1);
        const words = text.split(" ");
        el.innerHTML = words.map((word, wordIdx) => {
          const color = colors[wordIdx % colors.length];
          return `<span style="color: ${color}">${word}</span>`;
        }).join(" ");

        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % texts.length;
        }
      }
      timer = setTimeout(typeWriter, isDeleting ? 60 : 100);
    };

    setTimeout(typeWriter, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="section-hero" ref={sectionRef}>
      <div className="hero">
        <div className="hero-text-box">
          <span className="subheading" ref={taglineRef} style={{
            display: "inline-block",
            marginBottom: "1.2rem",
            fontFamily: '"Rubik", sans-serif',
            textTransform: "none",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            fontSize: "2.0rem"
          }}>
            MealCraft - Sehat ka Sahi Sathi
          </span>
          <h1 className="heading-primary" ref={headingRef}>
            A healthy meal delivered to your door, every single day
          </h1>

          <p className="hero-description" ref={descRef}>
            The smart 365-days-per-year food subscription that will make you
            eat healthy again. Tailored to your personal tastes and nutritional
            needs.
          </p>

          <div ref={btnsRef}>
            <p style={{
              fontSize: "2.2rem",
              fontWeight: 600,
              color: "#FF6B35",
              marginBottom: "2rem",
              minHeight: "3.5rem",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span ref={typewriterRef}></span>
              <span style={{
                display: "inline-block",
                width: "3px",
                height: "2.4rem",
                backgroundColor: "#FF6B35",
                animation: "blink 0.7s step-end infinite",
                marginLeft: "2px",
                verticalAlign: "middle"
              }}></span>
            </p>

            <Link to="/menu" className="btn btn--full margin-right-sm">
              Start eating well
            </Link>
            <a href="#how" className="btn btn--outline">
              Learn more &darr;
            </a>
          </div>

          <div className="delivered-meals" ref={deliveredRef}>
            <div className="delivered-imgs">
              <img src="/img/customers/customer-1.jpg" alt="Customer photo" />
              <img src="/img/customers/customer-2.jpg" alt="Customer photo" />
              <img src="/img/customers/customer-3.jpg" alt="Customer photo" />
              <img src="/img/customers/customer-4.jpg" alt="Customer photo" />
              <img src="/img/customers/customer-5.jpg" alt="Customer photo" />
              <img src="/img/customers/customer-6.jpg" alt="Customer photo" />
            </div>
            <p className="delivered-text">
              <span>250,000+</span> meals delivered last year!
            </p>
          </div>
        </div>

        <div className="hero-img-box" ref={imgRef}>
          <picture>
            <source srcSet="/img/hero.webp" type="image/webp" />
            <source srcSet="/img/hero-min.png" type="image/png" />
            <img
              src="/img/hero-min.png"
              className="hero-img"
              alt="Woman enjoying food"
            />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default Hero;