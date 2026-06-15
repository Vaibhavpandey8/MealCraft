import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import { API_BASE_URL } from "../utils/api";

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

const AIPlanner = () => {
  const navigate = useNavigate();

  // Form states
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [diet, setDiet] = useState("vegetarian");

  // App data states
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch meals
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`);
        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch meals in planner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  const calculateTargets = () => {
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

  const handleGeneratePlan = (e) => {
    if (e) e.preventDefault();
    if (meals.length === 0) return;

    const targets = calculateTargets();

    // Filter meals by diet type
    let allowedMeals = [];
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

    // Save outputs and inputs to localStorage
    localStorage.setItem("omni_weekly_plan", JSON.stringify(newPlan));
    localStorage.setItem("omni_cal_targets", JSON.stringify(targets));
    localStorage.setItem("omni_planner_inputs", JSON.stringify({ age, gender, weight, height, activity, goal, diet }));

    // Redirect to results page
    navigate("/planner-result");
  };

  return (
    <>
      <CustomCursor />
      <main style={{ padding: "9.6rem 0", minHeight: "90vh", position: "relative", zIndex: 1 }}>
        <div className="container">
          <span className="subheading">Personalized Nutrition</span>
          <h2 className="heading-secondary" style={{ marginBottom: "1.2rem" }}>
            AI Diet & Meal Planner 🤖
          </h2>
          <p style={{ fontSize: "1.6rem", color: "#ccc", marginBottom: "4.8rem", maxWidth: "75rem" }}>
            Input your body metrics and activity details. Our AI engine uses the **Mifflin-St Jeor Equation** to calculate your exact caloric & macro needs, and maps out a weekly plan using authenticated Indian meals.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "4.8rem" }} className="planner-layout-grid">
            {/* Input Form Section */}
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "15px",
              padding: "4rem",
              backdropFilter: "blur(8px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}>
              <h3 style={{ fontSize: "2.2rem", fontWeight: 600, color: "#e67e22", marginBottom: "3.2rem", borderBottom: "1px solid rgba(230, 126, 34, 0.2)", paddingBottom: "1.2rem" }}>
                Step 1: Your Body Metrics
              </h3>

              <form onSubmit={handleGeneratePlan} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.4rem" }} className="planner-form">
                <div>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Age (years)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  >
                    <option value="male" style={{ background: "#222" }}>Male</option>
                    <option value="female" style={{ background: "#222" }}>Female</option>
                    <option value="other" style={{ background: "#222" }}>Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Daily Activity Level</label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  >
                    {Object.entries(activityFactors).map(([key, val]) => (
                      <option key={key} value={key} style={{ background: "#222" }}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Dietary Preference</label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  >
                    <option value="vegetarian" style={{ background: "#222" }}>Veg Only 🟢</option>
                    <option value="vegan" style={{ background: "#222" }}>Vegan Only 🌱</option>
                    <option value="jain" style={{ background: "#222" }}>Jain Friendly 🔸</option>
                    <option value="fasting" style={{ background: "#222" }}>Fasting / Satvik 🌾</option>
                    <option value="paleo" style={{ background: "#222" }}>Non-Veg / All 🔴</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "1.4rem", color: "#ccc", display: "block", marginBottom: "0.8rem", fontWeight: 500 }}>Fitness Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid #555", borderRadius: "9px", color: "white" }}
                  >
                    {Object.entries(goals).map(([key, val]) => (
                      <option key={key} value={key} style={{ background: "#222" }}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "span 2", marginTop: "1.2rem" }}>
                  <button
                    type="submit"
                    disabled={loading || meals.length === 0}
                    style={{
                      width: "100%",
                      padding: "1.6rem",
                      fontSize: "1.8rem",
                      fontWeight: 600,
                      backgroundColor: "#e67e22",
                      color: "white",
                      border: "none",
                      borderRadius: "9px",
                      cursor: "none",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(230, 126, 34, 0.4)"
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = "#cf711f"}
                    onMouseLeave={e => e.target.style.backgroundColor = "#e67e22"}
                  >
                    {loading ? "Loading Meals Database..." : "Generate AI Weekly Meal Plan ⚡"}
                  </button>
                </div>
              </form>
            </div>

            {/* Explanation Section */}
            <div style={{
              background: "rgba(230, 126, 34, 0.03)",
              border: "1px solid rgba(230, 126, 34, 0.15)",
              borderRadius: "15px",
              padding: "4rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}>
              <h4 style={{ fontSize: "2rem", color: "#e67e22", marginBottom: "1.6rem", fontWeight: 600 }}>Why Use Our AI Planner?</h4>
              <ul style={{ fontSize: "1.6rem", color: "#ccc", lineHeight: "1.8", display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                <li>🔬 <strong>Mifflin-St Jeor formula</strong> is the current gold standard in clinical dietetics to gauge daily caloric expenditure.</li>
                <li>🍽️ <strong>Authentic Indian dishes</strong> are matched dynamically to prevent low-calorie hunger and guarantee taste.</li>
                <li>🛒 <strong>One-Click Checkout</strong> exports the full weekly schedule into your cart.</li>
                <li>⚖️ <strong>Balanced Macros</strong> tailored specifically for Weight Loss, maintenance, or high-protein bodybuilding.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AIPlanner;
