const mongoose = require("mongoose");

const foodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  price: { type: Number, default: null },
  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Evening Tea / Snacks", "Dinner"],
    required: true,
  },
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FoodEntry", foodEntrySchema);
