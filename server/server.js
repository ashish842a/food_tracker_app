const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");   // ✅ ADD THIS
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();


// ✅ MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));   // ✅ LOGGER (IMPORTANT POSITION)


// ✅ ROUTES
app.use("/api/entries", require("./routes/entries"));
app.use("/api/auth", require("./routes/auth"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
