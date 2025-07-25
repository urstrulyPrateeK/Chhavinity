import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5001; 

// CORS configuration - Temporary wildcard for testing
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Health check endpoint for Railway
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Chhavinity backend is healthy!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Additional health check at root for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Keep-alive endpoint to prevent sleeping
app.get("/api/ping", (req, res) => {
  res.status(200).json({ 
    message: "pong",
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check environment and cookie settings
app.get("/api/debug", (req, res) => {
  res.status(200).json({
    nodeEnv: process.env.NODE_ENV,
    cookieSettings: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true
    },
    headers: req.headers,
    cookies: req.cookies
  });
});

// Root route
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Welcome to Chhavinity Chat App Backend! 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Backend only serves API, frontend is deployed separately on Vercel
// Removed production static file serving since frontend is on Vercel

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Connecting to database...`);
    connectDB();
});