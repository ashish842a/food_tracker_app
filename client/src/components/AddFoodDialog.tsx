import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addEntry, updateEntry, FoodEntry, MealType } from "@/lib/foodStore";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onAdded: (entry: FoodEntry) => void;
  editEntry?: FoodEntry | null;
  onEdit?: (entry: FoodEntry) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Evening Tea / Snacks", "Dinner"];

export default function AddFoodDialog({ onAdded, editEntry, onEdit, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [foodName, setFoodName] = useState(editEntry?.foodName || "");
  const [quantity, setQuantity] = useState(editEntry?.quantity || "");
  const [price, setPrice] = useState(editEntry?.price?.toString() || "");
  const [mealType, setMealType] = useState<MealType>(editEntry?.mealType || "Lunch");
  const [date, setDate] = useState(editEntry?.date || new Date().toISOString().slice(0, 10));
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const resetForm = () => {
    setFoodName("");
    setQuantity("");
    setPrice("");
    setMealType("Lunch");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !foodName.trim()) return;

    if (editEntry && onEdit) {
      updateEntry(editEntry.id, {
        foodName: foodName.trim(),
        quantity: quantity.trim(),
        price: price ? parseFloat(price) : null,
        mealType,
        date,
      }).then(updated => {
        if (updated) onEdit(updated);
        resetForm();
        setIsOpen(false);
      });
    } else {
      addEntry({
        userId: user.id,
        foodName: foodName.trim(),
        quantity: quantity.trim(),
        price: price ? parseFloat(price) : null,
        mealType,
        date,
      }).then(entry => {
        if (entry) onAdded(entry);
        resetForm();
        setIsOpen(false);
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Food Entry</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editEntry ? "Edit Entry" : "Add Food Entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="foodName">Food Item *</Label>
            <Input id="foodName" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="e.g. Rice, Dal, Chicken" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity / Amount</Label>
            <Input id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 2 plates, 1 bowl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (optional)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="₹0.00" />
          </div>
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">{editEntry ? "Update Entry" : "Add Entry"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
