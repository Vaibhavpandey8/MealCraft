import AnimateOnScroll from "./AnimateOnScroll";

const Meals = () => {
  return (
    <section className="section-meals" id="meals">
      <div className="container center-text">
        <AnimateOnScroll direction="up">
          <span className="subheading">Meals</span>
          <h2 className="heading-secondary">MealCraft AI chooses from 5,000+ recipes</h2>
        </AnimateOnScroll>
      </div>
      <div className="container grid grid--3-cols margin-bottom-md">
        <AnimateOnScroll direction="up" delay={0.1}>
          <div className="meal">
            <img src="/img/meals/paneer_butter_masala.png" className="meal-img" alt="Paneer Butter Masala" onError={(e) => e.target.src = "/img/meals/meal-1.jpg"} />
            <div className="meal-content">
              <div className="meal-tags">
                <span className="tag tag--vegetarian">Pure Veg 🟢</span>
              </div>
              <p className="meal-title">Paneer Butter Masala</p>
              <ul className="meal-attributes">
                <li className="meal-attribute">
                  <ion-icon className="meal-icon" name="flame-outline"></ion-icon>
                  <span><strong>450</strong> calories</span>
                </li>
                <li className="meal-attribute">
                  <ion-icon className="meal-icon" name="restaurant-outline"></ion-icon>
                  <span>NutriScore &reg; <strong>82</strong></span>
                </li>
                <li className="meal-attribute">
                  <ion-icon className="meal-icon" name="star-outline"></ion-icon>
                  <span><strong>4.9</strong> rating (537)</span>
                </li>
              </ul>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="up" delay={0.2}>
          <div className="meal">
            <img src="/img/meals/butter_chicken.png" className="meal-img" alt="Butter Chicken" onError={(e) => e.target.src = "/img/meals/meal-2.jpg"} />
            <div className="meal-content">
              <div className="meal-tags">
                <span className="tag tag--paleo">Non-Veg 🔴</span>
              </div>
              <p className="meal-title">Butter Chicken</p>
              <ul className="meal-attributes">
                <li className="meal-attribute">
                  <ion-icon className="meal-icon" name="flame-outline"></ion-icon>
                  <span><strong>550</strong> calories</span>
                </li>
                <li className="meal-attribute">
                  <ion-icon className="meal-icon" name="restaurant-outline"></ion-icon>
                  <span>NutriScore &reg; <strong>80</strong></span>
                </li>
                <li className="meal-attribute">
                  <ion-icon className="meal-icon" name="star-outline"></ion-icon>
                  <span><strong>4.9</strong> rating (441)</span>
                </li>
              </ul>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="up" delay={0.3}>
          <div className="diets">
            <h3 className="heading-tertiary">Works with any diet:</h3>
            <ul className="list">
              {[
                "Vegetarian 🟢",
                "Non-Vegetarian 🔴",
                "Jain Friendly (No Onion-Garlic)",
                "Satvik Diet",
                "Gluten-free (Millet-based)",
                "Dairy-free / Vegan 🌱",
                "Eggetarian 🥚",
                "Kid-friendly 👶",
                "Festival Special (Navratri / Fasting)"
              ].map((diet) => (
                <li className="list-item" key={diet}>
                  <ion-icon className="list-icon" name="checkmark-outline"></ion-icon>
                  <span>{diet}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>
      </div>
      <div className="container all-recipes">
        <a href="#" className="link">See all recipes &rarr;</a>
      </div>
    </section>
  );
};

export default Meals;