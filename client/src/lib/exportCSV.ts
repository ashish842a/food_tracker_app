import { FoodEntry } from "./foodStore";

export function exportMonthlyCSV(entries: FoodEntry[], monthLabel: string) {
  const header = "Date,Food Item,Quantity,Meal Type,Price";
  const rows = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const price = e.price !== null ? e.price.toString() : "";
      const foodName = `"${e.foodName.replace(/"/g, '""')}"`;
      const quantity = `"${(e.quantity || "").replace(/"/g, '""')}"`;
      return `${e.date},${foodName},${quantity},${e.mealType},${price}`;
    });

  const total = entries.filter(e => e.price !== null).reduce((s, e) => s + (e.price || 0), 0);
  rows.push("");
  rows.push(`,,,,`);
  rows.push(`,,,Total Expense,${total}`);

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `food-report-${monthLabel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
