import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AnimateOnScroll = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;

    const fromVars = {
      up: { opacity: 0, y: 80 },
      down: { opacity: 0, y: -80 },
      left: { opacity: 0, x: -80 },
      right: { opacity: 0, x: 80 },
      fade: { opacity: 0, scale: 0.95 },
    };

    gsap.fromTo(
      el,
      fromVars[direction],
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: 1,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return <div ref={ref}>{children}</div>;
};

export default AnimateOnScroll;