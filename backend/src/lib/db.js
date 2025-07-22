import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error in connecting to MongoDB", error);
    // Don't exit process immediately, let Railway health check handle it
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};