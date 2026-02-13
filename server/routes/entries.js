const express = require("express");
const FoodEntry = require("../models/FoodEntry");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ✅ ADD ENTRY
router.post("/", authMiddleware, async (req, res) => {
  try {
    const entry = await FoodEntry.create({
      ...req.body,
      userId: req.user.id,
    });

    res.json(entry);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET ALL USER ENTRIES
router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await FoodEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(entries);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ FILTER BY DATE
router.get("/date/:date", authMiddleware, async (req, res) => {
  try {
    const entries = await FoodEntry.find({
      userId: req.user.id,
      date: req.params.date,
    });

    res.json(entries);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE ENTRY
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await FoodEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(entry);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE ENTRY
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await FoodEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
