// localStorage-based food entry store, scoped per user

export type MealType = "Breakfast" | "Lunch" | "Evening Tea / Snacks" | "Dinner";

export interface FoodEntry {
  id: string;
  userId: string;
  foodName: string;
  quantity: string;
  price: number | null;
  mealType: MealType;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

const ENTRIES_KEY = "food_tracker_entries";

function getAllEntries(): FoodEntry[] {
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllEntries(entries: FoodEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getUserEntries(userId: string): FoodEntry[] {
  return getAllEntries().filter(e => e.userId === userId);
}

export function addEntry(entry: Omit<FoodEntry, "id" | "createdAt">): FoodEntry {
  const all = getAllEntries();
  const newEntry: FoodEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(newEntry);
  saveAllEntries(all);
  return newEntry;
}

export function updateEntry(id: string, userId: string, updates: Partial<Omit<FoodEntry, "id" | "userId" | "createdAt">>): FoodEntry | null {
  const all = getAllEntries();
  const idx = all.findIndex(e => e.id === id && e.userId === userId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  saveAllEntries(all);
  return all[idx];
}

export function deleteEntry(id: string, userId: string): boolean {
  const all = getAllEntries();
  const filtered = all.filter(e => !(e.id === id && e.userId === userId));
  if (filtered.length === all.length) return false;
  saveAllEntries(filtered);
  return true;
}

export function getEntriesByDate(userId: string, date: string): FoodEntry[] {
  return getUserEntries(userId).filter(e => e.date === date);
}

export function getEntriesByMonth(userId: string, year: number, month: number): FoodEntry[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return getUserEntries(userId).filter(e => e.date.startsWith(prefix));
}

export function getMonthlyExpense(userId: string, year: number, month: number): number {
  return getEntriesByMonth(userId, year, month)
    .filter(e => e.price !== null)
    .reduce((sum, e) => sum + (e.price || 0), 0);
}

export function getDailyExpenseBreakdown(userId: string, year: number, month: number): Record<string, number> {
  const entries = getEntriesByMonth(userId, year, month).filter(e => e.price !== null);
  const breakdown: Record<string, number> = {};
  entries.forEach(e => {
    breakdown[e.date] = (breakdown[e.date] || 0) + (e.price || 0);
  });
  return breakdown;
}

export function getMealTypeExpense(userId: string, year: number, month: number): Record<MealType, number> {
  const entries = getEntriesByMonth(userId, year, month).filter(e => e.price !== null);
  const result: Record<MealType, number> = { Breakfast: 0, Lunch: 0, "Evening Tea / Snacks": 0, Dinner: 0 };
  entries.forEach(e => { result[e.mealType] += e.price || 0; });
  return result;
}
