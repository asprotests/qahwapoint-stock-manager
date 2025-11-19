import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI environment variable is not defined");
    }

    console.log("📍 MONGODB_URI is set");

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    // Log specific error types
    if (error.message.includes("authentication")) {
      console.error(
        "🔐 Authentication failed - Check your username and password"
      );
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("🌐 Network error - Check your connection string");
    } else if (error.message.includes("timeout")) {
      console.error(
        "⏰ Connection timeout - Check network access in MongoDB Atlas"
      );
    }

    throw error;
  }
};

export default connectDB;
