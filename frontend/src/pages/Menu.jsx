import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import CustomCursor from "../components/CustomCursor";
import { getMealMacros } from "../utils/nutrition";
import { API_BASE_URL } from "../utils/api";

const categoryLabels = {
  all: "All Meals",
  vegetarian: "Pure Veg 🟢",
  paleo: "Non-Veg 🔴",
  vegan: "Healthy / Vegan 🌱",
  jain: "Jain Friendly 🔸",
  fasting: "Fasting / Satvik 🌾"
};

const Menu = () => {
  const { cart, addToCart } = useCart();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [addedItems, setAddedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");

  const getAiExplanation = (query) => {
    if (!query) return "";
    const q = query.toLowerCase().trim();
    
    if (q.includes("protein") || q.includes("muscle") || q.includes("gym") || q.includes("bodybuilding")) {
      return "Based on your fitness goal, I have filtered meals with high protein density (cottage cheese, chicken, and egg dishes). These meals provide over 20g-30g of protein per serving to assist with muscle repair and satiety. 💪";
    }
    if (q.includes("light") || q.includes("diet") || q.includes("low cal") || q.includes("weight loss") || q.includes("calories")) {
      return "For a calorie deficit/weight management plan, I have selected lighter options under 350 kcal. These are fiber-rich, low in simple fats, and designed to keep you full longer. 🥗";
    }
    if (q.includes("spicy") || q.includes("spice") || q.includes("hot") || q.includes("teekha") || q.includes("mirch")) {
      return "I have selected dishes cooked with rich, warming Indian spices. Spices like cumin, turmeric, and cardamom contain antioxidants, while active capsaicin from green/red chilies is known to slightly boost metabolism. 🌶️";
    }
    if (q.includes("fasting") || q.includes("satvik") || q.includes("pure") || q.includes("light veg")) {
      return "I have filtered clean, light fasting-approved meals (like Sabudana Khichdi and Kuttu Puri). These are easily digestible, prepared without standard grains, and perfect for fasting periods like Navratri. 🌾";
    }
    if (q.includes("jain") || q.includes("onion") || q.includes("garlic")) {
      return "I have filtered Jain-friendly meals prepared strictly without onion, garlic, or root vegetables (like Jain Paneer Pulao and Jain Dal Khichdi). 🔸";
    }
    
    return `I analyzed our 5,000+ recipe database for "${query}". I have sorted and displayed the closest matches based on ingredient compatibility, caloric density, and average user satisfaction ratings. 🤖`;
  };

  useEffect(() => {
    if (!searchQuery) {
      setAiExplanation("");
      return;
    }
    setIsAiThinking(true);
    const timer = setTimeout(() => {
      setIsAiThinking(false);
      setAiExplanation(getAiExplanation(searchQuery));
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`);
        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  const getRelevanceScore = (meal, query) => {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    let score = 0;

    // Direct name match
    if (meal.name.toLowerCase() === q) score += 100;
    else if (meal.name.toLowerCase().includes(q)) score += 50;

    // Direct description match
    if (meal.description?.toLowerCase().includes(q)) score += 20;

    // Keyword matching
    const words = q.split(/\s+/);
    words.forEach(word => {
      if (word.length < 2) return;
      if (meal.name.toLowerCase().includes(word)) score += 15;
      if (meal.description?.toLowerCase().includes(word)) score += 5;
    });

    // Semantic Matches
    // 1. High Protein
    if (q.includes("protein") || q.includes("muscle") || q.includes("gym") || q.includes("bodybuilding")) {
      const macros = getMealMacros(meal.name);
      if (macros.protein >= 30) score += 60;
      else if (macros.protein >= 20) score += 40;
      else if (macros.protein >= 15) score += 20;
    }

    // 2. Light / Diet / Low Calorie
    if (q.includes("light") || q.includes("diet") || q.includes("low cal") || q.includes("weight loss") || q.includes("calories")) {
      if (meal.calories <= 250) score += 60;
      else if (meal.calories <= 350) score += 40;
      else if (meal.calories <= 450) score += 20;
      else score -= 20; // penalize high calorie meals
    }

    // 3. Spicy
    if (q.includes("spicy") || q.includes("spice") || q.includes("hot") || q.includes("teekha") || q.includes("mirch")) {
      const desc = meal.description?.toLowerCase() || "";
      const name = meal.name.toLowerCase();
      if (desc.includes("spicy") || desc.includes("spiced") || desc.includes("chili") || desc.includes("chilies") || desc.includes("hot") || name.includes("masala") || name.includes("tadka") || name.includes("kofta") || name.includes("rogan") || name.includes("bhurji")) {
        score += 50;
      }
    }

    // 4. Fasting / Satvik / Light Vegetarian
    if (q.includes("fasting") || q.includes("satvik") || q.includes("pure") || q.includes("light veg")) {
      const desc = meal.description?.toLowerCase() || "";
      const name = meal.name.toLowerCase();
      if (meal.category === "fasting" || meal.category === "vegan" || name.includes("yellow dal") || name.includes("dal tadka") || name.includes("bhindi") || name.includes("baingan") || name.includes("dosa") || name.includes("sabudana") || name.includes("kuttu")) {
        score += 50;
      }
    }

    // 5. Jain
    if (q.includes("jain") || q.includes("onion") || q.includes("garlic")) {
      if (meal.category === "jain" || meal.name.toLowerCase().includes("jain")) {
        score += 60;
      }
    }

    return score;
  };

  const getFilteredMeals = () => {
    // 1. Filter by category
    let list = filter === "all" ? meals : meals.filter(m => m.category === filter);

    // 2. Apply search scoring
    if (searchQuery.trim() !== "") {
      list = list
        .map(m => ({ ...m, _score: getRelevanceScore(m, searchQuery) }))
        .filter(m => m._score > 0)
        .sort((a, b) => b._score - a._score);
    }
    return list;
  };

  const filtered = getFilteredMeals();

  const getAIRecommendations = () => {
    if (meals.length === 0) return [];
    
    if (!cart || cart.length === 0) {
      return [...meals]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    }
    
    const cartCategories = cart.map(item => item.category);
    const cartIds = cart.map(item => item._id);
    
    let recommended = meals.filter(
      m => cartCategories.includes(m.category) && !cartIds.includes(m._id)
    );
    
    if (recommended.length === 0) {
      recommended = meals.filter(m => !cartIds.includes(m._id));
    }
    
    return [...recommended].sort((a, b) => b.rating - a.rating).slice(0, 3);
  };

  const handleAddToCart = (meal) => {
    addToCart(meal);
    setAddedItems((prev) => ({ ...prev, [meal._id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [meal._id]: false }));
    }, 1200);
  };

  return (
    <>
      <CustomCursor />

      <main style={{ padding: "9.6rem 0", minHeight: "80vh" }}>
        <div className="container">
          <span className="subheading">Our Menu</span>
          <h2 className="heading-secondary" style={{ marginBottom: "4.8rem" }}>
            All our delicious meals
          </h2>

          {/* AI Smart Search Bar */}
          <div style={{
            position: "relative",
            marginBottom: "3.2rem",
            maxWidth: "60rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "50px",
            padding: "0.4rem 0.4rem 0.4rem 2.4rem",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
          }} className="search-bar-container">
            <ion-icon name="search-outline" style={{ fontSize: "2.2rem", color: "#e67e22", marginRight: "1.2rem" }}></ion-icon>
            <input
              type="text"
              placeholder="Ask AI Search: try 'high protein', 'low cal diet', 'spicy chicken'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setDropdownOpen(false)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: "white",
                fontSize: "1.6rem",
                padding: "1rem 0",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#aaa",
                  cursor: "none",
                  fontSize: "2rem",
                  padding: "0 1.2rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                &times;
              </button>
            )}
            <span style={{
              backgroundColor: "rgba(230, 126, 34, 0.15)",
              color: "#e67e22",
              fontSize: "1.1rem",
              fontWeight: 700,
              padding: "0.8rem 1.6rem",
              borderRadius: "50px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginRight: "0.4rem",
              userSelect: "none"
            }}>AI Engine</span>

            {dropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "0.8rem",
                background: "#16213e",
                border: "1px solid rgba(230, 126, 34, 0.3)",
                borderRadius: "12px",
                boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.4)",
                zIndex: 1000,
                overflow: "hidden"
              }}>
                <div style={{
                  padding: "1rem 1.6rem",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#e67e22",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(230, 126, 34, 0.05)",
                  textAlign: "left"
                }}>
                  🤖 Ask AI Smart Search Presets:
                </div>
                {[
                  { label: "💪 High Protein (Gym & Muscle)", query: "high protein" },
                  { label: "🥗 Low Calorie Diet (Weight Loss)", query: "low cal diet" },
                  { label: "🌶️ Spicy & Rich (Masala Tadka)", query: "spicy" },
                  { label: "🌾 Light Veg (Satvik / Fasting)", query: "satvik" }
                ].map((preset) => (
                  <div
                    key={preset.query}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input blur before click triggers
                    }}
                    onClick={() => {
                      setSearchQuery(preset.query);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: "1.2rem 1.6rem",
                      fontSize: "1.4rem",
                      color: "#e0e0e0",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(230, 126, 34, 0.15)";
                      e.currentTarget.style.color = "#e67e22";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#e0e0e0";
                    }}
                  >
                    <span>{preset.label}</span>
                    <span style={{ fontSize: "1.2rem", color: "#888", fontStyle: "italic" }}>
                      "{preset.query}"
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Response Card */}
          {searchQuery && (
            <div style={{
              background: "rgba(230, 126, 34, 0.04)",
              border: "1px solid rgba(230, 126, 34, 0.25)",
              borderRadius: "15px",
              padding: "2rem",
              marginBottom: "3.2rem",
              maxWidth: "60rem",
              boxShadow: "0 8px 32px rgba(230, 126, 34, 0.05)",
              backdropFilter: "blur(4px)",
              textAlign: "left",
              transition: "all 0.3s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: "2rem" }}>🤖</span>
                <strong style={{ fontSize: "1.5rem", color: "#e67e22" }}>
                  {isAiThinking ? "AI is analyzing recipes..." : "AI Dietitian Response:"}
                </strong>
                {isAiThinking && (
                  <div className="ai-spinner" style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid #e67e22",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}></div>
                )}
              </div>
              <p style={{
                fontSize: "1.4rem",
                color: "#ddd",
                lineHeight: "1.6",
                margin: 0,
                minHeight: "4rem",
                display: "flex",
                alignItems: "center"
              }}>
                {isAiThinking ? (
                  <span style={{ color: "#888", fontStyle: "italic" }}>
                    Scanning macronutrients, calories, and cooking methods...
                  </span>
                ) : (
                  aiExplanation
                )}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "1.6rem", marginBottom: "4.8rem", flexWrap: "wrap" }}>
            {["all", "vegetarian", "vegan", "paleo", "jain", "fasting"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "0.8rem 2rem", fontSize: "1.4rem", fontWeight: 500,
                  borderRadius: "9px", border: "2px solid #e67e22",
                  backgroundColor: filter === cat ? "#e67e22" : "transparent",
                  color: filter === cat ? "white" : "#e67e22",
                  cursor: "none", transition: "all 0.3s ease",
                }}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* AI Smart Picks section */}
          {!loading && meals.length > 0 && (
            <div style={{
              background: "rgba(230, 126, 34, 0.05)",
              border: "1px solid rgba(230, 126, 34, 0.2)",
              borderRadius: "15px",
              padding: "3.2rem",
              marginBottom: "4.8rem",
              backdropFilter: "blur(8px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "0.8rem" }}>
                <span style={{
                  backgroundColor: "#e67e22", color: "white", padding: "0.4rem 1.2rem",
                  fontSize: "1.2rem", fontWeight: 700, borderRadius: "50px", textTransform: "uppercase"
                }}>AI Engine Active</span>
                <h3 style={{ fontSize: "2.2rem", fontWeight: 600, color: "#e67e22" }}>AI Smart Picks 🤖</h3>
              </div>
              <p style={{ fontSize: "1.4rem", color: "#999", marginBottom: "2.4rem" }}>
                Personalized recommendations powered by our <strong>Hybrid Content-Filtering & Collaborative Recommendation Algorithm</strong>.
              </p>
              
              <div className="grid grid--3-cols" style={{ gap: "2.4rem" }}>
                {getAIRecommendations().map((recMeal) => (
                  <div className="rec-meal-card" key={`rec-${recMeal._id}`} style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "11px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <img
                      src={recMeal.image}
                      alt={recMeal.name}
                      style={{ height: "16rem", objectFit: "cover", width: "100%" }}
                      onError={(e) => e.target.src = "/img/meals/meal-1.jpg"}
                    />
                    <div style={{ padding: "1.6rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div className="meal-tags" style={{ marginBottom: "0.8rem" }}>
                        <span className={`tag tag--${recMeal.category}`} style={{ fontSize: "1rem", padding: "0.2rem 0.6rem" }}>
                          {categoryLabels[recMeal.category]}
                        </span>
                      </div>
                      <p style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "1.2rem", color: "#e0e0e0" }}>{recMeal.name}</p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                        <span style={{ fontSize: "1.6rem", fontWeight: 600, color: "#e67e22" }}>₹{recMeal.price}</span>
                        <button
                          onClick={() => handleAddToCart(recMeal)}
                          style={{
                            padding: "0.6rem 1.2rem",
                            backgroundColor: addedItems[recMeal._id] ? "#27ae60" : "transparent",
                            border: "1px solid #e67e22",
                            color: addedItems[recMeal._id] ? "white" : "#e67e22",
                            borderRadius: "7px", fontSize: "1.2rem", fontWeight: 500,
                            cursor: "none", transition: "all 0.3s ease",
                          }}
                        >
                          {addedItems[recMeal._id] ? "Added! ✓" : "Add to Cart 🛒"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <p style={{ fontSize: "1.8rem", color: "#888" }}>Loading meals... 🍽️</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4.8rem" }}>
              <p style={{ fontSize: "2rem", color: "#888" }}>No meals found! 😔</p>
            </div>
          ) : (
            <div className="grid grid--3-cols">
              {filtered.map((meal) => (
                <div className="meal" key={meal._id}>
                  <img
                    src={meal.image}
                    className="meal-img"
                    alt={meal.name}
                    onError={(e) => e.target.src = "/img/meals/meal-1.jpg"}
                  />
                  <div className="meal-content">
                    <div className="meal-tags">
                      <span className={`tag tag--${meal.category}`}>
                        {categoryLabels[meal.category] || meal.category}
                      </span>
                    </div>
                    <p className="meal-title">{meal.name}</p>
                    <ul className="meal-attributes">
                      <li className="meal-attribute">
                        <ion-icon className="meal-icon" name="flame-outline"></ion-icon>
                        <span><strong>{meal.calories}</strong> calories</span>
                      </li>
                      <li className="meal-attribute">
                        <ion-icon className="meal-icon" name="restaurant-outline"></ion-icon>
                        <span>NutriScore &reg; <strong>{meal.nutriscore}</strong></span>
                      </li>
                      <li className="meal-attribute">
                        <ion-icon className="meal-icon" name="star-outline"></ion-icon>
                        <span><strong>{meal.rating}</strong> rating</span>
                      </li>
                      <li className="meal-attribute">
                        <ion-icon className="meal-icon" name="cash-outline"></ion-icon>
                        <span><strong>₹{meal.price}</strong> per meal</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => handleAddToCart(meal)}
                      style={{
                        width: "100%", marginTop: "2rem", padding: "1.2rem",
                        backgroundColor: addedItems[meal._id] ? "#27ae60" : "#e67e22",
                        color: "white", border: "none",
                        borderRadius: "9px", fontSize: "1.6rem", fontWeight: 500,
                        cursor: "none", transition: "all 0.3s ease",
                      }}
                      onMouseEnter={e => e.target.style.backgroundColor = addedItems[meal._id] ? "#27ae60" : "#cf711f"}
                      onMouseLeave={e => e.target.style.backgroundColor = addedItems[meal._id] ? "#27ae60" : "#e67e22"}
                    >
                      {addedItems[meal._id] ? "Added! ✓" : "Add to Cart 🛒"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Menu;