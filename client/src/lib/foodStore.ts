const API_URL = "http://localhost:5000/api/entries";

export type MealType =
  | "Breakfast"
  | "Lunch"
  | "Evening Tea / Snacks"
  | "Dinner";

export interface FoodEntry {
  id: string;
  foodName: string;
  quantity: string;
  price: number | null;
  mealType: MealType;
  date: string;
  createdAt: string;
}

function getToken() {
  return localStorage.getItem("token");
}

/* ---------------- API CALLS ---------------- */

export async function getUserEntries(): Promise<FoodEntry[]> {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: getToken() || "",
    },
  });

  return res.json();
}

export async function addEntry(entry: Omit<FoodEntry, "id" | "createdAt">) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken() || "",
    },
    body: JSON.stringify(entry),
  });

  return res.json();
}

export async function updateEntry(id: string, updates: Partial<FoodEntry>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken() || "",
    },
    body: JSON.stringify(updates),
  });

  return res.json();
}

export async function deleteEntry(id: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: getToken() || "",
    },
  });

  return res.json();
}

export async function getEntriesByDate(date: string): Promise<FoodEntry[]> {
  const res = await fetch(`${API_URL}/date/${date}`, {
    headers: {
      Authorization: getToken() || "",
    },
  });

  return res.json();
}

/* ========================================================= */
/* ✅ EXPENSE HELPERS */
/* ========================================================= */

/* ✅ TOTAL EXPENSE */

export function getTotalExpense(entries: FoodEntry[]): number {
  return entries.reduce((total, entry) => {
    return total + (entry.price || 0);
  }, 0);
}

/* ✅ EXPENSE BY MEAL TYPE (THIS FIXES YOUR ERROR) */

export function getMealTypeExpense(
  entries: FoodEntry[],
  mealType: MealType
): number {
  return entries.reduce((total, entry) => {
    if (entry.mealType !== mealType) return total;
    return total + (entry.price || 0);
  }, 0);
}

/* ✅ DAILY EXPENSE BREAKDOWN */

export function getDailyExpenseBreakdown(entries: FoodEntry[]) {
  const breakdown: Record<MealType, number> = {
    Breakfast: 0,
    Lunch: 0,
    "Evening Tea / Snacks": 0,
    Dinner: 0,
  };

  entries.forEach((entry) => {
    breakdown[entry.mealType] += entry.price || 0;
  });

  return breakdown;
}
