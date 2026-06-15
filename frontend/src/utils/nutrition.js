export const dishMacros = {
  "paneer butter masala": { protein: 15, carbs: 18, fat: 35 },
  "dal makhani": { protein: 12, carbs: 45, fat: 18 },
  "veg dum biryani": { protein: 10, carbs: 70, fat: 12 },
  "chole bhature": { protein: 15, carbs: 75, fat: 25 },
  "butter chicken": { protein: 32, carbs: 12, fat: 42 },
  "aloo paratha platter": { protein: 8, carbs: 55, fat: 12 },
  "paneer tikka salad": { protein: 18, carbs: 12, fat: 18 },
  "yellow dal tadka": { protein: 11, carbs: 38, fat: 6 },
  "shahi paneer kofta": { protein: 14, carbs: 22, fat: 38 },
  "kadhai paneer": { protein: 18, carbs: 15, fat: 36 },
  "masala dosa platter": { protein: 6, carbs: 58, fat: 8 },
  "chicken tikka masala": { protein: 35, carbs: 14, fat: 36 },
  "mutton rogan josh": { protein: 38, carbs: 10, fat: 48 },
  "pav bhaji special": { protein: 11, carbs: 68, fat: 20 },
  "rajma chawal platter": { protein: 14, carbs: 65, fat: 8 },
  "malai kofta special": { protein: 11, carbs: 25, fat: 42 },
  "tandoori chicken platter": { protein: 42, carbs: 8, fat: 25 },
  "samosa chana chaat": { protein: 8, carbs: 48, fat: 10 },
  "palak paneer": { protein: 16, carbs: 12, fat: 32 },
  "chicken dum biryani": { protein: 30, carbs: 65, fat: 18 },
  "bhindi masala fry": { protein: 4, carbs: 24, fat: 12 },
  "gobi manchurian (desi style)": { protein: 6, carbs: 45, fat: 16 },
  "amritsari paneer bhurji": { protein: 20, carbs: 10, fat: 30 },
  "egg curry feast": { protein: 18, carbs: 12, fat: 32 },
  "classic matar paneer": { protein: 16, carbs: 18, fat: 32 },
  "baingan bharta": { protein: 5, carbs: 22, fat: 14 },
  "kadhai chicken": { protein: 36, carbs: 12, fat: 35 },
  "aloo gobhi masala": { protein: 5, carbs: 32, fat: 14 }
};

export const getMealMacros = (name) => {
  const normalized = name.toLowerCase().trim();
  if (dishMacros[normalized]) return dishMacros[normalized];
  
  // Fuzzy lookup/fallbacks based on keywords
  if (normalized.includes("chicken")) return { protein: 35, carbs: 10, fat: 25 };
  if (normalized.includes("mutton")) return { protein: 35, carbs: 10, fat: 35 };
  if (normalized.includes("paneer")) return { protein: 16, carbs: 15, fat: 30 };
  if (normalized.includes("dal")) return { protein: 12, carbs: 40, fat: 8 };
  if (normalized.includes("biryani")) return { protein: 12, carbs: 65, fat: 15 };
  if (normalized.includes("salad")) return { protein: 15, carbs: 10, fat: 10 };
  if (normalized.includes("roti") || normalized.includes("paratha") || normalized.includes("nan")) {
    return { protein: 6, carbs: 45, fat: 5 };
  }
  
  return { protein: 10, carbs: 35, fat: 15 }; // Default fallback
};
