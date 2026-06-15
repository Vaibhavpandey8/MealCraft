import Hero from "../components/Hero";
import FeaturedIn from "../components/FeaturedIn";
import HowItWorks from "../components/HowItWorks";
import Meals from "../components/Meals";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import Signup from "../components/Signup";
import CustomCursor from "../components/CustomCursor";

const Home = () => {
  return (
    <>
      <CustomCursor />
      <Hero />
      <FeaturedIn />
      <HowItWorks />
      <Meals />
      <Testimonials />
      <Pricing />
    </>
  );
};

export default Home;