import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
import { connect } from "mongoose";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001; 

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to Chhavinity Chat App Backend! 🚀");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB();
});