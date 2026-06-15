import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import { getMealMacros } from "../utils/nutrition";
import { API_BASE_URL } from "../utils/api";

const categoryLabels = {
  vegetarian: "Pure Veg 🟢",
  paleo: "Non-Veg 🔴",
  vegan: "Healthy / Vegan 🌱"
};

const activityFactors = {
  sedentary: { label: "Sedentary (Little/no exercise)", multiplier: 1.2 },
  light: { label: "Lightly Active (Exercise 1-3 days/week)", multiplier: 1.375 },
  moderate: { label: "Moderately Active (Exercise 3-5 days/week)", multiplier: 1.55 },
  active: { label: "Very Active (Exercise 6-7 days/week)", multiplier: 1.725 },
  extreme: { label: "Extra Active (Hard labor / Athlete)", multiplier: 1.9 }
};

const goals = {
  loss: { label: "Weight Loss (Deficit) 📉", adjustment: -500, macroRatio: { carbs: 0.40, protein: 0.30, fat: 0.30 } },
  maintain: { label: "Weight Maintenance (Balance) ⚖️", adjustment: 0, macroRatio: { carbs: 0.50, protein: 0.20, fat: 0.30 } },
  gain: { label: "Muscle Gain (Surplus) 📈", adjustment: 300, macroRatio: { carbs: 0.45, protein: 0.35, fat: 0.20 } }
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const PlannerResult = () => {
  const { addMultipleToCart } = useCart();
  const navigate = useNavigate();

  // Load state from localStorage or initial defaults
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem("omni_weekly_plan");
    return saved ? JSON.parse(saved) : null;
  });

  const [calTargets, setCalTargets] = useState(() => {
    const saved = localStorage.getItem("omni_cal_targets");
    return saved ? JSON.parse(saved) : null;
  });

  const [inputs, setInputs] = useState(() => {
    const saved = localStorage.getItem("omni_planner_inputs");
    return saved ? JSON.parse(saved) : null;
  });

  // App data states
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMessage, setAddedMessage] = useState(false);

  // Fetch meals database for swapping and regeneration
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`);
        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch meals in planner results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  const calculateTargets = (currentInputs) => {
    const { age, weight, height, gender, activity, goal } = currentInputs;
    // Mifflin-St Jeor Equation
    let bmrVal = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    if (gender === "male") {
      bmrVal += 5;
    } else if (gender === "female") {
      bmrVal -= 161;
    } else {
      bmrVal -= 78; // average
    }

    const tdeeVal = bmrVal * activityFactors[activity].multiplier;
    const dailyTargetVal = Math.max(1200, Math.min(4500, Math.round(tdeeVal + goals[goal].adjustment)));

    const selectedRatio = goals[goal].macroRatio;
    const carbGrams = Math.round((dailyTargetVal * selectedRatio.carbs) / 4);
    const proteinGrams = Math.round((dailyTargetVal * selectedRatio.protein) / 4);
    const fatGrams = Math.round((dailyTargetVal * selectedRatio.fat) / 9);

    return {
      bmr: Math.round(bmrVal),
      tdee: Math.round(tdeeVal),
      dailyTarget: dailyTargetVal,
      macros: { carbs: carbGrams, protein: proteinGrams, fat: fatGrams }
    };
  };

  const handleGeneratePlan = () => {
    if (!inputs || meals.length === 0) return;

    const targets = calculateTargets(inputs);
    setCalTargets(targets);
    localStorage.setItem("omni_cal_targets", JSON.stringify(targets));

    // Filter meals by diet preference
    let allowedMeals = [];
    const diet = inputs.diet;
    if (diet === "vegetarian") {
      allowedMeals = meals.filter(m => m.category === "vegetarian" || m.category === "vegan" || m.category === "jain" || m.category === "fasting");
    } else if (diet === "vegan") {
      allowedMeals = meals.filter(m => m.category === "vegan");
    } else if (diet === "jain") {
      allowedMeals = meals.filter(m => m.category === "jain");
    } else if (diet === "fasting") {
      allowedMeals = meals.filter(m => m.category === "fasting");
    } else {
      allowedMeals = meals;
    }

    if (allowedMeals.length === 0) {
      allowedMeals = meals;
    }

    // Targets for slots
    const breakfastTarget = targets.dailyTarget * 0.30;
    const lunchTarget = targets.dailyTarget * 0.40;
    const dinnerTarget = targets.dailyTarget * 0.30;

    // Pick a meal for a slot with proximity & variation
    const pickMeal = (slotTarget, typeSeed, dayIndex) => {
      const sorted = [...allowedMeals].sort((a, b) => Math.abs(a.calories - slotTarget) - Math.abs(b.calories - slotTarget));
      const pool = sorted.slice(0, 4);
      const seedIndex = (dayIndex + typeSeed + Math.floor(Math.random() * 3)) % pool.length;
      return pool[seedIndex] || sorted[0];
    };

    const newPlan = {};
    daysOfWeek.forEach((day, index) => {
      newPlan[day] = {
        breakfast: pickMeal(breakfastTarget, 10, index),
        lunch: pickMeal(lunchTarget, 20, index),
        dinner: pickMeal(dinnerTarget, 30, index)
      };
    });

    setWeeklyPlan(newPlan);
    localStorage.setItem("omni_weekly_plan", JSON.stringify(newPlan));
  };

  const handleSwapMeal = (day, mealType) => {
    if (!weeklyPlan || meals.length === 0 || !inputs) return;

    const currentMeal = weeklyPlan[day][mealType];
    let allowedMeals = [];
    const diet = inputs.diet;
    if (diet === "vegetarian") {
      allowedMeals = meals.filter(m => m.category === "vegetarian" || m.category === "vegan" || m.category === "jain" || m.category === "fasting");
    } else if (diet === "vegan") {
      allowedMeals = meals.filter(m => m.category === "vegan");
    } else if (diet === "jain") {
      allowedMeals = meals.filter(m => m.category === "jain");
    } else if (diet === "fasting") {
      allowedMeals = meals.filter(m => m.category === "fasting");
    } else {
      allowedMeals = meals;
    }

    const alternatives = allowedMeals.filter(m => m._id !== currentMeal._id);
    if (alternatives.length === 0) return;

    const targetCals = currentMeal.calories;
    const sortedAlts = alternatives.sort((a, b) => Math.abs(a.calories - targetCals) - Math.abs(b.calories - targetCals));
    const randomAlt = sortedAlts[Math.floor(Math.random() * Math.min(3, sortedAlts.length))];

    const updatedPlan = {
      ...weeklyPlan,
      [day]: {
        ...weeklyPlan[day],
        [mealType]: randomAlt
      }
    };

    setWeeklyPlan(updatedPlan);
    localStorage.setItem("omni_weekly_plan", JSON.stringify(updatedPlan));
  };

  const handleAddAllToCart = () => {
    if (!weeklyPlan) return;
    const allMeals = [];
    daysOfWeek.forEach(day => {
      allMeals.push(weeklyPlan[day].breakfast);
      allMeals.push(weeklyPlan[day].lunch);
      allMeals.push(weeklyPlan[day].dinner);
    });

    addMultipleToCart(allMeals);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  // Calculate actual plan averages
  const getPlanAverages = () => {
    if (!weeklyPlan) return { calories: 0, carbs: 0, protein: 0, fat: 0 };
    let totalCals = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;

    daysOfWeek.forEach(day => {
      const b = weeklyPlan[day].breakfast;
      const l = weeklyPlan[day].lunch;
      const d = weeklyPlan[day].dinner;

      [b, l, d].forEach(m => {
        totalCals += m.calories;
        const macros = getMealMacros(m.name);
        totalCarbs += macros.carbs;
        totalProtein += macros.protein;
        totalFat += macros.fat;
      });
    });

    return {
      calories: Math.round(totalCals / 7),
      carbs: Math.round(totalCarbs / 7),
      protein: Math.round(totalProtein / 7),
      fat: Math.round(totalFat / 7)
    };
  };

  // If no plan exists, guide user back to form
  if (!weeklyPlan || !calTargets || !inputs) {
    return (
      <>
        <CustomCursor />
        <main style={{ padding: "9.6rem 0", minHeight: "80vh", position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "15px",
            padding: "6rem 4rem",
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            textAlign: "center",
            maxWidth: "60rem",
            width: "90%"
          }}>
            <span style={{ fontSize: "6rem", display: "block", marginBottom: "2rem" }}>📊</span>
            <h2 style={{ fontSize: "3rem", fontWeight: 700, color: "#fff", marginBottom: "1.6rem" }}>No Meal Plan Found</h2>
            <p style={{ fontSize: "1.6rem", color: "#ccc", marginBottom: "3.2rem", lineHeight: "1.6" }}>
              Aapka koi active meal plan generate nahi hua hai. Please metrics fill karke apna personalized meal plan generate karein.
            </p>
            <Link
              to="/planner"
              style={{
                display: "inline-block",
                padding: "1.4rem 3.2rem",
                fontSize: "1.6rem",
                fontWeight: 600,
                backgroundColor: "#e67e22",
                color: "white",
                textDecoration: "none",
                borderRadius: "9px",
                transition: "all 0.3s",
                boxShadow: "0 4px 15px rgba(230,126,34,0.4)"
              }}
            >
              Go to AI Planner ⚡
            </Link>
          </div>
        </main>
      </>
    );
  }

  const planAverages = getPlanAverages();

  return (
    <>
      <CustomCursor />
      <main style={{ padding: "9.6rem 0", minHeight: "90vh", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", marginBottom: "1.2rem" }}>
            <Link to="/planner" style={{ fontSize: "1.6rem", color: "#e67e22", textDecoration: "none", fontWeight: 600 }}>
              ← Edit Body Metrics
            </Link>
          </div>

          <span className="subheading">Your Custom Nutrition</span>
          <h2 className="heading-secondary" style={{ marginBottom: "4.8rem" }}>
            Weekly Diet Plan Dashboard 📋
          </h2>

          {/* Targets & Dashboard Header */}
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "15px",
            padding: "3.2rem",
            marginBottom: "4.8rem",
            display: "grid",
            gridTemplateColumns: "2fr 3fr",
            gap: "4rem"
          }} className="planner-dashboard">
            {/* Left Side: Targets */}
            <div>
              <h4 style={{ fontSize: "1.8rem", fontWeight: 600, color: "#aaa", marginBottom: "0.8rem" }}>AI CALCULATED TARGETS</h4>
              <p style={{ fontSize: "4.8rem", fontWeight: 800, color: "#e67e22" }}>{calTargets.dailyTarget} <span style={{ fontSize: "2rem", fontWeight: 500 }}>kcal / day</span></p>
              <div style={{ display: "flex", gap: "2.4rem", marginTop: "1.6rem" }}>
                <div>
                  <p style={{ fontSize: "1.3rem", color: "#999" }}>BMR</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 600 }}>{calTargets.bmr} kcal</p>
                </div>
                <div>
                  <p style={{ fontSize: "1.3rem", color: "#999" }}>TDEE</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 600 }}>{calTargets.tdee} kcal</p>
                </div>
                <div>
                  <p style={{ fontSize: "1.3rem", color: "#999" }}>Preference</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 600, color: inputs.diet === "vegan" ? "#2ecc71" : "#e67e22" }}>
                    {inputs.diet === "vegetarian" ? "Veg 🟢" : inputs.diet === "vegan" ? "Vegan 🌱" : "Non-Veg 🔴"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Macro Gauges */}
            <div>
              <h4 style={{ fontSize: "1.8rem", fontWeight: 600, color: "#aaa", marginBottom: "1.6rem" }}>Weekly Meal Plan Macro Balance</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                {/* Calories */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.4rem", marginBottom: "0.6rem" }}>
                    <span>Daily Energy: <strong>{planAverages.calories} kcal</strong> (Avg)</span>
                    <span style={{ color: "#aaa" }}>Target: {calTargets.dailyTarget} kcal</span>
                  </div>
                  <div style={{ height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (planAverages.calories / calTargets.dailyTarget) * 100)}%`, backgroundColor: "#e67e22", borderRadius: "5px" }}></div>
                  </div>
                </div>

                {/* Macros: P, C, F */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", marginBottom: "0.4rem" }}>
                      <span>Protein: <strong>{planAverages.protein}g</strong></span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (planAverages.protein / calTargets.macros.protein) * 100)}%`, backgroundColor: "#3498db", borderRadius: "3px" }}></div>
                    </div>
                    <p style={{ fontSize: "1.1rem", color: "#777", marginTop: "0.4rem" }}>Target: {calTargets.macros.protein}g</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", marginBottom: "0.4rem" }}>
                      <span>Carbs: <strong>{planAverages.carbs}g</strong></span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (planAverages.carbs / calTargets.macros.carbs) * 100)}%`, backgroundColor: "#2ecc71", borderRadius: "3px" }}></div>
                    </div>
                    <p style={{ fontSize: "1.1rem", color: "#777", marginTop: "0.4rem" }}>Target: {calTargets.macros.carbs}g</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", marginBottom: "0.4rem" }}>
                      <span>Fat: <strong>{planAverages.fat}g</strong></span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (planAverages.fat / calTargets.macros.fat) * 100)}%`, backgroundColor: "#e74c3c", borderRadius: "3px" }}></div>
                    </div>
                    <p style={{ fontSize: "1.1rem", color: "#777", marginTop: "0.4rem" }}>Target: {calTargets.macros.fat}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3.2rem", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ display: "flex", gap: "1.6rem" }}>
              <button
                onClick={handleGeneratePlan}
                disabled={loading || meals.length === 0}
                style={{
                  padding: "1.2rem 2.4rem",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  backgroundColor: "transparent",
                  border: "2px solid #e67e22",
                  color: "#e67e22",
                  borderRadius: "9px",
                  cursor: "none",
                  transition: "all 0.3s ease"
                }}
              >
                🔄 Re-Generate Plan
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
              {addedMessage && (
                <span style={{ fontSize: "1.4rem", color: "#2ecc71", fontWeight: 500 }}>
                  🎉 21 meals added to your cart successfully!
                </span>
              )}
              <button
                onClick={handleAddAllToCart}
                style={{
                  padding: "1.4rem 3.2rem",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  cursor: "none",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)"
                }}
                onMouseEnter={e => e.target.style.backgroundColor = "#219a52"}
                onMouseLeave={e => e.target.style.backgroundColor = "#27ae60"}
              >
                🛒 Add Full Weekly Plan (21 Meals) to Cart
              </button>
            </div>
          </div>

          {/* Weekly Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3.2rem" }}>
            {daysOfWeek.map((day) => {
              const dayMeals = weeklyPlan[day];
              if (!dayMeals) return null;
              
              const dayCals = dayMeals.breakfast.calories + dayMeals.lunch.calories + dayMeals.dinner.calories;

              return (
                <div
                  key={day}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "15px",
                    padding: "2.4rem",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                  }}
                >
                  {/* Day Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1.2rem" }}>
                    <h5 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#e67e22" }}>{day}</h5>
                    <span style={{ fontSize: "1.4rem", backgroundColor: "rgba(230,126,34,0.1)", color: "#e67e22", padding: "0.6rem 1.6rem", borderRadius: "50px", fontWeight: 600 }}>
                      Total: {dayCals} kcal
                    </span>
                  </div>

                  {/* Meals of the Day */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2.4rem" }} className="planner-day-meals">
                    {/* Breakfast */}
                    <MealSlotCard
                      label="🌅 Breakfast"
                      meal={dayMeals.breakfast}
                      onSwap={() => handleSwapMeal(day, "breakfast")}
                    />

                    {/* Lunch */}
                    <MealSlotCard
                      label="☀️ Lunch"
                      meal={dayMeals.lunch}
                      onSwap={() => handleSwapMeal(day, "lunch")}
                    />

                    {/* Dinner */}
                    <MealSlotCard
                      label="🌙 Dinner"
                      meal={dayMeals.dinner}
                      onSwap={() => handleSwapMeal(day, "dinner")}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

const MealSlotCard = ({ label, meal, onSwap }) => {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const macros = getMealMacros(meal.name);

  const handleAddSingle = () => {
    addToCart(meal);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "11px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s ease",
    }} className="meal-slot-card">
      <div style={{ position: "relative" }}>
        <img
          src={meal.image}
          alt={meal.name}
          style={{ height: "14rem", width: "100%", objectFit: "cover" }}
          onError={(e) => e.target.src = "/img/meals/meal-1.jpg"}
        />
        <span style={{
          position: "absolute",
          top: "1.2rem",
          left: "1.2rem",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: 600,
          padding: "0.4rem 1rem",
          borderRadius: "5px"
        }}>
          {label}
        </span>
      </div>

      <div style={{ padding: "1.6rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <span className={`tag tag--${meal.category}`} style={{ fontSize: "0.9rem", padding: "0.2rem 0.6rem", alignSelf: "flex-start", marginBottom: "0.8rem" }}>
          {categoryLabels[meal.category] || meal.category}
        </span>
        <h6 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "1rem", color: "#e0e0e0" }}>{meal.name}</h6>
        
        {/* Calorie & Macros */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginBottom: "1.6rem" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "1.1rem", color: "#777" }}>Energy</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "#e67e22" }}>{meal.calories} kcal</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "1.1rem", color: "#777" }}>Protein</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "#3498db" }}>{macros.protein}g</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "1.1rem", color: "#777" }}>Carbs/Fat</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 500 }}>{macros.carbs}g/{macros.fat}g</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
          <button
            onClick={onSwap}
            style={{
              flex: 1,
              padding: "0.8rem",
              fontSize: "1.2rem",
              fontWeight: 500,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#aaa",
              borderRadius: "6px",
              cursor: "none",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.target.style.backgroundColor = "rgba(255,255,255,0.05)"}
          >
            🔄 Swap
          </button>
          <button
            onClick={handleAddSingle}
            style={{
              flex: 1.5,
              padding: "0.8rem",
              fontSize: "1.2rem",
              fontWeight: 500,
              backgroundColor: added ? "#27ae60" : "#e67e22",
              border: "none",
              color: "white",
              borderRadius: "6px",
              cursor: "none",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => e.target.style.backgroundColor = added ? "#27ae60" : "#cf711f"}
            onMouseLeave={e => e.target.style.backgroundColor = added ? "#27ae60" : "#e67e22"}
          >
            {added ? "Added! ✓" : "Add 🛒"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlannerResult;
