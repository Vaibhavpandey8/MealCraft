import AnimateOnScroll from "./AnimateOnScroll";

const FeaturedIn = () => {
  return (
    <section className="section-featured">
      <div className="container">
        <AnimateOnScroll direction="fade">
          <h2 className="heading-featured-in">As featured in</h2>
        </AnimateOnScroll>
        <div className="logos">
          {["techcrunch", "business-insider", "the-new-york-times", "forbes", "usa-today"].map((logo, i) => (
            <AnimateOnScroll key={logo} delay={i * 0.1} direction="up">
              <img src={`/img/logos/${logo}.png`} alt={`${logo} logo`} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIn;