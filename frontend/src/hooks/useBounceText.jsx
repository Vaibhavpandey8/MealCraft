import { useEffect } from "react";
import { gsap } from "gsap";

const useBounceText = (ref) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.textContent.split(" ");
    el.innerHTML = words.map((word) =>
      `<span style="display:inline-block; white-space:nowrap">${
        word.split("").map((char) =>
          `<span class="bounce-letter" style="display:inline-block; transition: transform 0.2s ease, color 0.2s ease; cursor:default; color: inherit;">${char}</span>`
        ).join("")
      }</span>`
    ).join(" ");

    el.querySelectorAll(".bounce-letter").forEach((letter) => {
      letter.addEventListener("mouseenter", () => {
        gsap.to(letter, { y: -8, color: "#e67e22", duration: 0.2 });
      });
      letter.addEventListener("mouseleave", () => {
        gsap.to(letter, { y: 0, color: "inherit", duration: 0.2 });
      });
    });
  }, []);
};

export default useBounceText;